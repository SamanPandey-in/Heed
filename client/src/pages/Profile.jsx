import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField } from '@mui/material';
import { Mail, Calendar, LogOut } from 'lucide-react';
import { useSelector } from 'react-redux';

import { useAuth } from '../context/AuthContext';

const DEFAULT_ABOUT = 'Hey there! This is your space to manage your profile and stay on top of your tasks. Keep growing, stay focused, and make the most of every opportunity.';

const Profile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const currentUser = useSelector((state) => {
    const userId = state?.users?.currentUserId;
    return userId ? state?.users?.users?.[userId] : null;
  });

  const [profile, setProfile] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [about, setAbout] = useState(DEFAULT_ABOUT);

  useEffect(() => {
    if (!currentUser) {
      setProfile(null);
      return;
    }

    const normalizedProfile = {
      id: currentUser.id || '',
      name: currentUser.fullName || currentUser.name || '',
      username: currentUser.username || '',
      email: currentUser.email || '',
      about: currentUser.bio || currentUser.about || DEFAULT_ABOUT,
      image: currentUser.avatarUrl || currentUser.image || '',
      createdAt: currentUser.createdAt || null,
    };

    setProfile(normalizedProfile);
    setFullName(normalizedProfile.name);
    setUsername(normalizedProfile.username);
    setAbout(normalizedProfile.about);
  }, [currentUser]);

  const handleSaveName = () => {
    setProfile(prev => ({ ...prev, name: fullName }));
    setEditingName(false);
  };

  const handleSaveUsername = () => {
    setProfile(prev => ({ ...prev, username }));
    setEditingUsername(false);
  };

  const handleSaveAbout = () => {
    setProfile(prev => ({ ...prev, about }));
    setEditingAbout(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const joinedDate = useMemo(() => {
    if (!profile?.createdAt) return 'Unknown';
    const date = new Date(profile.createdAt);
    if (Number.isNaN(date.getTime())) return 'Unknown';
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }, [profile?.createdAt]);

  if (!profile) {
    return (
      <div className="space-y-5 max-w-6xl mx-auto text-gray-900 dark:text-white">
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded p-8">
          <p className="text-sm text-gray-500 dark:text-zinc-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-6xl mx-auto text-gray-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">Profile</h1>
          <p className="text-gray-500 dark:text-zinc-400 text-sm">Manage your profile information and account settings</p>
        </div>
      </div>

      {/* Profile Avatar & Basic Info */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex-shrink-0">
            {profile.image ? (
              <img
                src={profile.image}
                alt={profile.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-2xl font-bold text-gray-600 dark:text-gray-200">
                {(profile.name || '?').slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{profile.name}</h2>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Mail className="w-4 h-4" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Calendar className="w-4 h-4" />
                <span>Joined {joinedDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About</h2>
        {editingAbout ? (
          <div className="space-y-4">
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-white/20 focus:border-transparent outline-none resize-none"
              rows="4"
              placeholder="Tell us about yourself..."
            />
            <div className="flex gap-3">
              <Button
                variant='contained'
                color='primary'
                size='small'
                onClick={handleSaveAbout}
              >
                Save
              </Button>
              <Button
                variant='outlined'
                color='primary'
                size='small'
                onClick={() => {
                      setAbout(profile.about || DEFAULT_ABOUT);
                  setEditingAbout(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded bg-gray-50 dark:bg-zinc-700/30 text-gray-700 dark:text-gray-300 text-sm leading-relaxed flex items-center justify-between">
            <span>{about}</span>
            <Button
              variant='text'
              color='primary'
              size='small'
              onClick={() => setEditingAbout(true)}
            >
              Edit
            </Button>
          </div>
        )}
      </div>

      {/* Personal Information Section */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Personal Information</h2>

        <div className="space-y-5">
          {/* Full Name */}
          <div className="p-4 rounded hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition">
            <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm mb-2">Full Name</label>
            {editingName ? (
              <div className="space-y-3">
                <TextField
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <div className="flex gap-3">
                  <Button
                    variant='contained'
                    color='primary'
                    size='small'
                    onClick={handleSaveName}
                  >
                    Save
                  </Button>
                  <Button
                    variant='outlined'
                    color='primary'
                    size='small'
                    onClick={() => {
                      setFullName(profile.name);
                      setEditingName(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-700/30 rounded">
                <span className="text-gray-900 dark:text-white">{profile.name}</span>
                <Button
                  variant='text'
                  color='primary'
                  size='small'
                  onClick={() => setEditingName(true)}
                >
                  Edit
                </Button>
              </div>
            )}
          </div>

          {/* Username */}
          <div className="p-4 rounded hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition">
            <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm mb-2">Username</label>
            {editingUsername ? (
              <div className="space-y-3">
                <TextField
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <div className="flex gap-3">
                  <Button
                    variant='contained'
                    color='primary'
                    size='small'
                    onClick={handleSaveUsername}
                  >
                    Save
                  </Button>
                  <Button
                    variant='outlined'
                    color='primary'
                    size='small'
                    onClick={() => {
                      setUsername(profile.username || '');
                      setEditingUsername(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-700/30 rounded">
                <span className="text-gray-900 dark:text-white">@{username}</span>
                <Button
                  variant='text'
                  color='primary'
                  size='small'
                  onClick={() => setEditingUsername(true)}
                >
                  Edit
                </Button>
              </div>
            )}
          </div>

          {/* Email Address (Read-only) */}
          <div className="p-4 rounded hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition">
            <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm mb-2">Email Address</label>
            <div className="p-3 bg-gray-50 dark:bg-zinc-700/30 rounded text-gray-600 dark:text-gray-400 text-sm">
              {profile.email}
            </div>
          </div>

          {/* User ID (Read-only) */}
          <div className="p-4 rounded hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition">
            <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm mb-2">User ID</label>
            <div className="p-3 bg-gray-50 dark:bg-zinc-700/30 rounded text-gray-600 dark:text-gray-400 text-sm font-mono">
              {profile.id}
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone - Logout */}
      <div className="dark:bg-gradient-to-br dark:from-red-800/20 dark:to-red-900/20 border border-red-200 dark:border-red-800 rounded p-6">
        <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-4">Danger Zone</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Sign out of your account on this device</p>
        <Button
          variant='contained'
          color='error'
          startIcon={<LogOut size={16} />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Profile;
