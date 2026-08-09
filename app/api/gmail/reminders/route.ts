import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

import { guardAuthenticatedRequest } from '@/lib/api/request-guard';
import { getGoogleClientForUser } from '@/lib/google-oauth';
import { TIER_LIMITS, type PlanTier } from '@/lib/planTier';
import { supabaseAdmin } from '@/lib/supabase/admin';

const FOLLOW_UP_CLASS_NAME = 'Email Follow-ups';
const VALID_DAYS = new Set([2, 3]);

function getPlanTier(request: NextRequest): PlanTier {
  const value = request.cookies.get('taskTornadoPlanTier')?.value;
  return value === 'pro' || value === 'family' ? value : 'free';
}

function cleanSubject(subject: string) {
  const normalized = subject.replace(/\s+/g, ' ').trim();
  return (normalized || '(no subject)').slice(0, 160);
}

export async function POST(request: NextRequest) {
  const access = await guardAuthenticatedRequest(request, {
    limit: 15,
    windowMs: 60_000,
  });
  if (!access.ok) return access.response;

  try {
    const body = await request.json();
    const messageId = typeof body.messageId === 'string' ? body.messageId.trim() : '';
    const days = Number(body.days);
    const dueDate = typeof body.dueDate === 'string' ? body.dueDate : '';

    if (!messageId || !VALID_DAYS.has(days) || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      return NextResponse.json(
        { error: 'Choose a reminder for two or three days from now.' },
        { status: 400 }
      );
    }

    const googleAuth = await getGoogleClientForUser(access.user.id, 'gmail');
    if (!googleAuth) {
      return NextResponse.json(
        { error: 'Connect Gmail before creating an email reminder.' },
        { status: 401 }
      );
    }

    const gmail = google.gmail({ version: 'v1', auth: googleAuth.client });
    const messageResponse = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'metadata',
      metadataHeaders: ['Subject'],
    });
    const headers = messageResponse.data.payload?.headers || [];
    const subject = cleanSubject(
      headers.find((header) => header.name?.toLowerCase() === 'subject')?.value || ''
    );
    const description = `Email follow-up reminder (Gmail message ${messageId})`;

    const { data: existingReminder, error: existingError } = await supabaseAdmin
      .from('homework')
      .select('id,title,due_date')
      .eq('user_id', access.user.id)
      .eq('description', description)
      .limit(1)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existingReminder) {
      return NextResponse.json({
        created: false,
        reminder: existingReminder,
      });
    }

    const tier = getPlanTier(request);
    const homeworkLimit = TIER_LIMITS[tier].homeworkEntries;
    if (homeworkLimit !== Infinity) {
      const { count, error: countError } = await supabaseAdmin
        .from('homework')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', access.user.id)
        .or('completed.eq.false,completed.is.null');

      if (countError) throw countError;
      if ((count || 0) >= homeworkLimit) {
        return NextResponse.json(
          { error: `The free plan includes up to ${homeworkLimit} active assignments.` },
          { status: 403 }
        );
      }
    }

    let { data: followUpClass, error: classLookupError } = await supabaseAdmin
      .from('classes')
      .select('id')
      .eq('user_id', access.user.id)
      .eq('name', FOLLOW_UP_CLASS_NAME)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (classLookupError) throw classLookupError;

    if (!followUpClass) {
      const { data: createdClass, error: classCreateError } = await supabaseAdmin
        .from('classes')
        .insert({
          user_id: access.user.id,
          name: FOLLOW_UP_CLASS_NAME,
          icon: 'MailSend01',
          color: '#3182CE',
        })
        .select('id')
        .single();

      if (classCreateError || !createdClass) {
        throw classCreateError || new Error('Email follow-up class was not created.');
      }
      followUpClass = createdClass;
    }

    const parsedDueDate = new Date(`${dueDate}T12:00:00.000Z`);
    if (Number.isNaN(parsedDueDate.getTime())) {
      return NextResponse.json({ error: 'The reminder date is invalid.' }, { status: 400 });
    }

    const { data: reminder, error: reminderError } = await supabaseAdmin
      .from('homework')
      .insert({
        user_id: access.user.id,
        class_id: followUpClass.id,
        title: `Review email: ${subject}`,
        description,
        due_date: parsedDueDate.toISOString(),
        priority: 'medium',
        pinned: false,
        completed: false,
      })
      .select('id,title,due_date')
      .single();

    if (reminderError || !reminder) {
      throw reminderError || new Error('Email reminder was not created.');
    }

    return NextResponse.json({ created: true, reminder }, { status: 201 });
  } catch (error: any) {
    console.error('Email reminder creation failed:', error);

    if (error?.code === 404) {
      return NextResponse.json({ error: 'That Gmail message could not be found.' }, { status: 404 });
    }
    if (error?.code === 401 || error?.message?.includes('invalid_grant')) {
      return NextResponse.json(
        { error: 'Your Gmail connection expired. Reconnect Gmail and try again.' },
        { status: 401 }
      );
    }

    return NextResponse.json({ error: 'The reminder could not be created.' }, { status: 500 });
  }
}
