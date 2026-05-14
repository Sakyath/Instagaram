import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Heart, MessageCircle, UserPlus, AtSign, Check, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { api } from '../context/AuthContext.jsx';
import { Skeleton } from '@/components/ui/skeleton';

const iconMap = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  follow_request: UserPlus,
  mention: AtSign,
  reel_like: Heart,
  reel_comment: MessageCircle,
  story_reply: MessageCircle,
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/all/read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch { /* ignore */ }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch { /* ignore */ }
  };

  const filtered = activeTab === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="max-w-[600px] mx-auto">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="text-sm text-blue-500 font-semibold">
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex gap-4 px-4 pt-3 border-b border-border">
        <button onClick={() => setActiveTab('all')} className={`pb-3 text-sm font-semibold ${activeTab === 'all' ? 'border-b-2 border-foreground' : 'text-muted-foreground'}`}>All</button>
        <button onClick={() => setActiveTab('unread')} className={`pb-3 text-sm font-semibold ${activeTab === 'unread' ? 'border-b-2 border-foreground' : 'text-muted-foreground'}`}>
          Unread {unreadCount > 0 && <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5">{unreadCount}</span>}
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3"><Skeleton className="w-10 h-10 rounded-full" /><Skeleton className="h-4 w-48" /></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground text-sm">No notifications</div>
      ) : (
        <div>
          {filtered.map((notification) => {
            const Icon = iconMap[notification.type] || Heart;
            return (
              <div
                key={notification._id}
                onClick={() => !notification.isRead && markAsRead(notification._id)}
                className={`flex items-center gap-3 p-4 hover:bg-accent/50 transition-colors cursor-pointer ${!notification.isRead ? 'bg-accent/30' : ''}`}
              >
                <div className="relative flex-shrink-0">
                  <Link to={`/profile/${notification.sender?.username}`} onClick={(e) => e.stopPropagation()}>
                    <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                      {notification.sender?.avatar?.url ? (
                        <img src={notification.sender.avatar.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold">{notification.sender?.username?.[0]}</div>
                      )}
                    </div>
                  </Link>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <Link to={`/profile/${notification.sender?.username}`} onClick={(e) => e.stopPropagation()} className="font-semibold">{notification.sender?.username}</Link>{' '}
                    {notification.type === 'like' && 'liked your post'}
                    {notification.type === 'comment' && 'commented on your post'}
                    {notification.type === 'follow' && 'started following you'}
                    {notification.type === 'follow_request' && 'requested to follow you'}
                    {notification.type === 'mention' && 'mentioned you'}
                    {notification.type === 'reel_like' && 'liked your reel'}
                    {notification.type === 'reel_comment' && 'commented on your reel'}
                    {notification.type === 'story_reply' && 'replied to your story'}
                    {notification.text && `: "${notification.text}"`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : ''}
                  </p>
                </div>

                {notification.post?.images?.[0]?.url && (
                  <img src={notification.post.images[0].url} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                )}

                <button onClick={(e) => { e.stopPropagation(); deleteNotification(notification._id); }} className="p-1 text-muted-foreground hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
