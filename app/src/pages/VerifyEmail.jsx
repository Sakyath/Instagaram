import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { Instagram, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../context/AuthContext.jsx';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    verifyEmail();
  }, []);

  const verifyEmail = async () => {
    try {
      const { data } = await api.get(`/auth/verify-email/${token}`);
      if (data.success) setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[350px] text-center">
        <div className="border border-border rounded-lg bg-card p-8">
          <div className="flex justify-center mb-4"><Instagram className="w-12 h-12" /></div>

          {status === 'verifying' && (
            <div className="space-y-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm">Verifying your email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-3">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <h2 className="font-semibold">Email verified!</h2>
              <p className="text-sm text-muted-foreground">Your email has been successfully verified.</p>
              <Link to="/login" className="inline-block w-full bg-blue-500 text-white font-semibold py-2 rounded-lg text-sm mt-3">Log in</Link>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <XCircle className="w-12 h-12 text-red-500 mx-auto" />
              <h2 className="font-semibold">Verification failed</h2>
              <p className="text-sm text-muted-foreground">The link is invalid or has expired.</p>
              <Link to="/login" className="inline-block w-full bg-blue-500 text-white font-semibold py-2 rounded-lg text-sm mt-3">Back to login</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
