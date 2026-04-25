import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('gmail-auth');

    if (!authCookie) {
      return NextResponse.json({ error: 'Not authenticated with Gmail' }, { status: 401 });
    }

    const authData = JSON.parse(authCookie.value);

    if (!authData.access_token) {
      return NextResponse.json({ error: 'No access token' }, { status: 401 });
    }

    // Check if token is expired
    if (authData.expiry_date && Date.now() > authData.expiry_date) {
      return NextResponse.json({ error: 'Token expired', needsReauth: true }, { status: 401 });
    }

    // Create OAuth2 client with the stored access token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: authData.access_token });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const maxResults = parseInt(searchParams.get('maxResults') || '20');
    const pageToken = searchParams.get('pageToken') || undefined;
    const q = searchParams.get('q') || undefined;

    // List messages
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      pageToken,
      q,
    });

    const messageIds = listResponse.data.messages || [];
    const nextPageToken = listResponse.data.nextPageToken;
    const resultSizeEstimate = listResponse.data.resultSizeEstimate;

    // Fetch details for each message (metadata only for list view)
    const messages = await Promise.all(
      messageIds.map(async (msg) => {
        try {
          const detail = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id!,
            format: 'metadata',
            metadataHeaders: ['From', 'To', 'Subject', 'Date', 'Cc'],
          });

          const headers = detail.data.payload?.headers || [];
          const getHeader = (name: string) => headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

          return {
            id: detail.data.id,
            threadId: detail.data.threadId,
            snippet: detail.data.snippet,
            labelIds: detail.data.labelIds,
            isUnread: detail.data.labelIds?.includes('UNREAD') || false,
            isStarred: detail.data.labelIds?.includes('STARRED') || false,
            internalDate: detail.data.internalDate,
            from: getHeader('From'),
            to: getHeader('To'),
            subject: getHeader('Subject'),
            date: getHeader('Date'),
            cc: getHeader('Cc'),
          };
        } catch (err) {
          console.error(`Error fetching message ${msg.id}:`, err);
          return null;
        }
      })
    );

    return NextResponse.json({
      messages: messages.filter(Boolean),
      nextPageToken,
      resultSizeEstimate,
    });

  } catch (error: any) {
    console.error('Error fetching Gmail messages:', error);

    if (error.code === 401 || error.message?.includes('invalid_grant')) {
      return NextResponse.json({ error: 'Authentication expired', needsReauth: true }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to fetch messages', details: error.message }, { status: 500 });
  }
}
