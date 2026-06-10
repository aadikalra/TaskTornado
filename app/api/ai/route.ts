import { NextResponse, NextRequest } from 'next/server';
import { GoogleGenAI } from '@google/genai';
// Google AI Studio API configuration
const GOOGLE_AI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

// Ollama API configuration - primary is local, secondary is cloud if configured
const OLLAMA_API_URL = process.env.OLLAMA_HOST ? `${process.env.OLLAMA_HOST}/api` : 'http://localhost:11434/api';
const OLLAMA_API_KEY = process.env.OLLAMA_CLOUD_API_KEY || process.env.OLLAMA_API_KEY;

// Rate limiting: 60 requests per minute
const RATE_LIMIT_PER_MINUTE = 60;
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// Enable CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Google AI Studio request/response types
interface GeminiMessage {
  role: 'user' | 'model';
  parts: {
    text?: string;
    inline_data?: {
      mime_type: string;
      data: string;
    };
  }[];
}

interface GeminiChatRequest {
  contents: GeminiMessage[];
  generationConfig?: {
    temperature?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
  safetySettings?: Array<{
    category: string;
    threshold: string;
  }>;
}

// Rate limiting function
function checkRateLimit(clientIP: string): boolean {
  const now = Date.now();
  const clientData = requestCounts.get(clientIP);

  if (!clientData || now > clientData.resetTime) {
    // Reset or initialize counter
    requestCounts.set(clientIP, {
      count: 1,
      resetTime: now + 60000 // 1 minute from now
    });
    return true;
  }

  if (clientData.count >= RATE_LIMIT_PER_MINUTE) {
    return false; // Rate limit exceeded
  }

  clientData.count++;
  return true;
}

// Get client IP for rate limiting
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIP || 'unknown';
}

class SafeMathParser {
  private pos = 0;
  private tokens: string[] = [];

  constructor(expr: string) {
    const regex = /\d+(\.\d+)?|\b[a-zA-Z_][a-zA-Z0-9_]*\b|[\+\-\*\/\(\)\^]|[\*]{2}/g;
    this.tokens = expr.toLowerCase().replace(/\s+/g, '').match(regex) || [];
  }

  private peek(): string | null {
    return this.pos < this.tokens.length ? this.tokens[this.pos] : null;
  }

  private consume(expected?: string): string {
    const token = this.tokens[this.pos];
    if (expected && token !== expected) {
      throw new Error(`Expected '${expected}' but found '${token}'`);
    }
    this.pos++;
    return token;
  }

  parse(): number {
    this.pos = 0;
    const result = this.expr1();
    if (this.pos < this.tokens.length) {
      throw new Error(`Unexpected token '${this.tokens[this.pos]}'`);
    }
    return result;
  }

  private expr1(): number {
    let val = this.expr2();
    while (true) {
      const next = this.peek();
      if (next === '+') {
        this.consume();
        val += this.expr2();
      } else if (next === '-') {
        this.consume();
        val -= this.expr2();
      } else {
        break;
      }
    }
    return val;
  }

  private expr2(): number {
    let val = this.expr3();
    while (true) {
      const next = this.peek();
      if (next === '*') {
        this.consume();
        val *= this.expr3();
      } else if (next === '/') {
        this.consume();
        const divisor = this.expr3();
        if (divisor === 0) throw new Error("Division by zero");
        val /= divisor;
      } else {
        break;
      }
    }
    return val;
  }

  private expr3(): number {
    let val = this.expr4();
    while (true) {
      const next = this.peek();
      if (next === '^' || next === '**') {
        this.consume();
        val = Math.pow(val, this.expr4());
      } else {
        break;
      }
    }
    return val;
  }

  private expr4(): number {
    const next = this.peek();
    if (next === '-') {
      this.consume();
      return -this.expr4();
    }
    if (next === '+') {
      this.consume();
      return this.expr4();
    }
    return this.primary();
  }

