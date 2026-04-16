import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Eye, EyeOff, QrCode, Smartphone, RefreshCw, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/integrations/supabase/client';

const SUPABASE_KEY = SUPABASE_ANON_KEY;
const POLL_INTERVAL = 2000; // 2 seconds

export default function AdminLogin() {
  const [mode, setMode] = useState<'qr' | 'password'>('qr');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scanInstructions, setScanInstructions] = useState(false);
  
  const { login } = useAdmin();
  const navigate = useNavigate();

  const generateChallenge = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Use the function URL directly
      const functionUrl = `${SUPABASE_URL}/functions/v1/generate-qr`;
      console.log('Calling function:', functionUrl);
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsemZsb2Nsc3phcWlsdXFndWVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDY4MjksImV4cCI6MjA5MTMyMjgyOX0.2P5s3gNd5WMBSRQt9oYDzDfz1rf_u_vdf1fkklS3gX0',
        },
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errText = await response.text();
        console.error('Function error:', errText);
        setError('Function error: ' + response.status);
        return;
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setQrUrl(data.qrUrl);
        setChallengeId(data.challengeId);
        setChallengeToken(data.challengeToken);
        setExpiresAt(data.expiresAt);
      } else {
        setError(data.error || 'Failed to generate QR code');
      }
    } catch (err) {
      console.error('Generate challenge error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pollForVerification = useCallback(async () => {
    if (!challengeId || !challengeToken) return;

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/admin_auth_challenges?id=eq.${challengeId}&select=status`, {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsemZsb2Nsc3phcWlsdXFndWVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDY4MjksImV4cCI6MjA5MTMyMjgyOX0.2P5s3gNd5WMBSRQt9oYDzDfz1rf_u_vdf1fkklS3gX0',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsemZsb2Nsc3phcWlsdXFndWVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDY4MjksImV4cCI6MjA5MTMyMjgyOX0.2P5s3gNd5WMBSRQt9oYDzDfz1rf_u_vdf1fkklS3gX0',
        },
      });
      
      const data = await response.json();
      
      if (data && data[0]?.status === 'verified') {
        login(challengeToken);
        navigate('/admin');
      }
    } catch (err) {
      console.error('Poll error:', err);
    }
  }, [challengeId, challengeToken, login, navigate]);

  useEffect(() => {
    if (mode === 'qr') {
      generateChallenge();
      setScanInstructions(false);
    }
  }, [mode, generateChallenge]);

  useEffect(() => {
    if (mode !== 'qr' || !challengeId) return;

    const interval = setInterval(pollForVerification, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [mode, challengeId, pollForVerification]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsemZsb2Nsc3phcWlsdXFndWVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDY4MjksImV4cCI6MjA5MTMyMjgyOX0.2P5s3gNd5WMBSRQt9oYDzDfz1rf_u_vdf1fkklS3gX0',
        },
        body: JSON.stringify({ password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('admin_auth', 'true');
        navigate('/admin');
      } else {
        setError(data.error || 'Invalid password');
      }
    } catch (err) {
      if (login(password)) {
        navigate('/admin');
      } else {
        setError('Invalid password');
      }
    }
  };

  if (mode === 'qr') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <QrCode className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-2xl">Admin Portal</CardTitle>
            <CardDescription>Scan QR code with your phone to login</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {qrUrl ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-white rounded-lg">
                  <QRCodeSVG value={qrUrl} size={200} level="H" />
                </div>
                
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Scan this QR with your phone's camera
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expires in {expiresAt ? new Date(expiresAt).getTime() - Date.now() > 0 
                      ? Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000) 
                      : 0 : 0} seconds
                  </p>
                </div>

                {!scanInstructions ? (
                  <Button 
                    variant="outline" 
                    onClick={() => setScanInstructions(true)}
                    className="w-full"
                  >
                    <Smartphone className="mr-2 h-4 w-4" />
                    Show Phone Instructions
                  </Button>
                ) : (
                  <div className="text-left text-sm p-4 bg-muted rounded-lg space-y-2">
                    <p className="font-medium">How to verify:</p>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Scan QR with your phone camera</li>
                      <li>Tap the link that opens</li>
                      <li>Verify with your fingerprint</li>
                      <li>You're in!</li>
                    </ol>
                  </div>
                )}

                <Button 
                  variant="ghost" 
                  onClick={generateChallenge}
                  disabled={isLoading}
                  className="w-full"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh QR Code
                </Button>
              </div>
            ) : (
              <div className="flex justify-center p-8">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="pt-4 border-t">
              <Button 
                variant="link" 
                onClick={() => setMode('password')}
                className="w-full"
              >
                <Eye className="mr-2 h-4 w-4" />
                Use password instead
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Portal</CardTitle>
          <CardDescription>Enter your password to access the admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
          
          <div className="pt-4 border-t mt-4">
            <Button 
              variant="link" 
              onClick={() => setMode('qr')}
              className="w-full"
            >
              <QrCode className="mr-2 h-4 w-4" />
              Use QR Code instead
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}