import { addDays, format } from 'date-fns';
import { calendar_v3, google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

import { guardAuthenticatedRequest } from '@/lib/api/request-guard';
import { getGoogleClientForUser } from '@/lib/google-oauth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Database } from '@/types/database.types';

const CALENDAR_ID = 'primary';
const APP_SOURCE = 'tasktornado';

type SyncItem = {
  key: string;
  event: calendar_v3.Schema$Event;
};

type HomeworkRow = Pick<
  Database['public']['Tables']['homework']['Row'],
  'id' | 'title' | 'description' | 'due_date' | 'class_id'
>;
type TestRow = Pick<
  Database['public']['Tables']['tests']['Row'],
  | 'id'
  | 'title'
  | 'description'
  | 'test_date'
  | 'test_time'
  | 'test_type'
  | 'duration'
  | 'location'
  | 'notes'
  | 'class_id'
>;

function nextDate(date: string) {
  return format(addDays(new Date(`${date}T12:00:00`), 1), 'yyyy-MM-dd');
}

function homeworkEvent(
  homework: HomeworkRow,
  userId: string,
  className?: string
): SyncItem {
  // The app treats homework deadlines as calendar days. Keep the date portion
  // that the user selected instead of shifting it through the server timezone.
  const date = homework.due_date.slice(0, 10);
  const key = `homework:${homework.id}`;
  return {
    key,
    event: {
      summary: homework.title,
      description: [
        className ? `Class: ${className}` : null,
        homework.description || null,
        'Synced from TaskTornado',
      ].filter(Boolean).join('\n\n'),
      start: { date },
      end: { date: nextDate(date) },
      transparency: 'transparent',
      extendedProperties: {
        private: {
          tasktornadoSource: APP_SOURCE,
          tasktornadoUser: userId,
          tasktornadoKey: key,
        },
      },
    },
  };
}

function testEvent(
  test: TestRow,
  userId: string,
  className?: string,
  timeZone?: string
): SyncItem {
  const key = `test:${test.id}`;
  const testTime = typeof test.test_time === 'string'
    ? test.test_time.replace(/Z$/, '').slice(0, 8)
    : null;
  const duration = Math.max(15, Number(test.duration) || 60);
  let start: calendar_v3.Schema$EventDateTime;
  let end: calendar_v3.Schema$EventDateTime;

  if (testTime) {
    const startDate = new Date(`${test.test_date}T${testTime}`);
    const endDate = new Date(startDate.getTime() + duration * 60_000);
    start = { dateTime: `${test.test_date}T${testTime}`, timeZone };
    end = {
      dateTime: format(endDate, "yyyy-MM-dd'T'HH:mm:ss"),
      timeZone,
    };
  } else {
    start = { date: test.test_date };
    end = { date: nextDate(test.test_date) };
  }

  return {
    key,
    event: {
      summary: test.title,
      description: [
        className ? `Class: ${className}` : null,
        test.test_type ? `Type: ${test.test_type}` : null,
        test.notes || test.description || null,
        'Synced from TaskTornado',
      ].filter(Boolean).join('\n\n'),
      location: test.location || undefined,
      start,
      end,
      extendedProperties: {
        private: {
          tasktornadoSource: APP_SOURCE,
          tasktornadoUser: userId,
          tasktornadoKey: key,
        },
      },
    },
  };
}

async function listManagedEvents(
  calendar: calendar_v3.Calendar,
  userId: string
) {
  const events: calendar_v3.Schema$Event[] = [];
  let pageToken: string | undefined;

  do {
    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      privateExtendedProperty: [
        `tasktornadoSource=${APP_SOURCE}`,
        `tasktornadoUser=${userId}`,
      ],
      maxResults: 2500,
      pageToken,
      showDeleted: false,
    });
    events.push(...(response.data.items || []));
    pageToken = response.data.nextPageToken || undefined;
  } while (pageToken);

  return events;
}

export async function POST(request: NextRequest) {
  const access = await guardAuthenticatedRequest(request, {
    limit: 6,
    windowMs: 60_000,
  });
  if (!access.ok) return access.response;

  try {
    const body = await request.json().catch(() => ({}));
    const requestedTimeZone = typeof body.timeZone === 'string'
      ? body.timeZone
      : 'UTC';
    let timeZone = 'UTC';
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: requestedTimeZone }).format();
      timeZone = requestedTimeZone;
    } catch {
      // Invalid client timezones safely fall back to UTC.
    }

    const googleConnection = await getGoogleClientForUser(
      access.user.id,
      'calendar'
    );
    if (!googleConnection) {
      return NextResponse.json(
        { error: 'Connect Google Calendar before syncing.' },
        { status: 409 }
      );
    }

    const calendar = google.calendar({
      version: 'v3',
      auth: googleConnection.client,
    });
    const [classesResult, homeworkResult, testsResult] = await Promise.all([
        supabaseAdmin
          .from('classes')
          .select('id,name')
          .eq('user_id', access.user.id),
        supabaseAdmin
          .from('homework')
          .select('id,title,description,due_date,class_id')
          .eq('user_id', access.user.id),
        supabaseAdmin
          .from('tests')
          .select('id,title,description,test_date,test_time,test_type,duration,location,notes,class_id')
          .eq('user_id', access.user.id),
      ]);

    if (classesResult.error) throw classesResult.error;
    if (homeworkResult.error) throw homeworkResult.error;
    if (testsResult.error) throw testsResult.error;

    const classNames = new Map(
      (classesResult.data || []).map((item) => [item.id, item.name])
    );
    const desired: SyncItem[] = [
      ...(homeworkResult.data || []).map((item) =>
        homeworkEvent(item, access.user.id, classNames.get(item.class_id))
      ),
      ...(testsResult.data || []).map((item) =>
        testEvent(item, access.user.id, classNames.get(item.class_id), timeZone)
      ),
    ];
    const managedEvents = await listManagedEvents(calendar, access.user.id);
    const existingByKey = new Map(
      managedEvents
        .filter((event) => event.id && event.extendedProperties?.private?.tasktornadoKey)
        .map((event) => [
          event.extendedProperties!.private!.tasktornadoKey!,
          event.id!,
        ])
    );
    const desiredKeys = new Set(desired.map((item) => item.key));

    let created = 0;
    let updated = 0;
    let removed = 0;

    for (const item of desired) {
      const eventId = existingByKey.get(item.key);
      if (eventId) {
        await calendar.events.patch({
          calendarId: CALENDAR_ID,
          eventId,
          requestBody: item.event,
        });
        updated += 1;
      } else {
        await calendar.events.insert({
          calendarId: CALENDAR_ID,
          requestBody: item.event,
        });
        created += 1;
      }
    }

    for (const event of managedEvents) {
      const key = event.extendedProperties?.private?.tasktornadoKey;
      if (event.id && key && !desiredKeys.has(key)) {
        await calendar.events.delete({ calendarId: CALENDAR_ID, eventId: event.id });
        removed += 1;
      }
    }

    return NextResponse.json({
      success: true,
      created,
      updated,
      removed,
      total: desired.length,
    });
  } catch (error) {
    console.error('Google Calendar sync failed:', error);
    return NextResponse.json(
      { error: 'Google Calendar sync failed. Please try reconnecting.' },
      { status: 500 }
    );
  }
}
