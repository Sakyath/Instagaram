import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Search, X, TrendingUp } from 'lucide-react';
import { api } from '../context/AuthContext.jsx';
import { Skeleton } from '@/components/ui/skeleton';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('recentSearches') || '[]'); } catch { return []; }
  });
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrending();
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => { if (query.length >= 1) performSearch(); }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const fetchTrending = async () => {
    try {
      const { data } = await api.get('/hashtags/trending?limit=10');
      if (data.success) setTrendingHashtags(data.hashtags);
    } catch { /* ignore */ }
  };

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const [usersRes, hashtagsRes] = await Promise.all([
        api.get(`/search/users?q=${encodeURIComponent(query)}`),
        api.get(`/search/hashtags?q=${encodeURIComponent(query)}`),
      ]);
      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (hashtagsRes.data.success) setHashtags(hashtagsRes.data.hashtags);
    } catch { /* ignore */ }
    setIsSearching(false);
  };

  const addRecentSearch = (item) => {
    const updated = [item, ...recentSearches.filter((s) => s._id !== item._id)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <div className="max-w-[600px] mx-auto">
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users, hashtags..."
            className="w-full pl-9 pr-9 py-2 bg-muted rounded-lg text-sm outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {query.length >= 1 ? (
        <div className="p-4">
          {isSearching ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="flex items-center gap-3"><Skeleton className="w-10 h-10 rounded-full" /><Skeleton className="h-4 w-40" /></div>)}
            </div>
          ) : (
            <>
              {users.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Users</h3>
                  <div className="space-y-2">
                    {users.map((user) => (
                      <button
                        key={user._id}
                        onClick={() => { addRecentSearch(user); navigate(`/profile/${user.username}`); }}
                        className="w-full flex items-center gap-3 p-2 hover:bg-accent/50 rounded-lg text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                          {user.avatar?.url ? <img src={user.avatar.url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-sm">{user.username?.[0]}</div>}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{user.username}</p>
                          <p className="text-xs text-muted-foreground">{user.fullName} &middot; {user.followersCount?.toLocaleString()} followers</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {hashtags.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Hashtags</h3>
                  <div className="space-y-2">
                    {hashtags.map((tag) => (
                      <button
                        key={tag._id}
                        onClick={() => navigate(`/hashtag/${tag.tag}`)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-accent/50 rounded-lg text-left"
                      >
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <span className="text-lg">#</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold">#{tag.tag}</p>
                          <p className="text-xs text-muted-foreground">{tag.postsCount?.toLocaleString()} posts</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {users.length === 0 && hashtags.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No results found</p>}
            </>
          )}
        </div>
      ) : (
        <div>
          {recentSearches.length > 0 && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase">Recent</h3>
                <button onClick={clearRecent} className="text-xs text-blue-500 font-semibold">Clear all</button>
              </div>
              <div className="space-y-2">
                {recentSearches.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => navigate(item.username ? `/profile/${item.username}` : `/hashtag/${item.tag}`)}
                    className="w-full flex items-center gap-3 p-2 hover:bg-accent/50 rounded-lg text-left"
                  >
                    {item.username ? (
                      <>
                        <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                          {item.avatar?.url ? <img src={item.avatar.url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-sm">{item.username?.[0]}</div>}
                        </div>
                        <span className="text-sm font-semibold">{item.username}</span>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg">#</div>
                        <span className="text-sm font-semibold">#{item.tag}</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3" /> Trending
            </h3>
            <div className="space-y-2">
              {trendingHashtags.map((tag) => (
                <button
                  key={tag._id}
                  onClick={() => navigate(`/hashtag/${tag.tag}`)}
                  className="w-full flex items-center justify-between p-3 hover:bg-accent/50 rounded-lg text-left"
                >
                  <div>
                    <p className="text-sm font-semibold">#{tag.tag}</p>
                    <p className="text-xs text-muted-foreground">{tag.postsCount?.toLocaleString()} posts</p>
                  </div>
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
