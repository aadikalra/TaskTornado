-- Add model_type column to rate_limits table
ALTER TABLE rate_limits ADD COLUMN IF NOT EXISTS model_type TEXT NOT NULL DEFAULT 'quick';

-- Drop old unique constraint if it exists
ALTER TABLE rate_limits DROP CONSTRAINT IF EXISTS rate_limits_user_id_request_date_key;

-- Create new unique constraint that includes model_type
ALTER TABLE rate_limits ADD CONSTRAINT rate_limits_user_date_model_key 
    UNIQUE (user_id, request_date, model_type);

-- Update index
DROP INDEX IF EXISTS idx_rate_limits_user_date;
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_date_model ON rate_limits(user_id, request_date, model_type);

-- Update RLS policy to work with model_type
DROP POLICY IF EXISTS "Users can manage their own rate limits" ON rate_limits;
CREATE POLICY "Users can manage their own rate limits" ON rate_limits
    FOR ALL USING (auth.jwt() ->> 'sub' = user_id);

-- Function to get rate limit by model type
CREATE OR REPLACE FUNCTION get_rate_limit_by_model(p_user_id TEXT, p_model_type TEXT)
RETURNS INTEGER AS $$
DECLARE
    current_count INTEGER;
BEGIN
    SELECT request_count INTO current_count
    FROM rate_limits
    WHERE user_id = p_user_id 
        AND request_date = CURRENT_DATE 
        AND model_type = p_model_type;

    -- If no record exists, count is 0
    IF current_count IS NULL THEN
        RETURN 0;
    END IF;

    RETURN current_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update rate limit by model type
CREATE OR REPLACE FUNCTION update_rate_limit_by_model(p_user_id TEXT, p_model_type TEXT, p_count INTEGER)
RETURNS VOID AS $$
BEGIN
    INSERT INTO rate_limits (user_id, request_date, model_type, request_count, last_request, updated_at)
    VALUES (p_user_id, CURRENT_DATE, p_model_type, p_count, NOW(), NOW())
    ON CONFLICT (user_id, request_date, model_type)
    DO UPDATE SET
        request_count = GREATEST(rate_limits.request_count, p_count),
        last_request = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset rate limits for a user (called at midnight)
CREATE OR REPLACE FUNCTION reset_daily_rate_limits(p_user_id TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE rate_limits 
    SET request_count = 0, updated_at = NOW()
    WHERE user_id = p_user_id AND request_date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
