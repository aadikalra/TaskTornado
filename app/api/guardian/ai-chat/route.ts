import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const GOOGLE_AI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

interface GeminiMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify guardian account
        const { data: profile } = await supabase
            .from('profiles')
            .select('account_type')
            .eq('id', user.id)
            .single();

        if (profile?.account_type !== 'guardian') {
            return NextResponse.json({ error: 'Guardian access only' }, { status: 403 });
        }

        const body = await req.json();
        const { messages, studentId } = body;

        if (!messages || !Array.isArray(messages) || !studentId) {
            return NextResponse.json({ error: 'Messages and studentId required' }, { status: 400 });
        }

        if (!GOOGLE_AI_API_KEY) {
            return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
        }

        // Verify active link to student
        const { data: link } = await supabase
            .from('parent_links')
            .select('id')
            .eq('parent_id', user.id)
            .eq('student_id', studentId)
            .eq('status', 'active')
            .maybeSingle();

        if (!link) {
            return NextResponse.json({ error: 'No active link to this student' }, { status: 403 });
        }

        // Fetch student data for AI context
        const [studentProfile, classesRes, homeworkRes, testsRes] = await Promise.all([
            supabase.from('profiles').select('full_name').eq('id', studentId).single(),
            supabase.from('classes').select('*').eq('user_id', studentId),
            supabase.from('homework').select('*').eq('user_id', studentId),
            supabase.from('tests').select('*').eq('user_id', studentId),
        ]);

        const studentName = studentProfile.data?.full_name || 'Student';
        const classes = classesRes.data || [];
        const homework = homeworkRes.data || [];
        const tests = testsRes.data || [];

        // Compute summary
        const completed = homework.filter((h: any) => h.completed).length;
        const total = homework.length;
        const overdue = homework.filter((h: any) => !h.completed && new Date(h.due_date) < new Date()).length;
        const upcoming = homework.filter((h: any) => !h.completed && new Date(h.due_date) >= new Date()).length;
        const upcomingTests = tests.filter((t: any) => new Date(t.test_date) >= new Date()).length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Build context
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

        const classDetails = classes.map((c: any) => {
            const classHw = homework.filter((h: any) => h.class_id === c.id);
            const classPending = classHw.filter((h: any) => !h.completed).length;
            const classOverdue = classHw.filter((h: any) => !h.completed && new Date(h.due_date) < new Date()).length;
            const classTests = tests.filter((t: any) => t.class_id === c.id);
            return `- ${c.name}${c.teacher ? ` (Teacher: ${c.teacher})` : ''}: ${classPending} pending tasks${classOverdue > 0 ? ` (${classOverdue} OVERDUE)` : ''}, ${classTests.length} tests`;
        }).join('\n');

        const overdueItems = homework
            .filter((h: any) => !h.completed && new Date(h.due_date) < new Date())
            .map((h: any) => {
                const cls = classes.find((c: any) => c.id === h.class_id);
                return `- "${h.title}" for ${cls?.name || 'Unknown class'} (was due ${new Date(h.due_date).toLocaleDateString()})`;
            }).join('\n');

        const upcomingItems = homework
            .filter((h: any) => !h.completed && new Date(h.due_date) >= new Date())
            .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
            .slice(0, 10)
            .map((h: any) => {
                const cls = classes.find((c: any) => c.id === h.class_id);
                return `- "${h.title}" for ${cls?.name || 'Unknown class'} (due ${new Date(h.due_date).toLocaleDateString()})`;
            }).join('\n');

        const upcomingTestsList = tests
            .filter((t: any) => new Date(t.test_date) >= new Date())
            .sort((a: any, b: any) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime())
            .slice(0, 5)
            .map((t: any) => {
                const cls = classes.find((c: any) => c.id === t.class_id);
                return `- "${t.title}" for ${cls?.name || 'Unknown class'} on ${new Date(t.test_date).toLocaleDateString()}${t.test_type ? ` (${t.test_type})` : ''}`;
            }).join('\n');

        const systemPrompt = `You are a helpful academic advisor for parents. Today is ${today}.

You are assisting a parent/guardian who is monitoring their child's academic progress. Here is the child's current data:

**Student:** ${studentName}
**Overall Stats:** ${completionRate}% homework completion rate | ${completed}/${total} tasks completed | ${overdue} overdue | ${upcoming} upcoming | ${upcomingTests} upcoming tests

**Classes:**
${classDetails || 'No classes enrolled yet.'}

${overdueItems ? `**⚠️ OVERDUE Homework:**\n${overdueItems}` : '**No overdue homework — great!**'}

${upcomingItems ? `**Upcoming Homework:**\n${upcomingItems}` : 'No upcoming homework.'}

${upcomingTestsList ? `**Upcoming Tests:**\n${upcomingTestsList}` : 'No upcoming tests.'}

Guidelines:
- Be warm, supportive, and honest. Celebrate successes, gently flag concerns.
- If there are overdue items, mention them proactively but withOUT being alarmist.
- Give actionable advice the parent can use when talking to their child.
- Keep responses concise (2-4 paragraphs max unless asked for detail).
- Use a conversational, friendly tone — you're a helpful advisor, not a strict teacher.
- If asked about something outside the data, say you only have visibility into what's tracked in TaskTornado.
- Never make up or invent data that isn't provided above.`;

        // Build Gemini messages
        const geminiMessages: GeminiMessage[] = [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: `I have ${studentName}'s academic data ready. How can I help you today?` }] },
        ];

        for (const msg of messages) {
            geminiMessages.push({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }],
            });
        }

        const requestBody = {
            contents: geminiMessages,
            generationConfig: {
                temperature: 0.7,
                topP: 0.9,
                maxOutputTokens: 1024,
            },
        };

        // Stream from Gemini
        const response = await fetch(
            `${GOOGLE_AI_API_URL}/models/gemma-4-26b-a4b-it:streamGenerateContent?key=${GOOGLE_AI_API_KEY}&alt=sse`,
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

        // Stream back to client
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        return new NextResponse(
            new ReadableStream({
                async start(controller) {
                    const reader = response.body?.getReader();
                    if (!reader) { controller.close(); return; }

                    try {
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;

                            const chunk = decoder.decode(value, { stream: true });
                            const lines = chunk.split('\n');

                            for (const line of lines) {
                                if (line.startsWith('data: ')) {
                                    try {
                                        const data = JSON.parse(line.slice(6));
                                        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
                                        if (content) {
                                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ response: content, done: false })}\n\n`));
                                        }
                                    } catch { /* skip unparseable chunks */ }
                                }
                            }
                        }

                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ response: '', done: true })}\n\n`));
                        controller.close();
                    } catch (error) {
                        console.error('Streaming error:', error);
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
                },
            }
        );
    } catch (error) {
        console.error('Guardian AI chat error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
