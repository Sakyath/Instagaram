import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Users, FileText, Flag, MessageSquare, ChevronLeft, ShieldCheck, BarChart3, Ban } from 'lucide-react';
import { api } from '../context/AuthContext.jsx';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
    fetchUsers();
    fetchReports();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await api.get('/admin/dashboard');
      if (data.success) setStats(data.stats);
    } catch { /* ignore */ }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      if (data.success) setUsers(data.users);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  };

  const fetchReports = async () => {
    try {
      const { data } = await api.get('/admin/reports');
      if (data.success) setReports(data.reports);
    } catch { /* ignore */ }
  };

  const handleBanUser = async (userId, action) => {
    try {
      await api.post(`/admin/users/${userId}/ban`, { action });
      fetchUsers();
    } catch { /* ignore */ }
  };

  const handleUpdateReport = async (reportId, status) => {
    try {
      await api.put(`/admin/reports/${reportId}`, { status });
      fetchReports();
    } catch { /* ignore */ }
  };

  const statCards = [
    { icon: Users, label: 'Users', value: stats?.totalUsers || 0, color: 'text-blue-500' },
    { icon: FileText, label: 'Posts', value: stats?.totalPosts || 0, color: 'text-green-500' },
    { icon: MessageSquare, label: 'Messages', value: stats?.totalMessages || 0, color: 'text-purple-500' },
    { icon: Flag, label: 'Reports', value: stats?.pendingReports || 0, color: 'text-red-500' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="md:hidden"><ChevronLeft className="w-5 h-5" /></button>
        <ShieldCheck className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-border">
        {['overview', 'users', 'reports'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-semibold capitalize ${activeTab === tab ? 'border-b-2 border-foreground' : 'text-muted-foreground'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Platform Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div><p className="text-sm text-muted-foreground">Reels</p><p className="text-xl font-semibold">{stats?.totalReels || 0}</p></div>
              <div><p className="text-sm text-muted-foreground">Stories</p><p className="text-xl font-semibold">{stats?.totalStories || 0}</p></div>
              <div><p className="text-sm text-muted-foreground">Reports</p><p className="text-xl font-semibold">{stats?.totalReports || 0}</p></div>
              <div><p className="text-sm text-muted-foreground">New users today</p><p className="text-xl font-semibold">{stats?.usersToday || 0}</p></div>
              <div><p className="text-sm text-muted-foreground">Posts today</p><p className="text-xl font-semibold">{stats?.postsToday || 0}</p></div>
            </div>
          </div>
        </div>
      )}

      {/* Users */}
      {activeTab === 'users' && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 text-xs font-semibold uppercase">User</th>
                <th className="text-left p-3 text-xs font-semibold uppercase hidden md:table-cell">Email</th>
                <th className="text-left p-3 text-xs font-semibold uppercase">Joined</th>
                <th className="text-left p-3 text-xs font-semibold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.slice(0, 50).map((user) => (
                <tr key={user._id} className="hover:bg-accent/50">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
                        {user.avatar?.url ? <img src={user.avatar.url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold">{user.username?.[0]}</div>}
                      </div>
                      <span className="text-sm font-medium">{user.username}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground hidden md:table-cell">{user.email}</td>
                  <td className="p-3 text-sm text-muted-foreground">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}</td>
                  <td className="p-3">
                    <button onClick={() => handleBanUser(user._id, user.isBanned ? 'unban' : 'ban')} className={`text-sm font-semibold ${user.isBanned ? 'text-green-500' : 'text-red-500'}`}>
                      {user.isBanned ? 'Unban' : 'Ban'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No reports</div>
          ) : (
            reports.map((report) => (
              <div key={report._id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Flag className="w-4 h-4 text-red-500" />
                      <span className="font-semibold text-sm capitalize">{report.reason?.replace('_', ' ')}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${report.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : report.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{report.status}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                    <p className="text-xs text-muted-foreground">Reported by {report.reporter?.username} on {new Date(report.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    {report.status === 'pending' && (
                      <>
                        <button onClick={() => handleUpdateReport(report._id, 'resolved')} className="text-sm text-green-500 font-semibold">Resolve</button>
                        <button onClick={() => handleUpdateReport(report._id, 'dismissed')} className="text-sm text-muted-foreground">Dismiss</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
