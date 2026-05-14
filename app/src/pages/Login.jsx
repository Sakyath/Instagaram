import { useState } from 'react';
import { Link } from 'react-router';
import { Instagram } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const data = await login(email, password);
      if (data.success) {
        toast.success('Welcome back!');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[350px]">
        {/* Login Card */}
        <div className="border border-border rounded-lg bg-card p-8 mb-3">
          <div className="flex justify-center mb-8">
            <Instagram className="w-12 h-12" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded text-sm outline-none focus:border-muted-foreground transition-colors"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded text-sm outline-none focus:border-muted-foreground transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <div className="flex items-center my-5">
            <div className="flex-1 border-t border-border" />
            <span className="px-4 text-xs text-muted-foreground font-semibold">OR</span>
            <div className="flex-1 border-t border-border" />
          </div>

          <button className="w-full text-blue-500 text-sm font-semibold mb-4">
            Log in with Facebook
          </button>

          <div className="text-center">
            <Link to="/forgot-password" className="text-xs text-blue-500">
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Register Card */}
        <div className="border border-border rounded-lg bg-card p-5 text-center">
          <p className="text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-500 font-semibold">Sign up</Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm mb-4">Get the app.</p>
          <div className="flex justify-center gap-2">
            <div className="bg-black text-white px-3 py-2 rounded-lg flex items-center gap-2 text-xs">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              <div className="text-left"><div className="text-[8px]">Download on the</div><div className="font-semibold text-xs -mt-0.5">App Store</div></div>
            </div>
            <div className="bg-black text-white px-3 py-2 rounded-lg flex items-center gap-2 text-xs">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 20.5v-17c0-.83.67-1.5 1.5-1.5h.37L20.7 11.52c.37.28.6.72.6 1.19v.03c0 .47-.23.91-.6 1.19L4.87 22h-.37c-.83 0-1.5-.67-1.5-1.5z"/></svg>
              <div className="text-left"><div className="text-[8px]">GET IT ON</div><div className="font-semibold text-xs -mt-0.5">Google Play</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
