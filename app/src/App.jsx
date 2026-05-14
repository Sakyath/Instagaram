import { Routes, Route, Navigate } from 'react-router';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import Explore from './pages/Explore.jsx';
import Reels from './pages/Reels.jsx';
import Messages from './pages/Messages.jsx';
import Notifications from './pages/Notifications.jsx';
import Profile from './pages/Profile.jsx';
import EditProfile from './pages/EditProfile.jsx';
import Settings from './pages/Settings.jsx';
import SavedPosts from './pages/SavedPosts.jsx';
import Search from './pages/Search.jsx';
import HashtagPage from './pages/HashtagPage.jsx';
import StoryViewer from './pages/StoryViewer.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import NotFound from './pages/NotFound.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';

function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  return !isAuthenticated ? children : <Navigate to="/" replace />;
}

function AdminRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return user?.isAdmin ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />

      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/reels" element={<Reels />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:userId" element={<Messages />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/saved" element={<SavedPosts />} />
        <Route path="/search" element={<Search />} />
        <Route path="/hashtag/:tag" element={<HashtagPage />} />
        <Route path="/stories" element={<StoryViewer />} />
      </Route>

      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
