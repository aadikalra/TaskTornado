import type {
  ChatMessage,
  ToolName,
} from '@/components/editor/use-chat';
import type { NextRequest } from 'next/server';

import {
  createUIMessageStream,
  createUIMessageStreamResponse,
} from 'ai';
import { NextResponse } from 'next/server';
import { createSlateEditor, nanoid } from 'platejs';
import { z } from 'zod';

import { BaseEditorKit } from '@/components/editor/editor-base-kit';
import { authorizeAiAction } from '@/lib/ai/http';
import {
  checkTeenSafety,
  completeWithFallback,
} from '@/lib/ai/groq';
import { recordAiUsage } from '@/lib/ai/quota';

import {
  getChooseToolPrompt,
  getCommentPrompt,
  getEditPrompt,
  getGeneratePrompt,
} from './prompts';

const commentSchema = z.array(
  z.object({
    blockId: z.string().max(200),
    content: z.string().max(4000),
    comments: z.string().max(2000),
  })
);

function extractArray(text: string) {
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start < 0 || end <= start) throw new Error('Invalid comment response.');
  return JSON.parse(text.slice(start, end + 1));
}
export async function POST(req: NextRequest) {
  const access = await authorizeAiAction(req, 'copilot');
  if (!access.ok) return access.response;

  try {
    const { ctx, messages: messagesRaw = [] } = await req.json();
    if (!ctx?.children) {
      return NextResponse.json(
        { error: 'Editor context is required.' },
        { status: 400 }
      );
    }

    const editor = createSlateEditor({
      plugins: BaseEditorKit,
      selection: ctx.selection,
      value: ctx.children,
    });
    const isSelecting = editor.api.isExpanded();
    let toolName = ctx.toolName as ToolName | undefined;

    if (!toolName) {
      const classifierPrompt = getChooseToolPrompt({
        messages: messagesRaw as ChatMessage[],
      });
      const choice = await completeWithFallback({
        action: 'quick',
        messages: [
          {
            role: 'system',
            content:
              'Return exactly one word: generate, edit, or comment.',
          },
          { role: 'user', content: classifierPrompt.slice(0, 12_000) },
        ],
        temperature: 0,
        maxTokens: 12,
        signal: req.signal,
      });
      const candidate = choice.content.trim().toLowerCase();
      toolName =
        candidate.includes('comment')
          ? 'comment'
          : candidate.includes('edit') && isSelecting
            ? 'edit'
            : 'generate';
    }

    const prompt =
      toolName === 'comment'
        ? getCommentPrompt(editor, {
            messages: messagesRaw as ChatMessage[],
          })
        : toolName === 'edit'
          ? getEditPrompt(editor, {
              isSelecting,
              messages: messagesRaw as ChatMessage[],
            })
          : getGeneratePrompt(editor, {
              messages: messagesRaw as ChatMessage[],
            });

    const inputSafety = await checkTeenSafety(
      prompt.slice(0, 12_000),
      'input',
      req.signal
    );
    if (!inputSafety.safe) {
      return NextResponse.json(
        { error: 'This editor request cannot be processed.' },
        { status: 400 }
      );
    }

    const result = await completeWithFallback({
      action: toolName === 'comment' ? 'grader' : 'copilot',
      messages: [
        {
          role: 'system',
          content:
            'You are a student-safe writing coach. Help without impersonating the student or producing prohibited content.',
        },
        { role: 'user', content: prompt.slice(0, 18_000) },
      ],
      temperature: 0.3,
      maxTokens: toolName === 'comment' ? 1500 : 900,
      signal: req.signal,
    });

    const outputSafety = await checkTeenSafety(
      result.content,
      'output',
      req.signal
    );
    if (!outputSafety.safe) {
      return NextResponse.json(
        { error: 'The editor response did not pass the safety check.' },
        { status: 502 }
      );
    }

    await recordAiUsage(
      'copilot',
      result.model,
      result.usage.prompt_tokens,
      result.usage.completion_tokens
    );

    const stream = createUIMessageStream<ChatMessage>({
      execute: ({ writer }) => {
        writer.write({
          data: toolName as ToolName,
          type: 'data-toolName',
        });

        if (toolName === 'comment') {
          const comments = commentSchema.parse(extractArray(result.content));
          for (const item of comments) {
            writer.write({
              id: nanoid(),
              data: {
                comment: {
                  blockId: item.blockId,
                  comment: item.comments,
                  content: item.content,
                },
                status: 'streaming',
              },
              type: 'data-comment',
            });
          }
          writer.write({
            id: nanoid(),
            data: { comment: null, status: 'finished' },
            type: 'data-comment',
          });
          return;
        }

        const id = nanoid();
        writer.write({ type: 'text-start', id });
        for (const delta of result.content.match(/[\s\S]{1,120}/g) || []) {
          writer.write({ type: 'text-delta', id, delta });
        }
        writer.write({ type: 'text-end', id });
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch {
    console.error('Editor AI request failed.');
    return NextResponse.json(
      { error: 'Failed to process editor AI request.' },
      { status: 500 }
    );
  }
}
