import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '../context/AuthContext.jsx';
import StoryBar from '../components/StoryBar.jsx';
import PostCard from '../components/PostCard.jsx';
import { Skeleton } from '@/components/ui/skeleton';
import { useInView } from 'react-intersection-observer';
import SuggestedUsers from '../components/SuggestedUsers.jsx';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { ref, inView } = useInView();

  const fetchPosts = useCallback(async (pageNum = 1) => {
    try {
      const { data } = await api.get(`/posts/feed?page=${pageNum}&limit=5`);
      if (data.success) {
        if (pageNum === 1) {
          setPosts(data.posts);
        } else {
          setPosts((prev) => [...prev, ...data.posts]);
        }
        setHasMore(data.posts.length === 5);
      }
    } catch {
      toast.error('Failed to load feed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      setPage((prev) => prev + 1);
      fetchPosts(page + 1);
    }
  }, [inView, hasMore, isLoading, page, fetchPosts]);

  return (
    <div className="max-w-[630px] mx-auto lg:mr-[350px] lg:ml-auto">
      <StoryBar />

      {isLoading ? (
        <div className="space-y-4 p-4">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="w-32 h-4" />
              </div>
              <Skeleton className="w-full aspect-square" />
              <div className="flex gap-3">
                <Skeleton className="w-6 h-6" />
                <Skeleton className="w-6 h-6" />
                <Skeleton className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <p className="text-lg font-semibold mb-2">Welcome to Instagram Clone!</p>
          <p className="text-muted-foreground text-sm mb-6">Follow people to see their posts in your feed.</p>
          <SuggestedUsers />
        </div>
      ) : (
        <div className="pb-8">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onUpdate={() => fetchPosts(1)} />
          ))}
          <div ref={ref} className="py-8 text-center text-muted-foreground text-sm">
            {hasMore ? 'Loading more...' : 'You\'re all caught up!'}
          </div>
        </div>
      )}
    </div>
  );
}
