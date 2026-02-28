import { NextResponse, NextRequest } from 'next/server';

// Google AI Studio API configuration
const GOOGLE_AI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

// Rate limiting: 30 requests per minute for translation
const RATE_LIMIT_PER_MINUTE = 30;
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// Enable CORS
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Rate limiting function
function checkRateLimit(clientIP: string): boolean {
    const now = Date.now();
    const clientData = requestCounts.get(clientIP);

    if (!clientData || now > clientData.resetTime) {
        requestCounts.set(clientIP, {
            count: 1,
            resetTime: now + 60000
        });
        return true;
    }

    if (clientData.count >= RATE_LIMIT_PER_MINUTE) {
        return false;
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

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            ...corsHeaders,
        },
    });
}

// Supported languages with their codes
import { SUPPORTED_LANGUAGES } from '../../../config/languages';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { text, sourceLanguage, targetLanguage } = body;

        // Validate required fields
        if (!text || !sourceLanguage || !targetLanguage) {
            return new NextResponse(JSON.stringify({
                error: 'Missing required fields',
                details: 'text, sourceLanguage, and targetLanguage are required'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders,
                },
            });
        }

        // Get client IP for rate limiting
        const clientIP = getClientIP(req);

        // Check rate limit
        if (!checkRateLimit(clientIP)) {
            return new NextResponse(JSON.stringify({
                error: 'Rate limit exceeded',
                details: `Maximum ${RATE_LIMIT_PER_MINUTE} translation requests per minute allowed`
            }), {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders,
                },
            });
        }

        if (!GOOGLE_AI_API_KEY) {
            return new NextResponse(JSON.stringify({
                error: 'Translation service not configured',
                details: 'Please set GOOGLE_AI_API_KEY environment variable'
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders,
                },
            });
        }

        // Find language names from codes
        const sourceLang = SUPPORTED_LANGUAGES.find(l => l.code === sourceLanguage);
        const targetLang = SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage);

        if (!sourceLang || !targetLang) {
            return new NextResponse(JSON.stringify({
                error: 'Invalid language code',
                details: 'Source or target language code is not supported'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders,
                },
            });
        }

        // Build the prompt
        const fullPrompt = `You are a professional ${sourceLang.name} (${sourceLanguage}) to ${targetLang.name} (${targetLanguage}) translator. 
Your goal is to accurately convey the meaning and nuances of the original ${sourceLang.name} text while adhering to ${targetLang.name} grammar, vocabulary, and cultural sensitivities.

Please translate the following text: "${text}"

Structure your response exactly as follows:
[TRANSLATION]
(The translation here)

[PRONUNCIATION]
(Phonetic pronunciation guide here)

[EXPLANATION]
(Short explanation of nuance, grammar, or cultural context here in English)`;

        // Use Gemini deep model
        const model = 'gemini-2.0-flash';

        console.log('Sending translation request to Google AI Studio:', {
            model,
            sourceLanguage: sourceLang.name,
            targetLanguage: targetLang.name,
            textLength: text.length,
        });

        // Prepare the Gemini request body
        const geminiRequestBody = {
            contents: [
                {
                    role: 'user',
                    parts: [{ text: fullPrompt }]
                }
            ],
            generationConfig: {
                temperature: 0.3,
                topP: 0.9,
                maxOutputTokens: 2048,
            },
        };

        // Forward the streaming request to Google AI Studio
        let response;
        try {
            response = await fetch(
                `${GOOGLE_AI_API_URL}/models/${model}:streamGenerateContent?key=${GOOGLE_AI_API_KEY}&alt=sse`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(geminiRequestBody),
                }
            );
        } catch (fetchError) {
            console.error('Failed to connect to Google AI Studio:', fetchError);
            return new NextResponse(JSON.stringify({
                error: 'Failed to connect to translation service',
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
            console.error('Google AI Studio API error:', {
                status: response.status,
                statusText: response.statusText,
                error: errorText,
            });

            return new NextResponse(JSON.stringify({
                error: 'Failed to get translation',
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

        return new NextResponse(
            new ReadableStream({
                async start(controller) {
                    const reader = response.body?.getReader();
                    if (!reader) {
                        controller.close();
                        return;
                    }

                    try {
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;

                            const chunk = decoder.decode(value, { stream: true });

                            // Parse Google AI Studio SSE format
                            const lines = chunk.split('\n');
                            for (const line of lines) {
                                if (line.startsWith('data: ')) {
                                    try {
                                        const data = JSON.parse(line.slice(6));
                                        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
                                        if (content) {
                                            // Send in the format the client expects (data.translation)
                                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ translation: content, done: false })}\n\n`));
                                        }
                                    } catch (parseError) {
                                        // Some chunks might be incomplete
                                    }
                                }
                            }
                        }

                        // Send final done message
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ translation: '', done: true })}\n\n`));
                        controller.close();
                    } catch (error) {
                        console.error('Error in translation streaming:', error);
                        controller.error(error);
                    } finally {
                        reader.releaseLock();
                    }
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
    } catch (error: unknown) {
        console.error('Error in Translate API route:', error);
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
