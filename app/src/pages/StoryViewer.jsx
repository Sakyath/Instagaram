import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { X, Heart, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../context/AuthContext.jsx';

export default function StoryViewer() {
  const location = useLocation();
  const navigate = useNavigate();
  const storiesGroup = location.state?.storiesGroup;
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [viewers, setViewers] = useState([]);
  const [showViewers, setShowViewers] = useState(false);
  const progressRef = useRef(null);

  const stories = storiesGroup?.stories || [];
  const currentStory = stories[currentStoryIndex];

  useEffect(() => {
    if (!storiesGroup) { navigate('/'); return; }
    markViewed();
  }, []);

  useEffect(() => {
    if (!currentStory) return;
    setProgress(0);
    setViewers(currentStory.viewers || []);

    const interval = setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => {
          if (prev >= 100) {
            if (currentStoryIndex < stories.length - 1) {
              setCurrentStoryIndex(currentStoryIndex + 1);
              return 0;
            } else {
              navigate(-1);
              return 100;
            }
          }
          return prev + (100 / ((currentStory.media?.[0]?.duration || 5) * 20));
        });
      }
    }, 50);

    return () => clearInterval(interval);
  }, [currentStoryIndex, currentStory, isPaused]);

  const markViewed = async () => {
    if (!currentStory?._id) return;
    try { await api.get(`/stories/${currentStory._id}`); } catch { /* ignore */ }
  };

  const goToNext = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      navigate(-1);
    }
  };

  const goToPrev = () => {
    if (currentStoryIndex > 0) setCurrentStoryIndex(currentStoryIndex - 1);
  };

  if (!storiesGroup || stories.length === 0) return null;

  const media = currentStory?.media?.[0];

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Progress Bars */}
      <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
        {stories.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100"
              style={{ width: i < currentStoryIndex ? '100%' : i === currentStoryIndex ? `${progress}%` : '0%' }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-4 right-4 flex items-center gap-3 z-10">
        <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
          {storiesGroup.user?.avatar?.url ? (
            <img src={storiesGroup.user.avatar.url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">{storiesGroup.user?.username?.[0]}</div>
          )}
        </div>
        <span className="text-white font-semibold text-sm">{storiesGroup.user?.username}</span>
        <span className="text-white/60 text-xs">
          {currentStory?.createdAt ? new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </span>
        <button onClick={() => navigate(-1)} className="ml-auto"><X className="w-6 h-6 text-white" /></button>
      </div>

      {/* Media */}
      <div
        className="w-full h-full flex items-center justify-center"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {media?.type === 'video' ? (
          <video src={media.url} className="w-full h-full object-contain" autoPlay muted playsInline />
        ) : (
          <img src={media?.url} alt="" className="w-full h-full object-contain" />
        )}

        {media?.text && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-white text-2xl font-bold text-center px-8 drop-shadow-lg">{media.text}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <button onClick={goToPrev} className="absolute left-0 top-0 bottom-0 w-1/4 z-10" />
      <button onClick={goToNext} className="absolute right-0 top-0 bottom-0 w-1/4 z-10" />

      {/* Bottom Actions */}
      <div className="absolute bottom-8 left-4 right-4 flex items-center gap-3 z-10">
        <input
          type="text"
          placeholder="Reply..."
          className="flex-1 bg-white/20 backdrop-blur rounded-full px-4 py-2 text-sm text-white placeholder-white/60 outline-none"
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        />
        <button className="p-2"><Heart className="w-6 h-6 text-white" /></button>
        <button onClick={() => setShowViewers(!showViewers)} className="p-2 text-white text-sm">
          {currentStory?.viewersCount || 0} views
        </button>
      </div>

      {/* Viewers Panel */}
      {showViewers && (
        <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-xl max-h-[50%] overflow-y-auto z-20 p-4">
          <p className="font-semibold mb-3">Viewers ({viewers.length})</p>
          {viewers.map((v) => (
            <div key={v.user?._id || v._id} className="flex items-center gap-3 py-2">
              <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
                {v.user?.avatar?.url ? <img src={v.user.avatar.url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold">{v.user?.username?.[0]}</div>}
              </div>
              <span className="text-sm">{v.user?.username}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