  private primary(): number {
    const token = this.peek();
    if (!token) throw new Error("Unexpected end of expression");

    if (token === '(') {
      this.consume();
      const val = this.expr1();
      this.consume(')');
      return val;
    }

    if (/^\d+(\.\d+)?$/.test(token)) {
      this.consume();
      return parseFloat(token);
    }

    if (token === 'pi' || token === 'π') {
      this.consume();
      return Math.PI;
    }
    if (token === 'e') {
      this.consume();
      return Math.E;
    }

    if (/^[a-z]+$/.test(token)) {
      this.consume();
      this.consume('(');
      const arg = this.expr1();
      this.consume(')');
      
      switch (token) {
        case 'sin': return Math.sin(arg);
        case 'cos': return Math.cos(arg);
        case 'tan': return Math.tan(arg);
        case 'asin': return Math.asin(arg);
        case 'acos': return Math.acos(arg);
        case 'atan': return Math.atan(arg);
        case 'sinh': return Math.sinh(arg);
        case 'cosh': return Math.cosh(arg);
        case 'tanh': return Math.tanh(arg);
        case 'sqrt': 
          if (arg < 0) throw new Error("Square root of negative number");
          return Math.sqrt(arg);
        case 'cbrt': return Math.cbrt(arg);
        case 'log': 
          if (arg <= 0) throw new Error("Logarithm of non-positive number");
          return Math.log10(arg);
        case 'ln': 
          if (arg <= 0) throw new Error("Logarithm of non-positive number");
          return Math.log(arg);
        case 'exp': return Math.exp(arg);
        case 'abs': return Math.abs(arg);
        case 'ceil': return Math.ceil(arg);
        case 'floor': return Math.floor(arg);
        case 'round': return Math.round(arg);
        default: throw new Error(`Unknown function '${token}'`);
      }
    }

    throw new Error(`Unexpected token '${token}'`);
  }
}

