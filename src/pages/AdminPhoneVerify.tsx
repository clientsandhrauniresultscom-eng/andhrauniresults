import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Fingerprint, CheckCircle, XCircle, Loader2, Shield, AlertCircle } from 'lucide-react';
import { startAuthentication, startRegistration, browserSupportsWebAuthn, platformAuthenticatorIsAvailable } from '@simplewebauthn/browser';

const SUPABASE_URL = "https://ilzfloclszaqiluqguep.supabase.co";
const RP_ID = "andhrauniresults.com";
const RP_NAME = "Andhra University Results";

export default function AdminPhoneVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const challengeId = searchParams.get('challenge');
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'ready' | 'verifying' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [isFirstEnrollment, setIsFirstEnrollment] = useState(false);
  const [supportCheck, setSupportCheck] = useState<{ webauthn: boolean; platform: boolean } | null>(null);

  const checkSupport = useCallback(async () => {
    const webauthn = browserSupportsWebAuthn();
    const platform = webauthn ? await platformAuthenticatorIsAvailable() : false;
    setSupportCheck({ webauthn, platform });
    return { webauthn, platform };
  }, []);

  const getAuthenticationOptions = useCallback(async (): Promise<any> => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/get-auth-options`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsemZsb2Nsc3phcWlsdXFndWVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDY4MjksImV4cCI6MjA5MTMyMjgyOX0.2P5s3gNd5WMBSRQt9oYDzDfz1rf_u_vdf1fkklS3gX0',
      },
      body: JSON.stringify({ challengeId, token }),
    });
    
    return response.json();
  }, [challengeId, token]);

  const verifyCredential = useCallback(async (credential: any, isEnrollment: boolean) => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsemZsb2Nsc3phcWlsdXFndWVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDY4MjksImV4cCI6MjA5MTMyMjgyOX0.2P5s3gNd5WMBSRQt9oYDzDfz1rf_u_vdf1fkklS3gX0',
      },
      body: JSON.stringify({ challengeId, credential, isEnrollment }),
    });
    
    return response.json();
  }, [challengeId]);

  useEffect(() => {
    const init = async () => {
      if (!challengeId || !token) {
        setError('Invalid verification link');
        setStatus('error');
        return;
      }

      const support = await checkSupport();
      if (!support.webauthn) {
        setError('Your browser does not support fingerprint authentication');
        setStatus('error');
        return;
      }
      
      if (!support.platform) {
        setError('No fingerprint sensor found on this device');
        setStatus('error');
        return;
      }

      setStatus('ready');
    };

    init();
  }, [challengeId, token, checkSupport]);

  const handleVerify = async () => {
    setStatus('verifying');
    setError(null);

    try {
      // First check if this is first enrollment (no credentials yet)
      const checkResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/admin_webauthn_credentials?select=id`,
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsemZsb2Nsc3phcWlsdXFndWVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDY4MjksImV4cCI6MjA5MTMyMjgyOX0.2P5s3gNd5WMBSRQt9oYDzDfz1rf_u_vdf1fkklS3gX0',
          }
        }
      );
      
      const existingCreds = await checkResponse.json();
      const isFirstTime = existingCreds.length === 0;
      setIsFirstEnrollment(isFirstTime);

      let credential;
      const challengeBytes = new Uint8Array(32);
      crypto.getRandomValues(challengeBytes);
      
      if (isFirstTime) {
        // First-time: Register new credential
        const userId = new Uint8Array(32);
        crypto.getRandomValues(userId);
        
        const regOptions = {
          rp: { id: RP_ID, name: RP_NAME },
          user: { id: Array.from(userId), name: 'admin', displayName: 'Admin' },
          challenge: Array.from(challengeBytes),
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 },
            { type: 'public-key', alg: -257 },
          ],
          authenticatorSelection: {
            userVerification: 'required',
          },
        } as any;

        credential = await startRegistration({ optionsJSON: regOptions });
      } else {
        // Subsequent: Authenticate with existing credential
        const authOptions = {
          rp: { id: RP_ID },
          challenge: Array.from(challengeBytes),
          allowCredentials: [] as any[],
          userVerification: 'required',
        } as any;

        credential = await startAuthentication({ optionsJSON: authOptions });
      }

      // Send to server for verification
      const result = await verifyCredential(credential, isFirstTime);

      if (result.success) {
        setStatus('success');
        
        // Show success message then redirect
        setTimeout(() => {
          if (isFirstTime) {
            window.location.href = 'https://andhrauniresults.com/admin/login?enrolled=true';
          } else {
            window.location.href = 'https://andhrauniresults.com/admin';
          }
        }, 2000);
      } else {
        setError(result.error || 'Verification failed');
        setStatus('error');
      }

    } catch (err: any) {
      console.error('Verification error:', err);
      
      let errorMessage = 'Authentication failed';
      if (err.message?.includes('NotAllowedError')) {
        errorMessage = 'Authentication cancelled or timed out';
      } else if (err.message?.includes('NotFoundError')) {
        errorMessage = 'No credential found. Please contact admin.';
      } else if (err.message?.includes('InvalidStateError')) {
        errorMessage = 'Credential is no longer valid';
      }
      
      setError(errorMessage);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'success' ? (
              <CheckCircle className="h-16 w-16 text-green-500" />
            ) : status === 'error' ? (
              <XCircle className="h-16 w-16 text-destructive" />
            ) : (
              <Fingerprint className="h-16 w-16 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Verifying...'}
            {status === 'ready' && (isFirstEnrollment ? 'Set Up Fingerprint' : 'Verify Fingerprint')}
            {status === 'verifying' && 'Touch Sensor'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Checking security features...'}
            {status === 'ready' && (isFirstEnrollment 
              ? 'This will register your fingerprint as your login credential' 
              : 'Tap your finger on the sensor to verify')}
            {status === 'verifying' && 'Place your finger on the sensor'}
            {status === 'success' && (isFirstEnrollment 
              ? 'Fingerprint enrolled successfully!' 
              : 'Authentication verified!')}
            {status === 'error' && error}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {status === 'ready' && (
            <Button 
              onClick={handleVerify} 
              className="w-full"
              size="lg"
            >
              <Fingerprint className="mr-2 h-5 w-5" />
              {isFirstEnrollment ? 'Register My Fingerprint' : 'Verify Fingerprint'}
            </Button>
          )}

          {status === 'verifying' && (
            <div className="flex justify-center p-8">
              <Fingerprint className="h-16 w-16 animate-pulse text-primary" />
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-green-700">
                  {isFirstEnrollment 
                    ? 'Fingerprint enrolled! You can now login.' 
                    : 'Verified! Redirecting to admin...'}
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-destructive/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
              
              <Button 
                onClick={() => {
                  setError(null);
                  setStatus('ready');
                }} 
                className="w-full"
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          )}

          {supportCheck && !supportCheck.webauthn && status !== 'loading' && (
            <div className="text-center text-sm text-muted-foreground">
              <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Your device does not support fingerprint authentication.</p>
              <p className="text-xs mt-2">Try using Chrome on Android or Safari on iOS.</p>
            </div>
          )}
          
          {supportCheck && !supportCheck.platform && status !== 'loading' && (
            <div className="text-center text-sm text-muted-foreground mt-2">
              <p className="text-xs">No fingerprint sensor found on this device.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}