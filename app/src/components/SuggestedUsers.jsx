import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { api } from '../context/AuthContext.jsx';
import { Verified } from 'lucide-react';

export default function SuggestedUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users/suggested');
      if (data.success) setUsers(data.users.slice(0, 5));
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  if (loading) return null;

  return (
    <div className="w-full max-w-xs">
      <h3 className="text-sm font-semibold text-muted-foreground mb-3">Suggested for you</h3>
      <div className="space-y-3">
        {users.map((user) => (
          <div key={user._id} className="flex items-center justify-between">
            <Link to={`/profile/${user.username}`} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                {user.avatar?.url ? (
                  <img src={user.avatar.url} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold">{user.username[0]?.toUpperCase()}</div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold">{user.username}</span>
                  {user.isVerified && <Verified className="w-3 h-3 text-blue-500 fill-blue-500" />}
                </div>
                <p className="text-xs text-muted-foreground">{user.fullName}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
