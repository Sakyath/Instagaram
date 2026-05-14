import { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Volume2, VolumeX, ChevronLeft } from 'lucide-react';
import { api } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router';

export default function Reels() {
  const [reels, setReels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [likedReels, setLikedReels] = useState(new Set());
  const [savedReels, setSavedReels] = useState(new Set());
  const containerRef = useRef(null);
  const videoRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    try {
      const { data } = await api.get('/reels');
      if (data.success) {
        setReels(data.reels);
        const liked = new Set(data.reels.filter((r) => r.isLiked).map((r) => r._id));
        setLikedReels(liked);
      }
    } catch { /* ignore */ }
  };

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const height = window.innerHeight;
    const index = Math.round(scrollTop / height);
    setCurrentIndex(index);
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (video) {
        if (i === currentIndex) {
          video.play().catch(() => {});
        } else {
          video.pause();
          video.currentTime = 0;
        }
      }
    });
  }, [currentIndex]);

  const handleLike = async (reelId) => {
    try {
      await api.post(`/reels/${reelId}/like`);
      setLikedReels((prev) => {
        const next = new Set(prev);
        if (next.has(reelId)) next.delete(reelId); else next.add(reelId);
        return next;
      });
    } catch { /* ignore */ }
  };

  const handleSave = (reelId) => {
    setSavedReels((prev) => {
      const next = new Set(prev);
      if (next.has(reelId)) next.delete(reelId); else next.add(reelId);
      return next;
    });
  };

  if (reels.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 z-10 p-2 bg-black/50 rounded-full">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <p className="text-lg font-semibold">No reels yet</p>
        <p className="text-sm text-muted-foreground">Be the first to create a reel!</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black relative">
      <button onClick={() => navigate(-1)} className="absolute top-4 left-4 z-10 p-2 bg-black/50 rounded-full">
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>

      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full"
      >
        {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
      </button>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
      >
        {reels.map((reel, index) => (
          <div key={reel._id} className="h-screen snap-start relative flex items-center justify-center">
            <video
              ref={(el) => { videoRefs.current[index] = el; }}
              src={reel.video?.url}
              className="w-full h-full object-cover"
              loop
              playsInline
              muted={isMuted}
            />

            {/* Overlay Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
              <div className="flex items-center gap-3 mb-2">
                <button onClick={() => navigate(`/profile/${reel.user?.username}`)} className="w-8 h-8 rounded-full overflow-hidden bg-white/20">
                  {reel.user?.avatar?.url ? (
                    <img src={reel.user.avatar.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">{reel.user?.username?.[0]}</div>
                  )}
                </button>
                <button onClick={() => navigate(`/profile/${reel.user?.username}`)} className="text-white font-semibold text-sm">{reel.user?.username}</button>
              </div>
              <p className="text-white text-sm line-clamp-2">{reel.caption}</p>
              {reel.audio?.name && (
                <p className="text-white/70 text-xs mt-1">{reel.audio.name}</p>
              )}
            </div>

            {/* Actions */}
            <div className="absolute right-4 bottom-20 flex flex-col items-center gap-5">
              <button onClick={() => handleLike(reel._id)} className="flex flex-col items-center gap-1">
                <Heart className={`w-7 h-7 text-white ${likedReels.has(reel._id) ? 'fill-red-500 text-red-500' : ''}`} />
                <span className="text-white text-xs">{(reel.likesCount + (likedReels.has(reel._id) && !reel.isLiked ? 1 : 0)).toLocaleString()}</span>
              </button>
              <button className="flex flex-col items-center gap-1">
                <MessageCircle className="w-7 h-7 text-white" />
                <span className="text-white text-xs">{reel.commentsCount}</span>
              </button>
              <button className="flex flex-col items-center gap-1">
                <Share2 className="w-7 h-7 text-white" />
              </button>
              <button onClick={() => handleSave(reel._id)} className="flex flex-col items-center gap-1">
                <Bookmark className={`w-7 h-7 text-white ${savedReels.has(reel._id) ? 'fill-white' : ''}`} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
