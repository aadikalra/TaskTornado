import { NextResponse, NextRequest } from 'next/server';

// Ollama Cloud API configuration
const OLLAMA_CLOUD_API_URL = 'https://ollama.com/api';
const OLLAMA_CLOUD_API_KEY = process.env.OLLAMA_API_KEY;

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

        // Ollama Cloud Configuration
        const OLLAMA_CLOUD_API_URL = 'https://ollama.com/api';
        const OLLAMA_CLOUD_API_KEY = process.env.OLLAMA_API_KEY;

        if (!OLLAMA_CLOUD_API_KEY) {
            return new NextResponse(JSON.stringify({
                error: 'Translation service not configured',
                details: 'Please set OLLAMA_API_KEY environment variable'
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

        // Build the prompt using the user-provided template with structured markers for parsing
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

        const model = 'gpt-oss:20b';

        console.log('Sending translation request to Ollama Cloud:', {
            model,
            sourceLanguage: sourceLang.name,
            targetLanguage: targetLang.name,
            textLength: text.length,
        });

        // Prepare the request body for Ollama Cloud with streaming
        const ollamaRequestBody = {
            model: model,
            messages: [{ role: 'user', content: fullPrompt }],
            options: {
                temperature: 0.3,
                top_p: 0.9,
            },
            stream: true,
        };

        // Forward the streaming request to Ollama Cloud
        let response;
        try {
            response = await fetch(`${OLLAMA_CLOUD_API_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OLLAMA_CLOUD_API_KEY}`,
                },
                body: JSON.stringify(ollamaRequestBody),
            });
        } catch (fetchError) {
            console.error('Failed to connect to Ollama Cloud:', fetchError);
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
            console.error('Ollama Cloud API error:', {
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

                            // Parse Ollama streaming format
                            const lines = chunk.split('\n');
                            for (const line of lines) {
                                if (line.trim()) {
                                    try {
                                        const data = JSON.parse(line);
                                        const content = data.message?.content || data.response;
                                        if (content) {
                                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ translation: content, done: false })}\n\n`));
                                        }
                                        if (data.done) {
                                            // Handle completion
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
