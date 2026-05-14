import { useState } from 'react';
import { Link } from 'react-router';
import { Instagram, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../context/AuthContext.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }

    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      if (data.success) setSent(true);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[350px]">
        <div className="border border-border rounded-lg bg-card p-8">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-full border-2 border-border flex items-center justify-center">
              <svg className="w-12 h-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
          </div>

          <h2 className="text-center font-semibold mb-2">Trouble logging in?</h2>
          <p className="text-center text-sm text-muted-foreground mb-6">
            {sent ? 'Check your email for a reset link.' : 'Enter your email and we\'ll send you a link to get back into your account.'}
          </p>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded text-sm outline-none" />
              <button type="submit" disabled={isLoading} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg text-sm disabled:opacity-50">
                {isLoading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
          ) : (
            <button onClick={() => setSent(false)} className="w-full text-blue-500 text-sm font-semibold">
              Try another email
            </button>
          )}

          <div className="mt-6 text-center">
            <Link to="/register" className="text-sm text-blue-500 font-semibold flex items-center justify-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Create new account
            </Link>
          </div>
        </div>

        <div className="border border-border rounded-lg bg-card p-4 mt-3 text-center">
          <Link to="/login" className="text-sm font-semibold">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
