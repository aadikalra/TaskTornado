import type { NextRequest } from 'next/server';

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const {
    apiKey: key,
    model = 'gemma-4-26b-a4b-it',
    prompt,
    system,
  } = await req.json();

  const apiKey = key || process.env.GOOGLE_AI_API_KEY;

  console.log('[Copilot API] Request received:', { model, hasPrompt: !!prompt, hasSystem: !!system });

  if (!apiKey) {
    console.error('[Copilot API] Missing API key');
    return NextResponse.json(
      { error: 'Missing Google AI API key.' },
      { status: 401 }
    );
  }

  const google = createGoogleGenerativeAI({
    apiKey,
  });

  try {
    console.log('[Copilot API] Calling Google AI...');
    const result = await generateText({
      abortSignal: req.signal,
      model: google(model),
      prompt,
      system,
      temperature: 0.7,
    });

    console.log('[Copilot API] Success:', { textLength: result.text?.length });

    // Return only the text field as expected by the Plate copilot
    return NextResponse.json({ text: result.text });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(null, { status: 408 });
    }

    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}
