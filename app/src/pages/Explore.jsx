import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Search, Heart, MessageCircle } from 'lucide-react';
import { api } from '../context/AuthContext.jsx';
import { Skeleton } from '@/components/ui/skeleton';
import { useInView } from 'react-intersection-observer';

export default function Explore() {
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const navigate = useNavigate();
  const { ref, inView } = useInView();

  const fetchExplore = useCallback(async (pageNum = 1) => {
    try {
      const { data } = await api.get(`/search/explore?page=${pageNum}&limit=24`);
      if (data.success) {
        if (pageNum === 1) {
          setPosts(data.posts);
          setReels(data.reels);
        } else {
          setPosts((prev) => [...prev, ...data.posts]);
        }
        setHasMore(data.posts.length === 24);
      }
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchExplore(1); }, [fetchExplore]);

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      setPage((prev) => prev + 1);
      fetchExplore(page + 1);
    }
  }, [inView, hasMore, isLoading, page, fetchExplore]);

  return (
    <div className="max-w-[935px] mx-auto px-4 py-8">
      {/* Search Bar */}
      <div className="mb-6">
        <button onClick={() => navigate('/search')} className="w-full flex items-center gap-3 px-4 py-2.5 bg-muted rounded-lg text-muted-foreground">
          <Search className="w-4 h-4" />
          <span className="text-sm">Search</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b border-border">
        <button onClick={() => setActiveTab('posts')} className={`pb-3 text-sm font-semibold ${activeTab === 'posts' ? 'border-b-2 border-foreground' : 'text-muted-foreground'}`}>
          Posts
        </button>
        <button onClick={() => setActiveTab('reels')} className={`pb-3 text-sm font-semibold ${activeTab === 'reels' ? 'border-b-2 border-foreground' : 'text-muted-foreground'}`}>
          Reels
        </button>
      </div>

      {/* Reels Row */}
      {activeTab === 'posts' && reels.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold mb-3">Suggested Reels</h3>
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {reels.map((reel) => (
              <button key={reel._id} onClick={() => navigate('/reels')} className="flex-shrink-0 w-[180px] aspect-[9/16] rounded-lg overflow-hidden relative group">
                <video src={reel.video?.url} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <p className="text-white text-xs font-semibold line-clamp-2">{reel.caption}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-1 md:gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 md:gap-4">
          {(activeTab === 'posts' ? posts : reels).map((item) => (
            <button
              key={item._id}
              onClick={() => navigate(`/profile/${item.user?.username}`)}
              className="aspect-square relative group overflow-hidden bg-muted"
            >
              {item.images?.[0]?.url || item.video?.url ? (
                <img src={item.images?.[0]?.url || item.thumbnail?.url} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = item.video?.url; }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <video src={item.video?.url} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                <div className="flex items-center gap-1.5 text-white">
                  <Heart className="w-5 h-5 fill-white" />
                  <span className="font-semibold text-sm">{item.likesCount}</span>
                </div>
                <div className="flex items-center gap-1.5 text-white">
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span className="font-semibold text-sm">{item.commentsCount}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div ref={ref} className="py-8 text-center text-muted-foreground text-sm">
        {hasMore ? 'Loading more...' : ''}
      </div>
    </div>
  );
}
