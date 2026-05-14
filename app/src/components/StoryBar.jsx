import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Plus } from 'lucide-react';
import { api } from '../context/AuthContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import CreateStoryModal from './CreateStoryModal.jsx';

export default function StoryBar() {
  const [stories, setStories] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data } = await api.get('/stories');
      if (data.success) setStories(data.stories || []);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto no-scrollbar py-4 px-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1">
            <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
            <div className="w-12 h-3 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-4 overflow-x-auto no-scrollbar py-4 px-4 border-b border-border">
        {/* My Story */}
        <button onClick={() => setShowCreate(true)} className="flex-shrink-0 flex flex-col items-center gap-1">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center relative">
            {user?.avatar?.url ? (
              <img src={user.avatar.url} alt="" className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                {user?.username?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-background">
              <Plus className="w-3 h-3 text-white" />
            </div>
          </div>
          <span className="text-xs truncate max-w-[64px]">Your story</span>
        </button>

        {/* Other Stories */}
        {stories.map((group) => {
          const hasUnviewed = group.stories.some((s) =>
            !s.viewers.some((v) => v.user?._id === user?._id)
          );
          return (
            <button
              key={group.user._id}
              onClick={() => navigate('/stories', { state: { storiesGroup: group } })}
              className="flex-shrink-0 flex flex-col items-center gap-1"
            >
              <div className={`w-16 h-16 rounded-full p-[2px] ${hasUnviewed ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' : 'bg-muted'}`}>
                <div className="w-full h-full rounded-full bg-background p-[2px]">
                  {group.user.avatar?.url ? (
                    <img src={group.user.avatar.url} alt={group.user.username} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                      {group.user.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-xs truncate max-w-[64px]">{group.user.username}</span>
            </button>
          );
        })}
      </div>
      {showCreate && <CreateStoryModal onClose={() => { setShowCreate(false); fetchStories(); }} />}
    </>
  );
}
