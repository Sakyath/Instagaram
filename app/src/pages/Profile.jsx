import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { Settings, Grid, Bookmark, UserSquare, Heart, MessageCircle, Verified, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, useAuth } from '../context/AuthContext.jsx';
import { Skeleton } from '@/components/ui/skeleton';

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followStatus, setFollowStatus] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/users/profile/${username}`);
      if (data.success) {
        setProfile(data.user);
        setIsFollowing(data.user.isFollowing);
        setFollowStatus(data.user.followStatus);
        fetchUserPosts(data.user._id);
        if (data.user.isOwnProfile) fetchSavedPosts();
      }
    } catch {
      toast.error('User not found');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserPosts = async (userId) => {
    try {
      const { data } = await api.get(`/posts/user/${userId}`);
      if (data.success) setPosts(data.posts);
    } catch { /* ignore */ }
  };

  const fetchSavedPosts = async () => {
    try {
      const { data } = await api.get('/posts/saved');
      if (data.success) setSavedPosts(data.posts);
    } catch { /* ignore */ }
  };

  const handleFollow = async () => {
    try {
      const { data } = await api.post(`/follows/${profile._id}`);
      if (data.success) {
        setIsFollowing(data.following);
        setFollowStatus(data.status);
        setProfile((prev) => ({
          ...prev,
          followersCount: data.following ? prev.followersCount + 1 : Math.max(0, prev.followersCount - 1),
        }));
      }
    } catch {
      toast.error('Failed to follow user');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-[935px] mx-auto p-4">
        <div className="flex items-center gap-8 mb-8">
          <Skeleton className="w-20 h-20 md:w-36 md:h-36 rounded-full" />
          <div className="space-y-3 flex-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="aspect-square" />)}
        </div>
      </div>
    );
  }

  if (!profile) return <div className="text-center py-20">User not found</div>;

  const isOwnProfile = currentUser?._id === profile._id;
  const displayPosts = activeTab === 'saved' ? savedPosts : posts;

  return (
    <div className="max-w-[935px] mx-auto">
      {/* Profile Header */}
      <div className="flex items-start gap-6 md:gap-12 p-4 md:p-8 border-b border-border">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 md:w-36 md:h-36 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[3px]">
            <div className="w-full h-full rounded-full bg-background p-[3px]">
              {profile.avatar?.url ? (
                <img src={profile.avatar.url} alt={profile.username} className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-muted flex items-center justify-center text-2xl md:text-4xl font-bold">
                  {profile.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <h1 className="text-xl font-semibold">{profile.username}</h1>
            {profile.isVerified && <Verified className="w-5 h-5 text-blue-500 fill-blue-500" />}

            {isOwnProfile ? (
              <div className="flex gap-2">
                <Link to="/edit-profile" className="px-4 py-1.5 bg-muted rounded-lg text-sm font-semibold hover:bg-muted/80">Edit profile</Link>
                <button onClick={() => navigate('/settings')} className="p-1.5 bg-muted rounded-lg hover:bg-muted/80">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleFollow} className={`px-6 py-1.5 rounded-lg text-sm font-semibold ${isFollowing ? 'bg-muted' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
                  {isFollowing ? (followStatus === 'pending' ? 'Requested' : 'Following') : 'Follow'}
                </button>
                <button onClick={() => navigate(`/messages/${profile._id}`)} className="px-4 py-1.5 bg-muted rounded-lg text-sm font-semibold">Message</button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-6 md:gap-8 mb-4">
            <div className="text-center md:text-left"><span className="font-semibold">{profile.postsCount}</span> <span className="text-muted-foreground">posts</span></div>
            <div className="text-center md:text-left"><span className="font-semibold">{profile.followersCount}</span> <span className="text-muted-foreground">followers</span></div>
            <div className="text-center md:text-left"><span className="font-semibold">{profile.followingCount}</span> <span className="text-muted-foreground">following</span></div>
          </div>

          {/* Bio */}
          <div>
            <p className="font-semibold text-sm">{profile.fullName}</p>
            {profile.bio && <p className="text-sm mt-1 whitespace-pre-line">{profile.bio}</p>}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 font-semibold mt-1 block">{profile.website}</a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-8 md:gap-16 border-b border-border">
        <button onClick={() => setActiveTab('posts')} className={`flex items-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider ${activeTab === 'posts' ? 'border-t border-foreground' : 'text-muted-foreground'}`}>
          <Grid className="w-3 h-3" /> Posts
        </button>
        {isOwnProfile && (
          <button onClick={() => setActiveTab('saved')} className={`flex items-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider ${activeTab === 'saved' ? 'border-t border-foreground' : 'text-muted-foreground'}`}>
            <Bookmark className="w-3 h-3" /> Saved
          </button>
        )}
      </div>

      {/* Posts Grid */}
      {displayPosts.length === 0 ? (
        <div className="text-center py-16">
          {activeTab === 'posts' ? (
            <>
              <div className="w-16 h-16 rounded-full border-2 border-border flex items-center justify-center mx-auto mb-4">
                <Grid className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground text-sm">{isOwnProfile ? 'Share your first post!' : 'When they post, you\'ll see it here.'}</p>
            </>
          ) : (
            <>
              <Bookmark className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No saved posts</h3>
              <p className="text-muted-foreground text-sm">Save posts to see them here.</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 md:gap-4 p-1 md:p-4">
          {displayPosts.map((post) => (
            <div key={post._id} className="aspect-square relative group overflow-hidden bg-muted cursor-pointer">
              {post.images?.[0]?.url ? (
                <img src={post.images[0].url} alt="" className="w-full h-full object-cover" />
              ) : post.videos?.[0]?.url ? (
                <video src={post.videos[0].url} className="w-full h-full object-cover" />
              ) : null}
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
