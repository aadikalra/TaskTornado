import { NextResponse, NextRequest } from 'next/server';

// Google AI Studio API configuration
const GOOGLE_AI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

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
    // Check if API key is configured
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

    // Parse the incoming request body
    const body = await req.json();
    const { prompt, messages, model = 'gemma-3-12b-it', action = 'chat' } = body;

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

    // Log the incoming request for debugging
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

    console.log('Sending request to Google AI Studio:', {
      url: `${GOOGLE_AI_API_URL}/models/${model}:generateContent`,
      method: 'POST',
    });

    // Forward the request to Google AI Studio
    let response;
    try {
      response = await fetch(`${GOOGLE_AI_API_URL}/models/${model}:generateContent?key=${GOOGLE_AI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
    } catch (fetchError) {
      console.error('Failed to connect to Google AI Studio:', fetchError);
      return new NextResponse(JSON.stringify({
        error: 'Failed to connect to AI service',
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

      // Handle rate limit errors
      if (response.status === 429) {
        return new NextResponse(JSON.stringify({
          error: 'Rate limit exceeded',
          details: 'Too many requests to Google AI Studio. Please try again later.',
        }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }

      return new NextResponse(JSON.stringify({
        error: 'Failed to get response from Google AI Studio',
        details: errorText,
      }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Get the response text first
    const responseText = await response.text();
    console.log('Raw response from Google AI Studio:', responseText);

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Parsed response from Google AI Studio:', JSON.stringify(data, null, 2));

      // Extract the response text from Gemini format
      const responseContent = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response content';

      // Return the response in the format expected by the frontend
      return new NextResponse(JSON.stringify({
        response: responseContent,
        model: model,
        done: true,
        created_at: new Date().toISOString(),
        message: {
          role: 'model', // Changed from 'assistant' to 'model' for Gemini compatibility
          content: responseContent,
        },
        raw: data // Include the raw response for debugging
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    } catch (parseError) {
      console.error('Failed to parse Google AI Studio response:', parseError);
      return new NextResponse(JSON.stringify({
        error: 'Invalid response from AI service',
        details: responseText.length > 200 ? responseText.substring(0, 200) + '...' : responseText,
        type: 'parse_error'
      }), {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }
  } catch (error) {
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
