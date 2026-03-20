import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField } from '@mui/material';
import { Mail, Calendar, LogOut } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useGetCurrentUserQuery, useUpdateCurrentUserMutation } from '../store/slices/apiSlice';
import { ProfileSkeleton } from '../components/ui';

const DEFAULT_ABOUT = 'Hey there! This is your space to manage your profile and stay on top of your tasks. Keep growing, stay focused, and make the most of every opportunity.';
const MAX_AVATAR_FILE_SIZE_BYTES = 2 * 1024 * 1024;

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });

const Profile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { data, isLoading: userLoading } = useGetCurrentUserQuery();
  const [updateCurrentUser] = useUpdateCurrentUserMutation();

  const currentUser = data?.user;

  const [profile, setProfile] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [about, setAbout] = useState(DEFAULT_ABOUT);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [savingField, setSavingField] = useState('');
  const [saveError, setSaveError] = useState('');
  const [avatarInputError, setAvatarInputError] = useState('');
  const avatarFileInputRef = useRef(null);

  const toProfileState = (sourceUser) => ({
    id: sourceUser?.id || '',
    name: sourceUser?.fullName || sourceUser?.name || '',
    username: sourceUser?.username || '',
    email: sourceUser?.email || '',
    about: sourceUser?.bio || sourceUser?.about || DEFAULT_ABOUT,
    image: sourceUser?.avatarUrl || sourceUser?.image || '',
    createdAt: sourceUser?.createdAt || null,
  });

  useEffect(() => {
    if (!currentUser) {
      setProfile(null);
      return;
    }

    const normalizedProfile = toProfileState(currentUser);
    setProfile(normalizedProfile);
    setFullName(normalizedProfile.name);
    setUsername(normalizedProfile.username);
    setAbout(normalizedProfile.about);
    setAvatarUrl(normalizedProfile.image);
  }, [currentUser]);

  const saveProfileUpdates = async (fieldKey, payload, onSuccess) => {
    setSaveError('');
    setSavingField(fieldKey);
    try {
      const result = await updateCurrentUser(payload).unwrap();
      if (result?.user) {
        const normalizedProfile = toProfileState(result.user);
        setProfile(normalizedProfile);
        setFullName(normalizedProfile.name);
        setUsername(normalizedProfile.username);
        setAbout(normalizedProfile.about);
        setAvatarUrl(normalizedProfile.image);
      }
      onSuccess();
    } catch (error) {
      setSaveError(error?.data?.message || 'Failed to save profile changes');
    } finally {
      setSavingField('');
    }
  };

  const handleSaveName = async () => {
    const nextFullName = fullName.trim();
    if (!nextFullName) {
      setSaveError('Full name cannot be empty');
      return;
    }

    await saveProfileUpdates('fullName', { fullName: nextFullName }, () => {
      setEditingName(false);
    });
  };

  const handleSaveUsername = async () => {
    const nextUsername = username.trim();
    if (!nextUsername) {
      setSaveError('Username cannot be empty');
      return;
    }

    await saveProfileUpdates('username', { username: nextUsername }, () => {
      setEditingUsername(false);
    });
  };

  const handleSaveAbout = async () => {
    await saveProfileUpdates('bio', { bio: about }, () => {
      setEditingAbout(false);
    });
  };

  const handleSaveAvatar = async () => {
    setAvatarInputError('');
    await saveProfileUpdates('avatarUrl', { avatarUrl: avatarUrl.trim() }, () => {
      setEditingAvatar(false);
    });
  };

  const handleRemoveAvatar = async () => {
    setAvatarInputError('');
    await saveProfileUpdates('avatarUrl', { avatarUrl: '' }, () => {
      setAvatarUrl('');
      setEditingAvatar(false);
    });
  };

  const handleAvatarFilePicked = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarInputError('Please select a valid image file');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_AVATAR_FILE_SIZE_BYTES) {
      setAvatarInputError('Image must be 2MB or smaller');
      event.target.value = '';
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setAvatarUrl(dataUrl);
      setAvatarInputError('');
    } catch {
      setAvatarInputError('Failed to read image file');
    } finally {
      event.target.value = '';
    }
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

  if (userLoading || !profile) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="space-y-5 max-w-6xl mx-auto text-gray-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">Profile</h1>
          <p className="text-gray-500 dark:text-zinc-400 text-sm">Manage your profile information and account settings</p>
          {saveError && <p className="text-red-500 text-sm mt-2">{saveError}</p>}
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

            <div className="mt-4 space-y-3">
              {!editingAvatar ? (
                <Button
                  variant='outlined'
                  color='primary'
                  size='small'
                  onClick={() => {
                    setEditingAvatar(true);
                    setAvatarInputError('');
                    setSaveError('');
                  }}
                >
                  Edit Avatar
                </Button>
              ) : (
                <div className="space-y-3">
                  <TextField
                    type="url"
                    label="Avatar Image URL"
                    value={avatarUrl}
                    onChange={(event) => setAvatarUrl(event.target.value)}
                    fullWidth
                    size="small"
                  />

                  <input
                    ref={avatarFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFilePicked}
                    className="hidden"
                  />

                  <div className="flex gap-3 flex-wrap">
                    <Button
                      variant='outlined'
                      color='primary'
                      size='small'
                      onClick={() => avatarFileInputRef.current?.click()}
                    >
                      Upload Image
                    </Button>
                    <Button
                      variant='contained'
                      color='primary'
                      size='small'
                      disabled={savingField === 'avatarUrl'}
                      onClick={handleSaveAvatar}
                    >
                      Save Avatar
                    </Button>
                    <Button
                      variant='outlined'
                      color='error'
                      size='small'
                      disabled={savingField === 'avatarUrl'}
                      onClick={handleRemoveAvatar}
                    >
                      Remove
                    </Button>
                    <Button
                      variant='text'
                      color='primary'
                      size='small'
                      onClick={() => {
                        setAvatarUrl(profile.image || '');
                        setAvatarInputError('');
                        setEditingAvatar(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>

                  {avatarInputError && (
                    <p className="text-red-500 text-xs">{avatarInputError}</p>
                  )}
                </div>
              )}
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
                disabled={savingField === 'bio'}
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
                    disabled={savingField === 'fullName'}
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
                    disabled={savingField === 'username'}
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
