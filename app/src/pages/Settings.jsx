import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Moon, Sun, Bell, Lock, UserX, Shield, HelpCircle, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Settings() {
  const { user, logout, api } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    try {
      const { data } = await api.post('/auth/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      if (data.success) {
        toast.success('Password changed!');
        setShowChangePassword(false);
        setPasswords({ current: '', new: '', confirm: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const sections = [
    {
      title: 'Preferences',
      items: [
        { icon: isDark ? Sun : Moon, label: `${isDark ? 'Light' : 'Dark'} mode`, action: toggleTheme },
        { icon: Bell, label: 'Notifications', action: () => navigate('/notifications') },
        { icon: Lock, label: 'Privacy', action: () => toast.info('Coming soon!') },
      ],
    },
    {
      title: 'Account',
      items: [
        { icon: Shield, label: 'Change password', action: () => setShowChangePassword(!showChangePassword) },
        { icon: UserX, label: 'Blocked accounts', action: () => toast.info('Coming soon!') },
      ],
    },
    {
      title: 'More',
      items: [
        { icon: HelpCircle, label: 'Help', action: () => toast.info('Coming soon!') },
        { icon: LogOut, label: 'Log out', action: logout, danger: true },
      ],
    },
  ];

  return (
    <div className="max-w-[600px] mx-auto">
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <button onClick={() => navigate(-1)}><ChevronLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">Settings</h1>
      </div>

      <div className="p-4 space-y-6">
        {showChangePassword && (
          <form onSubmit={handleChangePassword} className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold text-sm">Change password</h3>
            <input type="password" value={passwords.current} onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))} placeholder="Current password" className="w-full px-3 py-2 border border-border rounded text-sm bg-transparent outline-none" />
            <input type="password" value={passwords.new} onChange={(e) => setPasswords((p) => ({ ...p, new: e.target.value }))} placeholder="New password" className="w-full px-3 py-2 border border-border rounded text-sm bg-transparent outline-none" />
            <input type="password" value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))} placeholder="Confirm password" className="w-full px-3 py-2 border border-border rounded text-sm bg-transparent outline-none" />
            <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded text-sm font-semibold">Update password</button>
          </form>
        )}

        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">{section.title}</h2>
            <div className="bg-card border border-border rounded-lg divide-y divide-border">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors first:rounded-t-lg last:rounded-b-lg ${item.danger ? 'text-red-500' : ''}`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
