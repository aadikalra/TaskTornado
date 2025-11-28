'use client';

import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface RateLimitData {
  user_id: string;
  request_date: string;
  request_count: number;
  last_request: string;
}

export class RateLimitService {
  private static instance: RateLimitService;
  
  static getInstance(): RateLimitService {
    if (!RateLimitService.instance) {
      RateLimitService.instance = new RateLimitService();
    }
    return RateLimitService.instance;
  }

  async getRateLimitData(userId: string, modelType: 'quick' | 'deeper' | 'cloud'): Promise<number> {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      console.log('Getting rate limit:', { userId, modelType, today });
      
      // Use RPC function to safely get rate limit data
      const { data, error } = await supabase.rpc('get_rate_limit_by_model', {
        p_user_id: userId,
        p_model_type: modelType
      });

      if (error) {
        console.error('Error fetching rate limit data:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return 0;
      }

      console.log('Rate limit data retrieved:', { data });
      return data || 0;
    } catch (error) {
      console.error('Error in getRateLimitData:', error);
      return 0;
    }
  }

  async updateRateLimitData(
    userId: string, 
    modelType: 'quick' | 'deeper' | 'cloud', 
    count: number
  ): Promise<void> {
    try {
      console.log('Updating rate limit:', { userId, modelType, count });
      
      // Use RPC function to safely update rate limit data
      const { data, error } = await supabase.rpc('update_rate_limit_by_model', {
        p_user_id: userId,
        p_model_type: modelType,
        p_count: count
      });

      if (error) {
        console.error('Error updating rate limit data:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
      } else {
        console.log('Successfully updated rate limit:', { data });
      }
    } catch (error) {
      console.error('Error in updateRateLimitData:', error);
    }
  }

  async syncRateLimits(
    userId: string,
    cookieCounts: {
      quick: number;
      deeper: number;
      cloud: number;
    }
  ): Promise<{
    quick: number;
    deeper: number;
    cloud: number;
  }> {
    const result = {
      quick: cookieCounts.quick,
      deeper: cookieCounts.deeper,
      cloud: cookieCounts.cloud
    };

    try {
      // Get database counts for all models
      const [dbQuick, dbDeeper, dbCloud] = await Promise.all([
        this.getRateLimitData(userId, 'quick'),
        this.getRateLimitData(userId, 'deeper'),
        this.getRateLimitData(userId, 'cloud')
      ]);

      // Use maximum between cookie and database for each model
      const maxQuick = Math.max(cookieCounts.quick, dbQuick);
      const maxDeeper = Math.max(cookieCounts.deeper, dbDeeper);
      const maxCloud = Math.max(cookieCounts.cloud, dbCloud);

      // Update database with maximum values
      await Promise.all([
        this.updateRateLimitData(userId, 'quick', maxQuick),
        this.updateRateLimitData(userId, 'deeper', maxDeeper),
        this.updateRateLimitData(userId, 'cloud', maxCloud)
      ]);

      result.quick = maxQuick;
      result.deeper = maxDeeper;
      result.cloud = maxCloud;

    } catch (error) {
      console.error('Error syncing rate limits:', error);
    }

    return result;
  }
}

export const rateLimitService = RateLimitService.getInstance();
