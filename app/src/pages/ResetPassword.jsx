import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Instagram } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../context/AuthContext.jsx';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }

    setIsLoading(true);
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      if (data.success) {
        toast.success('Password reset successful!');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[350px]">
        <div className="border border-border rounded-lg bg-card p-8">
          <div className="flex justify-center mb-6"><Instagram className="w-12 h-12" /></div>
          <h2 className="text-center font-semibold mb-4">Create new password</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded text-sm outline-none" />
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded text-sm outline-none" />
            <button type="submit" disabled={isLoading} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg text-sm disabled:opacity-50">
              {isLoading ? 'Resetting...' : 'Reset password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
