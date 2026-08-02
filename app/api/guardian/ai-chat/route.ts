import { NextRequest, NextResponse } from 'next/server';

import {
  authorizeAiAction,
  createSseResponse,
  textEvents,
} from '@/lib/ai/http';
import {
  checkTeenSafety,
  completeWithFallback,
  normalizeGroqMessages,
} from '@/lib/ai/groq';
import { recordAiUsage } from '@/lib/ai/quota';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const access = await authorizeAiAction(req, 'guardian', 'family');
  if (!access.ok) return access.response;

  try {
    const supabase = await createClient();
    const body = await req.json();
    const { studentId } = body;
    const messages = normalizeGroqMessages(body.messages);
    const lastUser = [...messages]
      .reverse()
      .find((message) => message.role === 'user')?.content;

    if (typeof studentId !== 'string' || !lastUser) {
      return NextResponse.json(
        { error: 'Student and message required.' },
        { status: 400 }
      );
    }

    if (access.profile?.account_type !== 'guardian') {
      return NextResponse.json(
        { error: 'Guardian access only.' },
        { status: 403 }
      );
    }

    const { data: link } = await supabase
      .from('parent_links')
      .select('id')
      .eq('parent_id', access.user.id)
      .eq('student_id', studentId)
      .eq('status', 'active')
      .maybeSingle();
    if (!link) {
      return NextResponse.json(
        { error: 'No active link to this student.' },
        { status: 403 }
      );
    }

    const [classesResult, homeworkResult, testsResult] = await Promise.all([
      supabase
        .from('classes')
        .select('id,name')
        .eq('user_id', studentId)
        .limit(12),
      supabase
        .from('homework')
        .select('title,class_id,due_date,completed,priority')
        .eq('user_id', studentId)
        .order('due_date', { ascending: true })
        .limit(20),
      supabase
        .from('tests')
        .select('title,class_id,test_date,test_type,status')
        .eq('user_id', studentId)
        .order('test_date', { ascending: true })
        .limit(10),
    ]);

    if (classesResult.error || homeworkResult.error || testsResult.error) {
      return NextResponse.json(
        { error: 'Student data could not be retrieved.' },
        { status: 502 }
      );
    }

    const classNames = new Map(
      (classesResult.data || []).map((item) => [item.id, item.name])
    );
    const context = JSON.stringify({
      classes: (classesResult.data || []).map((item) => ({ name: item.name })),
      homework: (homeworkResult.data || []).map((item) => ({
        title: item.title,
        className: classNames.get(item.class_id) || 'Unknown class',
        dueDate: item.due_date,
        completed: item.completed,
        priority: item.priority,
      })),
      tests: (testsResult.data || []).map((item) => ({
        title: item.title,
        className: classNames.get(item.class_id) || 'Unknown class',
        date: item.test_date,
        type: item.test_type,
        status: item.status,
      })),
    });

    const safeInput = await checkTeenSafety(lastUser, 'input', req.signal);
    if (!safeInput.safe) {
      return NextResponse.json(
        { error: 'This guardian request cannot be processed.' },
        { status: 400 }
      );
    }

    const result = await completeWithFallback({
      action: 'guardian',
      messages: [
        {
          role: 'system',
          content: `You are a supportive academic-planning assistant for a
verified guardian. Use only the supplied TaskTornado data, do not diagnose the
student, and do not infer sensitive personal traits. Give concise, practical
suggestions for a respectful conversation. Do not provide medical, legal, or
mental-health advice.`,
        },
        { role: 'system', content: `TRACKED DATA:\n${context}` },
        ...messages.filter((message) => message.role !== 'system'),
      ],
      temperature: 0.4,
      maxTokens: 700,
      signal: req.signal,
    });

    const safeOutput = await checkTeenSafety(
      result.content,
      'output',
      req.signal
    );
    if (!safeOutput.safe) {
      return NextResponse.json(
        { error: 'The response did not pass the safety check.' },
        { status: 502 }
      );
    }

    await recordAiUsage(
      'guardian',
      result.model,
      result.usage.prompt_tokens,
      result.usage.completion_tokens
    );
    return createSseResponse(textEvents(result.content));
  } catch {
    console.error('Guardian AI request failed.');
    return NextResponse.json(
      { error: 'Guardian AI service unavailable.' },
      { status: 500 }
    );
  }
}
