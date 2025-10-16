import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Rate limiting utilities for AI API usage
 */
export class RateLimiter {
  private static readonly DAILY_LIMIT = 40;

  /**
   * Check if user can make a request
   */
  static async canMakeRequest(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_rate_limit', {
        p_user_id: userId,
        p_limit: this.DAILY_LIMIT
      });

      if (error) {
        console.error('Rate limit check error:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return false;
    }
  }

  /**
   * Increment request count for user
   */
  static async incrementRequest(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('increment_rate_limit', {
        p_user_id: userId
      });

      if (error) {
        console.error('Rate limit increment error:', error);
        throw error;
      }

      return data || 0;
    } catch (error) {
      console.error('Rate limit increment failed:', error);
      throw error;
    }
  }

  /**
   * Get current request count for user today
   */
  static async getCurrentCount(userId: string): Promise<number> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('rate_limits')
        .select('request_count')
        .eq('user_id', userId)
        .eq('request_date', today)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Rate limit fetch error:', error);
        return 0;
      }

      return data?.request_count || 0;
    } catch (error) {
      console.error('Rate limit fetch failed:', error);
      return 0;
    }
  }
}

/**
 * Generate a user ID from request (for anonymous users)
 */
export function getUserIdFromRequest(req: Request): string {
  // Try to get user ID from session/auth first
  // For now, use IP + User-Agent as fallback for anonymous users
  const ip = req.headers.get('x-forwarded-for') ||
             req.headers.get('x-real-ip') ||
             'unknown';

  const userAgent = req.headers.get('user-agent') || 'unknown';

  // Create a simple hash of IP + User-Agent for consistent anonymous user ID
  return btoa(`${ip}:${userAgent}`).slice(0, 16);
}
