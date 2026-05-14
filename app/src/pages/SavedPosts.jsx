import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Heart, MessageCircle } from 'lucide-react';
import { api } from '../context/AuthContext.jsx';
import { Skeleton } from '@/components/ui/skeleton';

export default function SavedPosts() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const fetchSavedPosts = async () => {
    try {
      const { data } = await api.get('/posts/saved');
      if (data.success) setPosts(data.posts);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  };

  return (
    <div className="max-w-[935px] mx-auto">
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <button onClick={() => navigate(-1)}><ChevronLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">Saved</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-1 md:gap-4 p-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="aspect-square" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg font-semibold mb-2">No saved posts</p>
          <p className="text-muted-foreground text-sm">Save posts to see them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 md:gap-4 p-4">
          {posts.map((post) => (
            <div key={post._id} className="aspect-square relative group overflow-hidden bg-muted cursor-pointer">
              {post.images?.[0]?.url && <img src={post.images[0].url} alt="" className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                <div className="flex items-center gap-1.5 text-white">
                  <Heart className="w-5 h-5 fill-white" />
                  <span className="font-semibold text-sm">{post.likesCount}</span>
                </div>
                <div className="flex items-center gap-1.5 text-white">
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span className="font-semibold text-sm">{post.commentsCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
