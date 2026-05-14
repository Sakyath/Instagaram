import { useState } from 'react';
import { Link } from 'react-router';
import { Instagram } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const [form, setForm] = useState({ email: '', fullName: '', username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.username) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const data = await register(form);
      if (data.success) {
        toast.success('Account created! Welcome!');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[350px]">
        <div className="border border-border rounded-lg bg-card p-8 mb-3">
          <div className="flex justify-center mb-4">
            <Instagram className="w-12 h-12" />
          </div>
          <p className="text-center text-muted-foreground font-semibold text-sm mb-6">
            Sign up to see photos and videos from your friends.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded text-sm outline-none focus:border-muted-foreground" />
            <input type="text" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Full Name" className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded text-sm outline-none focus:border-muted-foreground" />
            <input type="text" name="username" value={form.username} onChange={handleChange} placeholder="Username" className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded text-sm outline-none focus:border-muted-foreground" />
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password" className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded text-sm outline-none focus:border-muted-foreground" />

            <p className="text-xs text-muted-foreground text-center">
              By signing up, you agree to our Terms, Privacy Policy and Cookies Policy.
            </p>

            <button type="submit" disabled={isLoading} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg text-sm transition-colors disabled:opacity-50">
              {isLoading ? 'Signing up...' : 'Sign up'}
            </button>
          </form>
        </div>

        <div className="border border-border rounded-lg bg-card p-5 text-center">
          <p className="text-sm">
            Have an account? <Link to="/login" className="text-blue-500 font-semibold">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
