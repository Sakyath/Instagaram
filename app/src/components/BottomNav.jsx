import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Home, Search, Compass, PlaySquare, MessageCircle, PlusSquare, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import CreatePostModal from './CreatePostModal.jsx';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Search, label: 'Search', path: '/search' },
  { icon: PlusSquare, label: 'Create', action: 'create' },
  { icon: PlaySquare, label: 'Reels', path: '/reels' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export default function BottomNav() {
  const [showCreate, setShowCreate] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = (item) => {
    if (item.action === 'create') {
      setShowCreate(true);
      return;
    }
    if (item.path === '/profile' && user) {
      navigate(`/profile/${user.username}`);
      return;
    }
    if (item.path) navigate(item.path);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleClick(item)}
              className="p-2 flex flex-col items-center gap-0.5"
            >
              <item.icon
                className={`w-6 h-6 ${
                  location.pathname === item.path ? 'stroke-[2.5px]' : ''
                }`}
              />
              <span className="text-[10px]">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
      {showCreate && <CreatePostModal onClose={() => setShowCreate(false)} />}
    </>
  );
}
