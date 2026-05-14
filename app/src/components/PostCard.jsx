import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, MapPin, ChevronLeft, ChevronRight, Verified } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { api } from '../context/AuthContext.jsx';

export default function PostCard({ post, onUpdate }) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [savesCount, setSavesCount] = useState(post.savesCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const navigate = useNavigate();

  const images = post.images || [];
  const hasMultipleImages = images.length > 1;

  const handleLike = async () => {
    try {
      const { data } = await api.post(`/posts/${post._id}/like`);
      setIsLiked(data.liked);
      setLikesCount((prev) => data.liked ? prev + 1 : Math.max(0, prev - 1));
    } catch {
      toast.error('Failed to like post');
    }
  };

  const handleSave = async () => {
    try {
      const { data } = await api.post(`/posts/${post._id}/save`);
      setIsSaved(data.saved);
      setSavesCount((prev) => data.saved ? prev + 1 : Math.max(0, prev - 1));
      toast.success(data.saved ? 'Post saved' : 'Post unsaved');
    } catch {
      toast.error('Failed to save post');
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      const { data } = await api.post(`/comments/post/${post._id}`, { text: commentText });
      if (data.success) {
        setComments((prev) => [data.comment, ...prev]);
        setCommentText('');
        onUpdate?.();
      }
    } catch {
      toast.error('Failed to add comment');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/posts/${post._id}`);
      toast.success('Post deleted');
      onUpdate?.();
    } catch {
      toast.error('Failed to delete post');
    }
    setShowOptions(false);
  };

  return (
    <article className="bg-background border-b border-border pb-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link to={`/profile/${post.user?.username}`} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[2px]">
            <div className="w-full h-full rounded-full bg-background p-[2px]">
              {post.user?.avatar?.url ? (
                <img src={post.user.avatar.url} alt={post.user.username} className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                  {post.user?.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm">{post.user?.username}</span>
            {post.user?.isVerified && <Verified className="w-4 h-4 text-blue-500 fill-blue-500" />}
          </div>
        </Link>
        <button onClick={() => setShowOptions(!showOptions)} className="relative p-1">
          <MoreHorizontal className="w-5 h-5" />
          {showOptions && (
            <div className="absolute right-0 top-8 bg-popover border border-border rounded-lg shadow-lg p-2 w-40 z-10">
              <button onClick={handleDelete} className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-accent rounded">Delete</button>
              <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`); toast.success('Link copied'); setShowOptions(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded">Copy link</button>
            </div>
          )}
        </button>
      </div>

      {/* Media */}
      <div className="relative aspect-square bg-black">
        {images.length > 0 ? (
          <>
            <img src={images[currentImageIndex]?.url} alt="" className="w-full h-full object-contain" />
            {hasMultipleImages && (
              <>
                {currentImageIndex > 0 && (
                  <button onClick={() => setCurrentImageIndex(currentImageIndex - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                {currentImageIndex < images.length - 1 && (
                  <button onClick={() => setCurrentImageIndex(currentImageIndex + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentImageIndex ? 'bg-white' : 'bg-white/50'}`} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : post.videos?.length > 0 ? (
          <video src={post.videos[0]?.url} className="w-full h-full object-contain" controls />
        ) : null}
      </div>

      {/* Actions */}
      <div className="px-4 pt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button onClick={handleLike}>
              <Heart className={`w-6 h-6 transition-all ${isLiked ? 'fill-red-500 text-red-500 scale-110' : ''}`} />
            </button>
            <button onClick={() => setShowComments(!showComments)}>
              <MessageCircle className="w-6 h-6" />
            </button>
            <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`); toast.success('Link copied'); }}>
              <Send className="w-6 h-6" />
            </button>
          </div>
          <button onClick={handleSave}>
            <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-black dark:fill-white' : ''}`} />
          </button>
        </div>

        {/* Likes count */}
        {!post.hideLikeCount && (
          <p className="font-semibold text-sm mb-1">{likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}</p>
        )}

        {/* Caption */}
        {post.caption && (
          <p className="text-sm mb-1">
            <Link to={`/profile/${post.user?.username}`} className="font-semibold mr-1">{post.user?.username}</Link>
            {post.caption}
          </p>
        )}

        {/* Location */}
        {post.location && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
            <MapPin className="w-3 h-3" /> {post.location}
          </p>
        )}

        {/* Comments count */}
        {post.commentsCount > 0 && !showComments && (
          <button onClick={() => setShowComments(true)} className="text-sm text-muted-foreground mb-2">
            View all {post.commentsCount} comments
          </button>
        )}

        {/* Comments */}
        {showComments && (
          <div className="space-y-2 mb-3">
            {comments.map((comment) => (
              <div key={comment._id} className="flex gap-2 text-sm">
                <Link to={`/profile/${comment.user?.username}`} className="font-semibold flex-shrink-0">{comment.user?.username}</Link>
                <p>{comment.text}</p>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Add a comment..."
                className="flex-1 bg-transparent outline-none text-sm"
              />
              {commentText && (
                <button onClick={handleAddComment} className="text-blue-500 font-semibold text-sm">Post</button>
              )}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
          {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : ''}
        </p>
      </div>
    </article>
  );
}
