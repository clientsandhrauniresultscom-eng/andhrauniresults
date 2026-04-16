-- Admin Auth Challenges Table for QR + Fingerprint Login
-- This table stores authentication challenges for the QR code login system

-- Create admin_auth_challenges table
CREATE TABLE IF NOT EXISTS admin_auth_challenges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    challenge_token TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_webauthn_credentials table (stores ONLY your pre-enrolled fingerprint)
CREATE TABLE IF NOT EXISTS admin_webauthn_credentials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    credential_id TEXT NOT NULL UNIQUE,
    public_key TEXT NOT NULL,
    counter INTEGER DEFAULT 0,
    friendly_name TEXT DEFAULT 'Admin Fingerprint',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_auth_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_webauthn_credentials ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (for edge functions)
CREATE POLICY "Service role full access on challenges" ON admin_auth_challenges
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on credentials" ON admin_webauthn_credentials
    FOR ALL USING (auth.role() = 'service_role');

-- Create index on challenge_token for fast lookups
CREATE INDEX IF NOT EXISTS idx_challenges_token ON admin_auth_challenges(challenge_token);

-- Create index on status for cleanup queries
CREATE INDEX IF NOT EXISTS idx_challenges_status ON admin_auth_challenges(status);

-- Function to cleanup expired challenges (call periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_challenges()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
    DELETE FROM admin_auth_challenges 
    WHERE expires_at < NOW() OR status = 'expired';
$$;

-- Grant execute to service_role
GRANT EXECUTE ON FUNCTION cleanup_expired_challenges() TO service_role;