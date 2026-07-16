import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  try {
    const { messages, documentContent } = await req.json();

    const ai = new GoogleGenAI({ apiKey: GOOGLE_AI_API_KEY });
    
    const systemPrompt = `You are an expert AI Writing Assistant and Grader. 
You are paired with a Google Docs-style rich text editor.

The user's current document content is provided below. You must use this content to answer their questions, grade their essays, or suggest improvements.

CURRENT DOCUMENT CONTENT:
"""
${documentContent}
"""

You can interact with the document. You MUST return your response as a JSON array of action objects. 
Allowed actions:
1. { "action": "message", "text": "The message to show to the user" }
2. { "action": "highlight_text", "text": "exact string in document to highlight" } -> Use sparingly to highlight exceptionally good, brief passages. Do NOT over-highlight the document.
3. { "action": "add_comment", "text": "exact string to comment on", "comment": "the feedback", "suggestedReplacement": "the suggested rewritten text to fix the issue" } -> Use for all constructive feedback, corrections, and suggestions.

Return a JSON array containing your actions in order. Always start with a "message" action to reply to the user.`;

    const history = messages.map((msg: any) => {
      let text = msg.content || '';
      if (msg.role === 'assistant' && msg.toolCalls && msg.toolCalls.length > 0) {
        text += '\n\n[System Note: You executed these actions: ' + JSON.stringify(msg.toolCalls) + ']';
      }
      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text }]
      };
    });

    if (history.length > 0 && history[0].role === 'user') {
      history[0].parts[0].text = systemPrompt + '\n\nUser Request: ' + history[0].parts[0].text;
    } else {
      history.unshift({ role: 'user', parts: [{ text: systemPrompt }] });
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: history,
        config: {
            temperature: 0.7,
            responseMimeType: 'application/json',
        }
    });

    return NextResponse.json({ actions: JSON.parse(response.text || '[]') });
  } catch (error: any) {
    console.error('Grader AI Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
