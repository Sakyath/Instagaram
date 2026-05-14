import { Outlet, useLocation } from 'react-router';
import Sidebar from './Sidebar.jsx';
import BottomNav from './BottomNav.jsx';

export default function Layout() {
  const location = useLocation();
  const isMessagesPage = location.pathname.startsWith('/messages');

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className={`md:ml-[72px] lg:ml-[244px] min-h-screen ${isMessagesPage ? 'pb-0' : 'pb-16 md:pb-0'}`}>
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
