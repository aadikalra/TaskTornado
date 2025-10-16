-- Create rate_limits table for tracking AI API usage
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    request_count INTEGER DEFAULT 0,
    last_request TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, request_date)
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_date ON rate_limits(user_id, request_date);

-- Enable RLS (Row Level Security)
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see/modify their own records
CREATE POLICY "Users can manage their own rate limits" ON rate_limits
    FOR ALL USING (auth.jwt() ->> 'sub' = user_id);

-- Create function to increment rate limit
CREATE OR REPLACE FUNCTION increment_rate_limit(p_user_id TEXT)
RETURNS INTEGER AS $$
DECLARE
    current_count INTEGER;
    new_count INTEGER;
BEGIN
    -- Insert or update the rate limit record
    INSERT INTO rate_limits (user_id, request_count, last_request, updated_at)
    VALUES (p_user_id, 1, NOW(), NOW())
    ON CONFLICT (user_id, request_date)
    DO UPDATE SET
        request_count = rate_limits.request_count + 1,
        last_request = NOW(),
        updated_at = NOW()
    RETURNING request_count INTO new_count;

    RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(p_user_id TEXT, p_limit INTEGER DEFAULT 33)
RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
BEGIN
    SELECT request_count INTO current_count
    FROM rate_limits
    WHERE user_id = p_user_id AND request_date = CURRENT_DATE;

    -- If no record exists, count is 0
    IF current_count IS NULL THEN
        RETURN true;
    END IF;

    -- Check if under limit
    RETURN current_count < p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
