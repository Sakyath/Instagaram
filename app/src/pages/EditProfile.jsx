import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { api, useAuth } from '../context/AuthContext.jsx';

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    bio: user?.bio || '',
    website: user?.website || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.put('/users/profile', form);
      if (data.success) {
        updateUser(data.user);
        toast.success('Profile updated!');
        navigate(`/profile/${data.user.username}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const { data } = await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.success) {
        updateUser(data.user);
        toast.success('Profile picture updated!');
      }
    } catch {
      toast.error('Failed to upload avatar');
    }
  };

  return (
    <div className="max-w-[600px] mx-auto">
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <button onClick={() => navigate(-1)}><ChevronLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold">Edit profile</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-muted overflow-hidden">
              {user?.avatar?.url ? (
                <img src={user.avatar.url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-lg">{user?.username?.[0]?.toUpperCase()}</div>
              )}
            </div>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <Camera className="w-3 h-3 text-white" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <p className="font-semibold">{user?.username}</p>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-blue-500 text-sm font-semibold">Change profile photo</button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Name</label>
            <input type="text" name="fullName" value={form.fullName} onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-transparent outline-none focus:border-muted-foreground" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Username</label>
            <input type="text" name="username" value={form.username} onChange={handleChange} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-transparent outline-none focus:border-muted-foreground" disabled />
            <p className="text-xs text-muted-foreground mt-1">Username cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Bio</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} maxLength={150} rows={3} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-transparent outline-none resize-none focus:border-muted-foreground" />
            <p className="text-xs text-muted-foreground text-right">{form.bio.length}/150</p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Website</label>
            <input type="text" name="website" value={form.website} onChange={handleChange} placeholder="www.example.com" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-transparent outline-none focus:border-muted-foreground" />
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg text-sm disabled:opacity-50">
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}
