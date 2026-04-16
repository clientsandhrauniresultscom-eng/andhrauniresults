# QR + Fingerprint Admin Login Setup Guide

## What's Been Built

- Database: admin_auth_challenges and admin_webauthn_credentials tables
- Edge Functions: generate-qr, verify-login, verify-password
- Frontend: New AdminLogin.tsx with QR + AdminPhoneVerify.tsx

---

## Deployment Steps

### Step 1: Run Database Migration

Go to Supabase Dashboard → SQL Editor and run this SQL:

-- Admin Auth Challenges Table for QR + Fingerprint Login
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

-- Create admin_webauthn_credentials table (stores your pre-enrolled fingerprint)
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_challenges_token ON admin_auth_challenges(challenge_token);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON admin_auth_challenges(status);


### Step 2: Deploy Edge Functions

Go to Supabase Dashboard → Edge Functions and deploy these files:

1. supabase/functions/generate-qr/index.ts
2. supabase/functions/verify-login/index.ts
3. supabase/functions/verify-password/index.ts

For each function:
- Click "New Function"
- Upload the index.ts file
- Enable "Enable Function URL" in settings


### Step 3: Test First Enrollment

1. Go to /admin/login on your laptop
2. Scan the QR code with your phone
3. On your phone, tap "Register My Fingerprint"
4. Verify with your fingerprint
5. You're enrolled!


### Step 4: Test Login

1. Go to /admin/login
2. Scan QR with phone
3. Verify with fingerprint
4. Auto-redirected to admin!


---

## How It Works

Laptop                           Phone
   |                               |
   |  1. Show QR Code              |
   |  (refreshes every 60s)        |
   |                               |
   |  2. Poll every 2s <----------|
   |                      |        |
   |                      | 3. Scan QR
   |                      |        |
   |                      V        |
   |               /admin/verify?   
   |               challenge=xxx&  
   |               token=xxx       
   |                      |        |
   |                      | 4. Tap 
   |                      | fingerprint
   |                      |        
   |                      V        
   |               WebAuthn        
   |               verifies       
   |                      |        
   |  5. Polling detects --------|
   |    verified status          
   |                               |
   V                               |
LOGIN!                            |


---

## Security Features

| Feature | Protection |
|---------|-----------|
| Challenge expires in 60s | Prevents replay attacks |
| Only YOUR fingerprint works | No unauthorized access |
| No password in frontend | Can't steal from client |
| Server-side password check | Fallback is secure |
| QR rotates every refresh | Prevents QR code sharing |


---

## Fallback Password

If QR/fingerprint fails, click "Use password instead" on login page.

Password: admins@andhrauniresults.online@2025#


---

## Troubleshooting

- QR not loading? Check edge function is deployed
- Fingerprint not working? Use Chrome or Safari with WebAuthn support
- Verification pending? QR expires after 60 seconds, refresh if needed