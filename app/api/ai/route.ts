import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import {
  checkTeenSafety,
  completeWithFallback,
  GroqRequestError,
  normalizeGroqMessages,
  type GroqMessage,
  type GroqTool,
  type GroqToolCall,
} from '@/lib/ai/groq';
import { getAiActionForRequestedModel } from '@/lib/ai/config';
import {
  authorizeAiAction,
  createSseResponse,
  textEvents,
} from '@/lib/ai/http';
import { recordAiUsage } from '@/lib/ai/quota';
import { getBoundedSchoolData } from '@/lib/ai/school-data';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function getSystemPrompt(localDateStr: string, todayIso: string): string {
  return `You are Aurora, a student study guide. Today is ${localDateStr} (ISO: ${todayIso}).
Guide learning with concise explanations, hints, and study planning. Do not complete graded work.
Use get_school_data for schedule, workload, class, test, or grade queries. Use add_homework to create tasks. Use add_test to create upcoming tests/exams. Use ask_user_question for clarifying options.
For dates, compute date/dueDate as YYYY-MM-DD based on today (${localDateStr}).`.trim();
}

async function getStudentClassNames(userId: string): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('classes')
      .select('name')
      .eq('user_id', userId)
      .limit(20);
    return (data || []).map((c: any) => c.name).filter(Boolean);
  } catch {
    return [];
  }
}

function getToolsForUser(classNames: string[]): GroqTool[] {
  const classListText = classNames.length > 0 ? classNames.join(', ') : 'None';
  return [
    {
      type: 'function',
      function: {
        name: 'get_school_data',
        description:
          'Read a bounded list of the authenticated student’s classes, homework, tests, and any saved grade percentages.',
        parameters: { type: 'object', properties: {} },
      },
    },
    {
      type: 'function',
      function: {
        name: 'ask_user_question',
        description:
          'Ask the user a single multiple-choice question when requirements are missing or choices are needed.',
        parameters: {
          type: 'object',
          properties: {
            question: { type: 'string', description: 'The question prompt for the user' },
            options: {
              type: 'array',
              description: 'Between 2 and 4 options for the user to choose from',
              items: { type: 'string' },
            },
          },
          required: ['question', 'options'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'start_flashcards',
        description:
          'Create a flashcard set when the user explicitly asks to study with flashcards.',
        parameters: {
          type: 'object',
          properties: {
            topic: { type: 'string', description: 'The flashcard set topic' },
            flashcards: {
              type: 'array',
              description: 'List of flashcard objects',
              items: {
                type: 'object',
                properties: {
                  front: { type: 'string', description: 'Question or term on front of card' },
                  back: { type: 'string', description: 'Answer or definition on back of card' },
                },
                required: ['front', 'back'],
              },
            },
          },
          required: ['topic', 'flashcards'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'start_quiz',
        description:
          'Create a multiple-choice quiz when the user explicitly asks for one.',
        parameters: {
          type: 'object',
          properties: {
            topic: { type: 'string', description: 'The quiz topic' },
            questions: {
              type: 'array',
              description: 'List of multiple-choice questions',
              items: {
                type: 'object',
                properties: {
                  question: { type: 'string', description: 'The question prompt' },
                  options: {
                    type: 'array',
                    description: 'Four answer choices',
                    items: { type: 'string' },
                  },
                  correctAnswer: { type: 'string', description: 'The correct choice' },
                  explanation: { type: 'string', description: 'Explanation of the answer' },
                },
                required: [
                  'question',
                  'options',
                  'correctAnswer',
                  'explanation',
                ],
              },
            },
          },
          required: ['topic', 'questions'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'add_homework',
        description: `Add one or multiple homework assignments to the student's enrolled classes. Enrolled classes: [${classListText}]. Pass an "assignments" array for multiple assignments, or single assignment properties directly.`,
        parameters: {
          type: 'object',
          properties: {
            assignments: {
              type: 'array',
              description: 'List of homework assignments to add (use when adding multiple assignments at once).',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string', description: 'Title or name of the homework assignment' },
                  className: {
                    type: 'string',
                    enum: classNames.length > 0 ? classNames : undefined,
                    description: `The enrolled class name. Available enrolled classes: ${classListText}`,
                  },
                  dueDate: { type: 'string', description: 'Optional due date formatted as YYYY-MM-DD' },
                  priority: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Priority level' },
                  description: { type: 'string', description: 'Detailed description, notes, or instructions for the assignment' },
                  links: {
                    type: 'array',
                    description: 'Relevant URLs or reference web links for this assignment',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string', description: 'Label or title of the link (e.g. Worksheet PDF)' },
                        url: { type: 'string', description: 'Web URL' },
                      },
                      required: ['url'],
                    },
                  },
                },
                required: ['title', 'className'],
              },
            },
            title: { type: 'string', description: 'Title of a single homework assignment' },
            className: {
              type: 'string',
              enum: classNames.length > 0 ? classNames : undefined,
              description: `The enrolled class name. Available enrolled classes: ${classListText}`,
            },
            dueDate: { type: 'string', description: 'Optional due date formatted as YYYY-MM-DD' },
            priority: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Priority level' },
            description: { type: 'string', description: 'Detailed description, notes, or instructions for the assignment' },
            links: {
              type: 'array',
              description: 'Relevant URLs or reference web links for this assignment',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string', description: 'Label or title of the link (e.g. Worksheet PDF)' },
                  url: { type: 'string', description: 'Web URL' },
                },
                required: ['url'],
              },
            },
          },
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'add_test',
        description: `Add one or multiple upcoming tests/exams to the student's enrolled classes. Enrolled classes: [${classListText}]. Pass a "tests" array for multiple tests, or single test properties directly.`,
        parameters: {
          type: 'object',
          properties: {
            tests: {
              type: 'array',
              description: 'List of upcoming tests/exams to add in bulk.',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string', description: 'Title or topic of the test (e.g. Unit 3 Exam)' },
                  className: {
                    type: 'string',
                    enum: classNames.length > 0 ? classNames : undefined,
                    description: `The enrolled class name. Available enrolled classes: ${classListText}`,
                  },
                  date: { type: 'string', description: 'Test date formatted as YYYY-MM-DD' },
                  testType: { type: 'string', enum: ['exam', 'quiz', 'midterm', 'final', 'project'], description: 'Type of test' },
                  description: { type: 'string', description: 'Optional details or notes' },
                },
                required: ['title', 'className'],
              },
            },
            title: { type: 'string', description: 'Title of a single test' },
            className: {
              type: 'string',
              enum: classNames.length > 0 ? classNames : undefined,
              description: `The enrolled class name. Available enrolled classes: ${classListText}`,
            },
            date: { type: 'string', description: 'Test date formatted as YYYY-MM-DD' },
            testType: { type: 'string', enum: ['exam', 'quiz', 'midterm', 'final', 'project'] },
            description: { type: 'string' },
          },
        },
      },
    },
  ];
}



const questionToolSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).min(1),
});

const flashcardSchema = z.object({
  topic: z.string().default('Flashcards'),
  flashcards: z
    .array(
      z.object({
        front: z.string(),
        back: z.string(),
      })
    )
    .min(1),
});

const quizSchema = z.object({
  topic: z.string().default('Quiz'),
  questions: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()),
        correctAnswer: z.string(),
        explanation: z.string().optional().default(''),
      })
    )
    .min(1),
});

function parseToolArguments(call: GroqToolCall) {
  try {
    return JSON.parse(call.function.arguments || '{}');
  } catch {
    return {};
  }
}


function uiToolEvent(call: GroqToolCall) {
  const args = parseToolArguments(call);
  if (call.function.name === 'ask_user_question') {
    const parsed = questionToolSchema.safeParse(args);
    return parsed.success
      ? {
          toolCall: 'ask_user_question',
          toolArgs: parsed.data,
          done: false,
        }
      : null;
  }
  if (call.function.name === 'start_flashcards') {
    const parsed = flashcardSchema.safeParse(args);
    return parsed.success
      ? {
          toolCall: 'start_flashcards',
          toolArgs: parsed.data,
          done: false,
        }
      : null;
  }
  if (call.function.name === 'start_quiz') {
    const parsed = quizSchema.safeParse(args);
    return parsed.success
      ? { toolCall: 'start_quiz', toolArgs: parsed.data, done: false }
      : null;
  }
  if (call.function.name === 'add_homework') {
    return {
      toolCall: 'add_homework',
      toolArgs: args,
      done: false,
    };
  }
  if (call.function.name === 'add_test') {
    return {
      toolCall: 'add_test',
      toolArgs: args,
      done: false,
    };
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = getAiActionForRequestedModel(body.model);
    const access = await authorizeAiAction(req, action);
    if (!access.ok) return access.response;

    const messages = normalizeGroqMessages(body.messages, body.prompt);
    const lastUserMessage = [...messages]
      .reverse()
      .find((message) => message.role === 'user')?.content;

    if (!lastUserMessage?.trim()) {
      return NextResponse.json(
        { error: 'A message is required.' },
        { status: 400 }
      );
    }

    const inputSafety = await checkTeenSafety(
      lastUserMessage,
      'input',
      req.signal
    );
    if (!inputSafety.safe) {
      return NextResponse.json(
        {
          error: 'This request cannot be handled by the student AI.',
          details:
            'Try rephrasing it as a safe, age-appropriate learning question.',
        },
        { status: 400 }
      );
    }

    const now = new Date();
    const todayIso = now.toISOString().split('T')[0];
    const localDateStr = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const userClassNames = await getStudentClassNames(access.user.id);
    const tools = getToolsForUser(userClassNames);

    const conversationHistory: GroqMessage[] = [
      { role: 'system', content: getSystemPrompt(localDateStr, todayIso) },
      ...messages.filter((message) => message.role !== 'system'),
    ];

    const events: Array<Record<string, unknown>> = [];
    let currentStep = 0;
    const MAX_TOOL_CHAIN_STEPS = 3;
    let result: any = null;
    const allToolDataStrings: string[] = [];

    while (currentStep < MAX_TOOL_CHAIN_STEPS) {
      currentStep++;
      const isFinalSynthesisStep = currentStep === MAX_TOOL_CHAIN_STEPS;

      result = await completeWithFallback({
        action,
        messages: conversationHistory,
        tools: isFinalSynthesisStep ? undefined : tools,
        toolChoice: isFinalSynthesisStep ? 'none' : 'auto',
        temperature: action === 'quick' ? 0.3 : 0.5,
        signal: req.signal,
      });

      const acceptedToolCalls = result.toolCalls || [];
      if (!acceptedToolCalls.length) {
        // Model provided natural language response or no further tool calls required
        break;
      }

      const toolResults: GroqMessage[] = [];
      const executableCalls: GroqToolCall[] = [];

      for (const call of acceptedToolCalls) {
        const uiEvent = uiToolEvent(call);
        if (uiEvent) {
          events.push(uiEvent);
          continue;
        }

        if (call.function.name === 'get_school_data') {
          const data = await getBoundedSchoolData(access.user.id);
          executableCalls.push(call);
          allToolDataStrings.push(data);
          toolResults.push({
            role: 'tool',
            tool_call_id: call.id,
            name: call.function.name,
            content: data.slice(0, 32_000),
          });
          events.push({
            toolCall: 'get_school_data',
            toolArgs: {},
            done: false,
          });
        }
      }

      if (!executableCalls.length) {
        break;
      }

      // Append assistant tool request & tool outputs into conversation context for next chained step
      conversationHistory.push({
        role: 'assistant',
        content: result.content || null,
        tool_calls: executableCalls,
      });
      conversationHistory.push(...toolResults);
    }

    if (!result?.content || !result.content.trim()) {
      const dataStr = allToolDataStrings.join('\n');
      try {
        const parsedData = JSON.parse(dataStr);
        if (parsedData.classes && Array.isArray(parsedData.classes)) {
          const names = parsedData.classes.map((c: any) => c.name).filter(Boolean);
          result = {
            ...result,
            content: names.length > 0
              ? `Here are your enrolled classes:\n\n${names.map((n: string) => `• **${n}**`).join('\n')}`
              : 'You currently have no classes enrolled.',
          };
        } else {
          result = {
            ...result,
            content: 'Your study and schedule information is ready.',
          };
        }
      } catch {
        result = {
          ...result,
          content: 'Your study summary is ready.',
        };
      }
    }

    const outputSafety = await checkTeenSafety(
      result.content,
      'output',
      req.signal
    );
    if (!outputSafety.safe) {
      return NextResponse.json(
        {
          error: 'The AI response did not pass the student-safety check.',
          details: 'Please try a different learning question.',
        },
        { status: 502 }
      );
    }

    await recordAiUsage(
      action,
      result.model,
      result.usage.prompt_tokens,
      result.usage.completion_tokens
    );

    return createSseResponse([
      ...events,
      ...textEvents(result.content),
      {
        usage: {
          promptTokens: result.usage.prompt_tokens || 0,
          completionTokens: result.usage.completion_tokens || 0,
          totalTokens: result.usage.total_tokens || 0,
        },
      },
    ]);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request cancelled.' }, { status: 408 });
    }
    if (error instanceof GroqRequestError) {
      return NextResponse.json(
        {
          error: 'AI service unavailable',
          details:
            error.status === 429
              ? 'The free AI capacity is temporarily busy. Try again shortly.'
              : error.message,
        },
        {
          status: error.status === 429 ? 429 : 502,
          headers: error.retryAfter
            ? { 'Retry-After': error.retryAfter }
            : undefined,
        }
      );
    }
    console.error('Aurora AI request failed.');
    return NextResponse.json(
      { error: 'Failed to process AI request.' },
      { status: 500 }
    );
  }
}
