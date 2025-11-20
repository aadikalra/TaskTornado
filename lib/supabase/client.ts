import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// Check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

class CustomCookieStore implements Storage {
  getItem(key: string): string | null {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      if (cookie.startsWith(key + '=')) {
        return cookie.substring(key.length + 1);
      }
    }
    return null;
  }

  setItem(key: string, value: string): void {
    if (typeof document === 'undefined') return;
    let expires = '';
    const rememberMe = localStorage.getItem('remember-me') === 'true';
    const days = rememberMe ? 30 : 1;
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = '; expires=' + date.toUTCString();
    document.cookie = key + '=' + value + expires + '; path=/';
  }

  removeItem(key: string): void {
    if (typeof document === 'undefined') return;
    document.cookie = key + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }

  get length(): number {
    if (typeof document === 'undefined' || !document.cookie) return 0;
    return document.cookie.split(';').length;
  }

  clear(): void {
    if (typeof document === 'undefined') return;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
      document.cookie = name.trim() + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    }
  }

  key(index: number): string | null {
    if (typeof document === 'undefined' || !document.cookie) return null;
    const cookies = document.cookie.split(';');
    if (index < 0 || index >= cookies.length) return null;
    const cookie = cookies[index].trim();
    const eqPos = cookie.indexOf('=');
    return eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
  }
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: new CustomCookieStore(),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

export type { Database } from '@/types/database.types';

export default supabase;
