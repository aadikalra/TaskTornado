import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';
import { google } from 'googleapis';

import { supabaseAdmin } from '@/lib/supabase/admin';

export type GoogleOAuthService = 'gmail' | 'classroom';

export function googleIntegrationsEnabled() {
  return process.env.GOOGLE_INTEGRATIONS_ENABLED === 'true';
}

type StoredGoogleTokens = {
  access_token?: string | null;
  refresh_token?: string | null;
  scope?: string;
  token_type?: string | null;
  expiry_date?: number | null;
};

type GoogleAccount = {
  id?: string | null;
  email?: string | null;
  name?: string | null;
  picture?: string | null;
};

function getEncryptionKey() {
  const secret = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error('Missing dedicated GOOGLE_TOKEN_ENCRYPTION_KEY');
  }

  return createHash('sha256').update(secret).digest();
}

function encryptTokens(tokens: StoredGoogleTokens) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(tokens), 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return ['v1', iv, tag, ciphertext]
    .map((part) => (typeof part === 'string' ? part : part.toString('base64url')))
    .join('.');
}

function decryptTokens(payload: string): StoredGoogleTokens {
  const [version, ivValue, tagValue, ciphertextValue] = payload.split('.');
  if (
    version !== 'v1' ||
    !ivValue ||
    !tagValue ||
    !ciphertextValue
  ) {
    throw new Error('Invalid encrypted Google token payload');
  }

  const decipher = createDecipheriv(
    'aes-256-gcm',
    getEncryptionKey(),
    Buffer.from(ivValue, 'base64url')
  );
  decipher.setAuthTag(Buffer.from(tagValue, 'base64url'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextValue, 'base64url')),
    decipher.final(),
  ]);

  return JSON.parse(plaintext.toString('utf8'));
}

function getRedirectUri(service: GoogleOAuthService) {
  const baseUrl =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000';
  return `${baseUrl}/api/auth/google-${service}`;
}

export function createGoogleOAuthClient(service: GoogleOAuthService) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth is not configured');
  }

  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    getRedirectUri(service)
  );
}

export async function saveGoogleConnection(
  userId: string,
  service: GoogleOAuthService,
  tokens: StoredGoogleTokens,
  account: GoogleAccount
) {
  const { error } = await supabaseAdmin
    .from('google_oauth_connections')
    .upsert(
      {
        user_id: userId,
        service,
        encrypted_tokens: encryptTokens(tokens),
        google_account_id: account.id || null,
        google_email: account.email || null,
        google_name: account.name || null,
        google_picture: account.picture || null,
        scopes: tokens.scope?.split(' ').filter(Boolean) || [],
        token_expires_at: tokens.expiry_date
          ? new Date(tokens.expiry_date).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,service' }
    );

  if (error) throw error;
}

export async function getGoogleConnection(
  userId: string,
  service: GoogleOAuthService
) {
  const { data, error } = await supabaseAdmin
    .from('google_oauth_connections')
    .select(
      'encrypted_tokens,google_account_id,google_email,google_name,google_picture,scopes,token_expires_at'
    )
    .eq('user_id', userId)
    .eq('service', service)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    tokens: decryptTokens(data.encrypted_tokens),
    user: {
      id: data.google_account_id,
      email: data.google_email,
      name: data.google_name,
      picture: data.google_picture,
    },
    scopes: data.scopes || [],
    expiresAt: data.token_expires_at,
  };
}

export async function getGoogleClientForUser(
  userId: string,
  service: GoogleOAuthService
) {
  if (!googleIntegrationsEnabled()) return null;

  const connection = await getGoogleConnection(userId, service);
  if (!connection) return null;

  const client = createGoogleOAuthClient(service);
  client.setCredentials(connection.tokens);
  client.on('tokens', (newTokens) => {
    const mergedTokens = {
      ...connection.tokens,
      ...newTokens,
      refresh_token:
        newTokens.refresh_token || connection.tokens.refresh_token,
    };

    void saveGoogleConnection(
      userId,
      service,
      mergedTokens,
      connection.user
    ).catch((error) => {
      console.error(`Failed to persist refreshed ${service} token:`, error);
    });
  });

  return { client, connection };
}

export async function disconnectGoogleService(
  userId: string,
  service: GoogleOAuthService
) {
  const connection = await getGoogleConnection(userId, service);

  if (connection) {
    const token =
      connection.tokens.refresh_token || connection.tokens.access_token;
    if (token) {
      try {
        await createGoogleOAuthClient(service).revokeToken(token);
      } catch (error) {
        console.warn(`Google ${service} token revocation failed:`, error);
      }
    }
  }

  const { error } = await supabaseAdmin
    .from('google_oauth_connections')
    .delete()
    .eq('user_id', userId)
    .eq('service', service);

  if (error) throw error;
}
