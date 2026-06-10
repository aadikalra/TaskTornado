import { NextRequest } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
    if (!GOOGLE_AI_API_KEY) {
        return new Response(
            JSON.stringify({ error: 'API key not configured' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }

    try {
        const { rawText } = await req.json();
        if (!rawText?.trim()) {
            return new Response(
                JSON.stringify({ error: 'No grade data provided' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const systemPrompt = `You are a grade data parser. The user will paste raw text copied from PowerSchool or a similar gradebook. Your job is to extract each assignment and return structured JSON.

Rules:
- Extract every assignment/test/quiz you can find
- For each item, determine: name, category (one of "practice" or "assessment"), pointsEarned, pointsPossible
- "assessment" = tests, exams, quizzes, finals, midterms, assessments, summatives
- "practice" = homework, classwork, participation, practice, formative, daily work, labs, projects, anything else
- If a grade shows a percentage like "85%", convert it to points (e.g. 85 out of 100)
- If an assignment is marked as "Missing", "M", or has 0 points earned, set pointsEarned to 0
- If an assignment is "Exempt", "EX", "Excluded", or has a score of "--", skip it entirely (do not include it)
- If you can't determine the points, make a reasonable assumption (e.g. X/100)
- Return ONLY valid JSON, no markdown, no explanation

Return format:
{
  "assignments": [
    { "name": "Assignment Name", "category": "practice", "pointsEarned": 85, "pointsPossible": 100 },
    { "name": "Unit Test 1", "category": "assessment", "pointsEarned": 42, "pointsPossible": 50 }
  ]
}`;

        const ai = new GoogleGenAI({ apiKey: GOOGLE_AI_API_KEY });

        const stream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash-lite',
            contents: [
                { role: 'user', parts: [{ text: systemPrompt }] },
                { role: 'model', parts: [{ text: 'Understood. I will parse grade data and return only valid JSON.' }] },
                { role: 'user', parts: [{ text: `Parse this grade data:\n\n${rawText}` }] }
            ],
            config: {
                temperature: 0.1,
                maxOutputTokens: 4096,
            }
        });

        // Set up streaming response
        const encoder = new TextEncoder();
        const customReadable = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        if (chunk.text) {
                            try {
                                controller.enqueue(encoder.encode(chunk.text));
                            } catch (e) {
                                // Stream might be closed by client abort
                                break;
                            }
                        }
                    }
                    try {
                        controller.close();
                    } catch (e) {
                        // Controller already closed or cancelled
                    }
                } catch (error) {
                    console.error('Error in grades parsing stream:', error);
                    try {
                        controller.error(error);
                    } catch (e) {}
                }
            }
        });

        return new Response(customReadable, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error: any) {
        console.error('Grade parser error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to initiate parsing', details: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
