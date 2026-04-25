import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('gmail-auth');

    if (!authCookie) {
      return NextResponse.json({ error: 'Not authenticated with Gmail' }, { status: 401 });
    }

    const authData = JSON.parse(authCookie.value);

    if (!authData.access_token) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 });
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: authData.access_token });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Get full message
    const response = await gmail.users.messages.get({
      userId: 'me',
      id,
      format: 'full',
    });

    const message = response.data;
    const headers = message.payload?.headers || [];
    const getHeader = (name: string) => headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

    // Extract body content
    let bodyHtml = '';
    let bodyText = '';

    function extractBody(payload: any) {
      if (payload.mimeType === 'text/html' && payload.body?.data) {
        bodyHtml = Buffer.from(payload.body.data, 'base64url').toString('utf-8');
      } else if (payload.mimeType === 'text/plain' && payload.body?.data) {
        bodyText = Buffer.from(payload.body.data, 'base64url').toString('utf-8');
      }

      if (payload.parts) {
        for (const part of payload.parts) {
          extractBody(part);
        }
      }
    }

    if (message.payload) {
      extractBody(message.payload);
    }

    // Get attachments metadata
    const attachments: { filename: string; mimeType: string; size: number }[] = [];
    function extractAttachments(payload: any) {
      if (payload.filename && payload.body?.attachmentId) {
        attachments.push({
          filename: payload.filename,
          mimeType: payload.mimeType || 'application/octet-stream',
          size: payload.body.size || 0,
        });
      }
      if (payload.parts) {
        for (const part of payload.parts) {
          extractAttachments(part);
        }
      }
    }

    if (message.payload) {
      extractAttachments(message.payload);
    }

    return NextResponse.json({
      id: message.id,
      threadId: message.threadId,
      snippet: message.snippet,
      labelIds: message.labelIds,
      isUnread: message.labelIds?.includes('UNREAD') || false,
      isStarred: message.labelIds?.includes('STARRED') || false,
      internalDate: message.internalDate,
      from: getHeader('From'),
      to: getHeader('To'),
      subject: getHeader('Subject'),
      date: getHeader('Date'),
      cc: getHeader('Cc'),
      replyTo: getHeader('Reply-To'),
      bodyHtml,
      bodyText,
      attachments,
    });

  } catch (error: any) {
    console.error('Error fetching Gmail message:', error);

    if (error.code === 401 || error.message?.includes('invalid_grant')) {
      return NextResponse.json({ error: 'Authentication expired', needsReauth: true }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to fetch message', details: error.message }, { status: 500 });
  }
}
