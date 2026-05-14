import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  Home, Search, Compass, PlaySquare, MessageCircle, Heart,
  PlusSquare, User, Menu, LogOut, Settings, Moon, Sun, Instagram,
  ChevronLeft, ChevronRight, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import CreatePostModal from './CreatePostModal.jsx';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Search, label: 'Search', path: '/search' },
  { icon: Compass, label: 'Explore', path: '/explore' },
  { icon: PlaySquare, label: 'Reels', path: '/reels' },
  { icon: MessageCircle, label: 'Messages', path: '/messages' },
  { icon: Heart, label: 'Notifications', path: '/notifications' },
  { icon: PlusSquare, label: 'Create', path: null, action: 'create' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (item) => {
    if (item.action === 'create') {
      setShowCreateModal(true);
      return;
    }
    if (item.path === '/profile' && user) {
      navigate(`/profile/${user.username}`);
      return;
    }
    if (item.path) navigate(item.path);
  };

  const isActive = (item) => {
    if (item.path === '/') return location.pathname === '/';
    if (item.path === '/profile') return location.pathname.startsWith('/profile');
    return item.path && location.pathname.startsWith(item.path);
  };

  return (
    <>
      <aside className={`fixed left-0 top-0 h-screen border-r border-border bg-background z-40 transition-all duration-300 ${isCollapsed ? 'w-[72px]' : 'w-[244px]'}`}>
        <div className="flex flex-col h-full px-3 py-4">
          {/* Logo */}
          <div className="mb-8 px-3 flex items-center justify-between">
            {isCollapsed ? (
              <Link to="/" className="mx-auto">
                <Instagram className="w-7 h-7" />
              </Link>
            ) : (
              <Link to="/" className="text-xl font-bold tracking-tight">
                Instagram Clone
              </Link>
            )}
          </div>

          {/* Nav Items */}
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg transition-colors text-left ${
                  isActive(item)
                    ? 'font-semibold bg-accent'
                    : 'hover:bg-accent/50'
                }`}
              >
                <item.icon className={`w-6 h-6 flex-shrink-0 ${isActive(item) ? 'stroke-[2.5px]' : ''}`} />
                {!isCollapsed && <span className="text-sm">{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="space-y-1 relative">
            {user?.isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg transition-colors text-left hover:bg-accent/50 ${location.pathname.startsWith('/admin') ? 'font-semibold bg-accent' : ''}`}
              >
                <ShieldCheck className="w-6 h-6 flex-shrink-0" />
                {!isCollapsed && <span className="text-sm">Admin</span>}
              </button>
            )}

            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-full flex items-center gap-4 px-3 py-3 rounded-lg transition-colors text-left hover:bg-accent/50"
            >
              <Menu className="w-6 h-6 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm">More</span>}
            </button>

            {showMenu && (
              <div className="absolute bottom-full left-0 w-full bg-popover border border-border rounded-lg shadow-lg p-2 space-y-1 mb-2">
                <button
                  onClick={() => { toggleTheme(); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-left"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <span className="text-sm">{isDark ? 'Light mode' : 'Dark mode'}</span>
                </button>
                <button
                  onClick={() => { navigate('/settings'); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-left"
                >
                  <Settings className="w-5 h-5" />
                  <span className="text-sm">Settings</span>
                </button>
                <hr className="border-border" />
                <button
                  onClick={() => { logout(); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-left text-red-500"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm">Log out</span>
                </button>
              </div>
            )}
          </div>

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-accent hidden lg:block"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {showCreateModal && <CreatePostModal onClose={() => setShowCreateModal(false)} />}
    </>
  );
}
