import { NextRequest, NextResponse } from 'next/server';

interface WorthinessRequest {
  reason: string;
  gameTitle: string;
}

interface WorthinessResponse {
  worthy: boolean;
  reason?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: WorthinessRequest = await request.json();
    const { reason, gameTitle } = body;

    if (!reason || !gameTitle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use the existing AI system instead of direct Groq call
    const prompt = `You are an AI assistant that determines if a student is worthy of playing a game. 
The student wants to play "${gameTitle}" and gave this reason: "${reason}"

Respond with ONLY a JSON object: {"worthy": true/false, "reason": "brief explanation"}

Be fair but strict. Students should only play games if:
1. They've completed their homework
2. They have a legitimate reason (study break, stress relief, reward for hard work)
3. They're being honest about their situation

Deny if they seem to be procrastinating, avoiding work, or being dishonest. Keep responses brief.`;

    // Call the main AI endpoint
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model: 'gemma-3n-e4b-it',
        action: 'generate',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error || 'Failed to call AI model');
    }

    // Handle streaming response from the main AI endpoint
    const responseText = await response.text();
    let content = '';

    // Parse streaming SSE format
    const lines = responseText.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.response) {
            content += data.response;
          }
          if (data.done) {
            break;
          }
        } catch (parseError) {
          console.error('Failed to parse streaming data:', parseError);
        }
      }
    }

    // Parse the JSON response
    let result: WorthinessResponse;
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanContent = content.trim();

      // Remove ```json and ``` markers
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      result = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      // Fallback to strict mode if parsing fails
      result = { worthy: false, reason: 'AI response parsing failed' };
    }

    // Ensure the response has the required structure
    if (typeof result.worthy !== 'boolean') {
      result.worthy = false;
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error checking worthiness:', error);

    // Fail closed - if AI fails, deny access
    return NextResponse.json(
      { worthy: false, reason: 'AI service unavailable' },
      { status: 500 }
    );
  }
}
