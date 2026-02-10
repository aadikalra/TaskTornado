import { NextResponse, NextRequest } from 'next/server';

const GOOGLE_AI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

export async function POST(req: NextRequest) {
    try {
        if (!GOOGLE_AI_API_KEY) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
        }

        const { rawText } = await req.json();

        if (!rawText?.trim()) {
            return NextResponse.json({ error: 'No grade data provided' }, { status: 400 });
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

        const requestBody = {
            contents: [
                { role: 'user', parts: [{ text: systemPrompt }] },
                { role: 'model', parts: [{ text: 'Understood. I will parse grade data and return only valid JSON.' }] },
                { role: 'user', parts: [{ text: `Parse this grade data:\n\n${rawText}` }] }
            ],
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 4096,
            },
        };

        const response = await fetch(
            `${GOOGLE_AI_API_URL}/models/gemma-3n-e4b-it:generateContent?key=${GOOGLE_AI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('AI API error:', errorText);
            return NextResponse.json({ error: 'AI service error' }, { status: 502 });
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Extract JSON from the response (handle markdown code blocks)
        let jsonStr = text;
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1].trim();
        }

        // Try to parse
        const parsed = JSON.parse(jsonStr);

        return NextResponse.json(parsed);
    } catch (error) {
        console.error('Grade parser error:', error);
        return NextResponse.json(
            { error: 'Failed to parse grades', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