function evaluateExpression(expr: string): string {
  try {
    const parser = new SafeMathParser(expr);
    const res = parser.parse();
    return String(res);
  } catch (err: any) {
    return `Error: ${err.message}`;
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    // Parse the incoming request body
    const body = await req.json();
    const { prompt, messages, model = 'gemma-4-26b-a4b-it', action = 'chat' } = body;

    // Get client IP for rate limiting
    const clientIP = getClientIP(req);

    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return new NextResponse(JSON.stringify({
        error: 'Rate limit exceeded',
        details: `Maximum ${RATE_LIMIT_PER_MINUTE} requests per minute allowed`
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Check if this is an Ollama model (ends with -cloud OR contains : which is Ollama's tag format)
    const isOllamaModel = model.endsWith('-cloud') || model.includes(':');

    // Check if API key is configured for the appropriate service
    if (isOllamaModel) {
      // Local Ollama doesn't strictly need a key, so we only check if it's NOT localhost
      const isLocal = OLLAMA_API_URL.includes('localhost') || OLLAMA_API_URL.includes('127.0.0.1');
      if (!isLocal && !OLLAMA_API_KEY) {
        return new NextResponse(JSON.stringify({
          error: 'Ollama API key not configured',
          details: 'Please set OLLAMA_API_KEY environment variable for cloud Ollama'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
    } else {
      if (!GOOGLE_AI_API_KEY) {
        return new NextResponse(JSON.stringify({
          error: 'Google AI Studio API key not configured',
          details: 'Please set GOOGLE_AI_API_KEY environment variable'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
    }

    // Log parameters for debugging
    console.log('API Request:', {
      model,
      isOllamaModel,
      action,
      hasKey: !!OLLAMA_API_KEY,
      keyPrefix: OLLAMA_API_KEY ? OLLAMA_API_KEY.substring(0, 4) + '...' : 'none'
    });

    // Check if API key is configured for the appropriate service
    console.log('Incoming request:', {
      action,
      model,
      hasPrompt: !!prompt,
      messageCount: messages?.length || 0,
    });

    // Convert messages to Gemini format
    const convertToGeminiMessages = (messages: any[]): GeminiMessage[] => {
      const geminiMessages: GeminiMessage[] = [];

      for (const msg of messages) {
        const { role, content, images } = msg;

        console.log('Converting message:', { role, hasContent: !!content, hasImages: !!images });

        // Convert role from 'assistant'/'system' to 'model'/'user' for Gemini
        let geminiRole: 'user' | 'model';
        if (role === 'assistant') {
          geminiRole = 'model';
        } else if (role === 'system') {
          // System messages should be treated as user messages for Gemini
          geminiRole = 'user';
        } else {
          geminiRole = role as 'user' | 'model';
        }

        console.log('Converted role:', role, '->', geminiRole);

        const parts: any[] = [];

        // Add text content
        if (content) {
          parts.push({ text: content });
        }

        // Add images if they exist
        if (images && Array.isArray(images)) {
          for (const imageData of images) {
            // Extract base64 data from data URL if needed
            const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
            parts.push({
              inline_data: {
                mime_type: 'image/jpeg', // Default to JPEG, could be enhanced to detect actual type
                data: base64Data
              }
            });
          }
        }

        geminiMessages.push({
          role: geminiRole,
          parts
        });
      }

      console.log('Final Gemini messages:', geminiMessages.length, 'messages');
      return geminiMessages;
    };

    // Prepare the request body for Google AI Studio
    const requestBody: GeminiChatRequest = {
      contents: [],
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    };

    // Handle both single prompt and chat messages
    if (action === 'chat' || action === 'generate') {
      if (messages && Array.isArray(messages)) {
        requestBody.contents = convertToGeminiMessages(messages);
      } else if (prompt) {
        // If we have a single prompt, convert it to a chat message
        requestBody.contents = [{ role: 'user', parts: [{ text: prompt }] }];
      } else {
        return new NextResponse(JSON.stringify({
          error: 'Either prompt or messages must be provided',
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
    } else {
      return new NextResponse(JSON.stringify({
        error: 'Invalid action specified',
        details: `Action '${action}' is not supported. Use 'chat' or 'generate'.`
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    if (!isOllamaModel) {
      // Handle Google AI Studio models with streaming using @google/genai
      console.log('Sending streaming request to Google AI Studio via @google/genai:', { model });

      const ai = new GoogleGenAI({ apiKey: GOOGLE_AI_API_KEY });
      const encoder = new TextEncoder();
      let isControllerClosed = false;

      return new NextResponse(
        new ReadableStream({
          async start(controller) {
            const safeEnqueue = (data: Uint8Array) => {
              if (isControllerClosed) return;
              try {
                controller.enqueue(data);
              } catch (e) {
                console.warn('Controller enqueue failed:', e);
                isControllerClosed = true;
              }
            };

            const safeClose = () => {
              if (isControllerClosed) return;
              try {
                controller.close();
              } catch (e) {
                console.warn('Controller close failed:', e);
              } finally {
                isControllerClosed = true;
              }
            };

            try {
              let systemInstruction: string | undefined = undefined;
              let finalContents = [...requestBody.contents];

              // Extract schoolData from body
              const schoolData = body.schoolData || "No school data provided.";

              // If the first message in the original payload was a system message, extract it
              if (messages && messages.length > 0 && messages[0].role === 'system') {
                systemInstruction = messages[0].content;
                // Since convertToGeminiMessages already added it as the first message, we can remove it
                finalContents = finalContents.slice(1);
              }

              const get_school_data = {
                name: "get_school_data",
                description: "Get the user's current school data, including homework, tests, and events. Call this IMMEDIATELY whenever the user asks about their schedule, workload, tasks, agenda, what they have to do, or what they should prioritize.",
                parameters: {
                    type: "object",
                    properties: {},
                },
              };

              const start_flashcards = {
                name: "start_flashcards",
                description: "Start a flashcard study session. Call this when the user wants to review material using flashcards. You must generate the flashcards.",
                parameters: {
                    type: "object",
                    properties: {
                        topic: { type: "string", description: "The topic of the flashcards." },
                        flashcards: {
                            type: "array",
                            description: "The list of flashcards to review.",
                            items: {
                                type: "object",
                                properties: {
                                    front: { type: "string", description: "The front of the flashcard (the question)." },
                                    back: { type: "string", description: "The back of the flashcard (the answer)." }
                                },
                                required: ["front", "back"]
                            }
                        }
                    },
                    required: ["topic", "flashcards"]
                },
              };

              const start_quiz = {
                name: "start_quiz",
                description: "Start a multiple-choice quiz. Call this when the user wants to test their knowledge. You must generate the quiz questions.",
                parameters: {
                    type: "object",
                    properties: {
                        topic: { type: "string", description: "The topic of the quiz." },
                        questions: {
                            type: "array",
                            description: "The list of quiz questions.",
                            items: {
                                type: "object",
                                properties: {
                                    question: { type: "string", description: "The question text." },
                                    options: {
                                        type: "array",
                                        description: "The list of answer options (must be exactly 4 options).",
                                        items: { type: "string" }
                                    },
                                    correctAnswer: { type: "string", description: "The correct answer option (must exactly match one of the options)." },
                                    explanation: { type: "string", description: "A brief explanation of why the answer is correct." }
                                },
                                required: ["question", "options", "correctAnswer", "explanation"]
                            }
                        }
                    },
                    required: ["topic", "questions"]
                },
              };

              const calculate_expression = {
                name: "calculate_expression",
                description: "Evaluate a mathematical expression, supporting scientific functions (sin, cos, tan, log, ln, sqrt, powers, etc.). Input must be a valid mathematical expression string.",
                parameters: {
                    type: "object",
                    properties: {
                        expression: { type: "string", description: "The mathematical expression to evaluate, e.g. 'sin(pi/4) * sqrt(16) + 2^3'" }
                    },
                    required: ["expression"]
                },
              };

              const add_homework = {
                name: "add_homework",
                description: "Add a homework assignment to the user's planner. Call this when the user explicitly requests to add, create, track, or schedule homework.",
                parameters: {
                    type: "object",
                    properties: {
                        className: { type: "string", description: "The name of the class this homework belongs to. Must match one of their existing classes." },
                        title: { type: "string", description: "The title of the homework assignment, e.g. 'Read Chapter 4' or 'Math Worksheet'." },
                        dueDate: { type: "string", description: "The due date of the homework in 'YYYY-MM-DD' format." },
                        priority: { type: "string", enum: ["low", "medium", "high"], description: "The priority of the task. Defaults to medium." },
                        description: { type: "string", description: "An optional, brief description of what the homework involves." },
                        links: {
                            type: "array",
                            description: "An optional array of links related to the homework (e.g. Google Docs, study materials).",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string", description: "The title of the link, e.g. 'Google Doc' or 'Assignment Portal'." },
                                    url: { type: "string", description: "The absolute HTTP or HTTPS URL." }
                                },
                                required: ["title", "url"]
                            }
                        }
                    },
                    required: ["className", "title", "dueDate"]
                },
              };

              const add_test = {
                name: "add_test",
                description: "Add a test/exam to the user's planner. Call this when the user explicitly requests to schedule or add a test or exam.",
                parameters: {
                    type: "object",
                    properties: {
                        className: { type: "string", description: "The name of the class this test belongs to. Must match one of their existing classes." },
                        title: { type: "string", description: "The title of the test, e.g. 'Midterm Exam' or 'Biology Unit Quiz'." },
                        date: { type: "string", description: "The date of the test in 'YYYY-MM-DD' format." },
                        testType: { 
                            type: "string", 
                            enum: ["exam", "quiz", "midterm", "final", "project", "presentation"], 
                            description: "The type of the test. Must be one of these exact lowercase values: 'exam', 'quiz', 'midterm', 'final', 'project', 'presentation'." 
                        },
                        description: { type: "string", description: "An optional description of the topics covered or notes." }
                    },
                    required: ["className", "title", "date", "testType"]
                },
              };

              const add_multiple_homeworks = {
                name: "add_multiple_homeworks",
                description: "Add multiple homework assignments to the user's planner at once. Use this whenever the user requests to add, create, or schedule multiple homework assignments in a single prompt.",
                parameters: {
                    type: "object",
                    properties: {
                        homeworks: {
                            type: "array",
                            description: "The list of homework assignments to add.",
                            items: {
                                type: "object",
                                properties: {
                                    className: { type: "string", description: "The name of the class this homework belongs to. Must match one of their existing classes." },
                                    title: { type: "string", description: "The title of the homework assignment, e.g. 'Read Chapter 4' or 'Math Worksheet'." },
                                    dueDate: { type: "string", description: "The due date of the homework in 'YYYY-MM-DD' format." },
                                    priority: { type: "string", enum: ["low", "medium", "high"], description: "The priority of the task. Defaults to medium." },
                                    description: { type: "string", description: "An optional, brief description of what the homework involves." }
                                },
                                required: ["className", "title", "dueDate"]
                            }
                        }
                    },
                    required: ["homeworks"]
                }
              };

              const config: any = {
                temperature: requestBody.generationConfig?.temperature || 0.7,
                topP: requestBody.generationConfig?.topP || 0.9,
                maxOutputTokens: requestBody.generationConfig?.maxOutputTokens || 2048,
                tools: [
                  { functionDeclarations: [get_school_data, start_flashcards, start_quiz, calculate_expression, add_homework, add_test, add_multiple_homeworks] },
                  { googleSearch: {} }
                ],
                toolConfig: {
                  includeServerSideToolInvocations: true
                }
              };

              if (systemInstruction) {
                config.systemInstruction = systemInstruction;
              }

              // Use the same unified model for cost-cutting (Gemma 4)
              const actualModel = "gemma-4-26b-a4b-it"; 

              if (model === 'gemini-2.5-flash-lite' || model === 'gpt-oss:20b-cloud') { // Deep or Max mode in UI
                  config.thinkingConfig = {
                      thinkingLevel: "high" // Gemma 4 thinking is enabled via "high"
                  };
              }

              let hasFunctionCall = true;

              while (hasFunctionCall) {
                hasFunctionCall = false;

                const stream = await ai.models.generateContentStream({
                  model: actualModel,
                  contents: finalContents,
                  config: config
                });

                for await (const chunk of stream) {
                  // Stream grounding metadata if available in this chunk
                  if (chunk.candidates?.[0]?.groundingMetadata) {
                    safeEnqueue(encoder.encode(`data: ${JSON.stringify({ groundingMetadata: chunk.candidates[0].groundingMetadata, done: false })}\n\n`));
                  }

                  if (chunk.functionCalls && chunk.functionCalls.length > 0) {
                    hasFunctionCall = true;
                    // Add the model's function call to history
                    finalContents.push({
                      role: 'model',
                      parts: chunk.functionCalls.map(fc => ({ functionCall: fc } as any))
                    });
                    
                    let shouldContinue = true;
                    for (const fc of chunk.functionCalls) {
                      safeEnqueue(encoder.encode(`data: ${JSON.stringify({ toolCall: fc.name, toolArgs: fc.args, done: false })}\n\n`));
                      if (fc.name === 'get_school_data') {
                        // Add the function response to history
                        finalContents.push({
                          role: 'user', 
                          parts: [{
                            functionResponse: {
                              name: 'get_school_data',
                              response: { data: schoolData }
                            }
                          } as any]
                        });
                      } else if (fc.name === 'calculate_expression') {
                        const expr = (fc.args as any)?.expression || '';
                        const result = evaluateExpression(expr);
                        console.log('Calculating expression:', expr, '->', result);
                        // Add the function response to history
                        finalContents.push({
                          role: 'user', 
                          parts: [{
                            functionResponse: {
                              name: 'calculate_expression',
                              response: { result }
                            }
                          } as any]
                        });
                      } else if (fc.name === 'add_homework') {
                        // Add optimistic function response to history and let the model continue
                        finalContents.push({
                          role: 'user', 
                          parts: [{
                            functionResponse: {
                              name: 'add_homework',
                              response: { success: true, message: `Successfully added homework "${(fc.args as any)?.title}". You MUST output the exact text '@showuserhomeworks' in your text response so the client knows to render it in a beautiful card.` }
                            }
                          } as any]
                        });
                      } else if (fc.name === 'add_test') {
                        // Add optimistic function response to history and let the model continue
                        finalContents.push({
                          role: 'user', 
                          parts: [{
                            functionResponse: {
                              name: 'add_test',
                              response: { success: true, message: `Successfully scheduled test "${(fc.args as any)?.title}"` }
                            }
                          } as any]
                        });
                      } else if (fc.name === 'start_flashcards' || fc.name === 'start_quiz') {
                        shouldContinue = false; // Flashcards and Quizzes are UI-triggered, no need to ask the model again
                      }
                    }
                    if (!shouldContinue) {
                      hasFunctionCall = false;
                    }
                    break; // break the stream loop
                  } else {
                    if (chunk.candidates && chunk.candidates[0]?.content?.parts) {
                       for (const part of chunk.candidates[0].content.parts) {
                          if (part.thought) {
                             safeEnqueue(encoder.encode(`data: ${JSON.stringify({ thought: part.text, done: false })}\n\n`));
                          } else if (part.text) {
                             safeEnqueue(encoder.encode(`data: ${JSON.stringify({ response: part.text, done: false })}\n\n`));
                          }
                       }
                    } else if (chunk.text) {
                       safeEnqueue(encoder.encode(`data: ${JSON.stringify({ response: chunk.text, done: false })}\n\n`));
                    }
                  }
                }
              }

              // Send final done message
              safeEnqueue(encoder.encode(`data: ${JSON.stringify({ response: '', done: true })}\n\n`));
              safeClose();
            } catch (error) {
              console.error('Error in streaming:', error);
              if (!isControllerClosed) {
                try {
                  controller.error(error);
                } catch (e) {}
              }
            }
          },
          cancel() {
            isControllerClosed = true;
          }
        }),
        {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            ...corsHeaders,
          },
        }
      );
    } else {
      // Handle Ollama models with streaming
      console.log('Sending request to Ollama:', {
        url: `${OLLAMA_API_URL}/${action}`,
        method: 'POST',
      });

      // Convert messages to Ollama format
      const convertToOllamaMessages = (messages: any[]) => {
        return messages.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : msg.role,
          content: msg.content,
          images: msg.images || undefined,
        }));
      };

      // Prepare the request body for Ollama with streaming
      const ollamaModelName = model;

      let ollamaRequestBody: any = {
        model: ollamaModelName,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        },
        stream: true, // Enable streaming
      };

      if (action === 'chat') {
        ollamaRequestBody.messages = messages ? convertToOllamaMessages(messages) : [{ role: 'user', content: prompt }];
      } else {
        // For action === 'generate'
        ollamaRequestBody.prompt = prompt || (messages && messages.length > 0 ? messages[messages.length - 1].content : '');
      }

      console.log('Ollama Cloud request:', {
        originalModel: model,
        ollamaModel: ollamaModelName,
        isChat: action === 'chat',
        stream: ollamaRequestBody.stream
      });

      // Forward the streaming request to Ollama
      let response;
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (OLLAMA_API_KEY) {
          headers['Authorization'] = `Bearer ${OLLAMA_API_KEY}`;
        }

        response = await fetch(`${OLLAMA_API_URL}/${action}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(ollamaRequestBody),
        });
      } catch (fetchError) {
        console.error('Failed to connect to Ollama:', fetchError);
        return new NextResponse(JSON.stringify({
          error: 'Failed to connect to Ollama',
          details: fetchError instanceof Error ? fetchError.message : 'Connection error',
          type: 'connection_error'
        }), {
          status: 502,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }

      // Handle non-OK responses
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ollama API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });

        // Handle rate limit errors
        if (response.status === 429) {
          return new NextResponse(JSON.stringify({
            error: 'Rate limit exceeded',
            details: 'Too many requests to Ollama. Please try again later.',
          }), {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }

        return new NextResponse(JSON.stringify({
          error: 'Failed to get response from Ollama',
          details: errorText,
        }), {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }

      // Stream the response back to the client
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      let isControllerClosed = false;

      return new NextResponse(
        new ReadableStream({
          async start(controller) {
            const reader = response.body?.getReader();
            if (!reader) {
              controller.close();
              return;
            }

            const safeEnqueue = (data: Uint8Array) => {
              if (isControllerClosed) return;
              try {
                controller.enqueue(data);
              } catch (e) {
                console.warn('Controller enqueue failed:', e);
                isControllerClosed = true;
              }
            };

            const safeClose = () => {
              if (isControllerClosed) return;
              try {
                controller.close();
              } catch (e) {
                console.warn('Controller close failed:', e);
              } finally {
                isControllerClosed = true;
              }
            };

            let buffer = '';
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                // Parse Ollama streaming format
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                  if (line.trim() && !line.startsWith('data: ')) {
                    try {
                      const data = JSON.parse(line);
                      const content = data.response || data.message?.content || data.delta?.content;
                      if (content) {
                        safeEnqueue(encoder.encode(`data: ${JSON.stringify({ response: content, done: false })}\n\n`));
                      }
                    } catch (parseError) {
                      console.error('Failed to parse Ollama streaming chunk:', parseError);
                    }
                  }
                }
              }

              // Process any remaining data in buffer
              if (buffer && buffer.trim() && !buffer.startsWith('data: ')) {
                try {
                  const data = JSON.parse(buffer);
                  const content = data.response || data.message?.content || data.delta?.content;
                  if (content) {
                    safeEnqueue(encoder.encode(`data: ${JSON.stringify({ response: content, done: false })}\n\n`));
                  }
                } catch (e) {}
              }

              // Send final done message
              safeEnqueue(encoder.encode(`data: ${JSON.stringify({ response: '', done: true })}\n\n`));
              safeClose();
            } catch (error) {
              console.error('Error in Ollama streaming:', error);
              if (!isControllerClosed) {
                try {
                  controller.error(error);
                } catch (e) {}
              }
            } finally {
              reader.releaseLock();
            }
          },
          cancel() {
            isControllerClosed = true;
          }
        }),
        {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            ...corsHeaders,
          },
        }
      );
    }
  } catch (error: unknown) {
    console.error('Error in AI API route:', error);
    return new NextResponse(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}
