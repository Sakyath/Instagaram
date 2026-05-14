import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ChevronLeft, Heart, MessageCircle } from 'lucide-react';
import { api } from '../context/AuthContext.jsx';
import { Skeleton } from '@/components/ui/skeleton';

export default function HashtagPage() {
  const { tag } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [hashtag, setHashtag] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [tag]);

  const fetchPosts = async () => {
    try {
      const { data } = await api.get(`/search/hashtag/${tag}`);
      if (data.success) {
        setPosts(data.posts);
        setHashtag(data.hashtag);
      }
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  };

  return (
    <div className="max-w-[935px] mx-auto">
      <div className="flex items-center gap-4 p-4 border-b border-border md:hidden">
        <button onClick={() => navigate(-1)}><ChevronLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">#{tag}</h1>
      </div>

      <div className="p-8 text-center border-b border-border">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 mx-auto mb-4 flex items-center justify-center">
          <span className="text-3xl font-bold text-white">#</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">#{tag}</h1>
        <p className="text-muted-foreground">
          {hashtag?.postsCount?.toLocaleString() || posts.length} {posts.length === 1 ? 'post' : 'posts'}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-1 md:gap-4 p-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="aspect-square" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg font-semibold mb-2">No posts yet</p>
          <p className="text-muted-foreground text-sm">Be the first to post with #{tag}</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 md:gap-4 p-4">
          {posts.map((post) => (
            <button
              key={post._id}
              onClick={() => navigate(`/profile/${post.user?.username}`)}
              className="aspect-square relative group overflow-hidden bg-muted"
            >
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
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
