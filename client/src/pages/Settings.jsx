import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  MenuItem,
  Select,
  TextField,
  Alert,
} from '@mui/material';
import { Bell, Lock, Settings as SettingsIcon, Check } from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../lib/api';
import { updateUserSettings } from '../store';

const Settings = () => {
  const dispatch = useDispatch();
  const [settings, setSettings] = useState({
    theme: localStorage.getItem('theme') || 'light',
    notifications: {
      email: true,
      desktop: false,
      taskReminders: true,
      projectUpdates: true
    },
    privacy: {
      profileVisibility: 'team',
      activityStatus: true
    },
    preferences: {
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/dd/yyyy'
    }
  });
  const [saved, setSaved] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('userSettings');
    const savedTheme = localStorage.getItem('theme') || 'light';

    if (savedSettings) {
      setSettings(prev => ({
        ...prev,
        ...JSON.parse(savedSettings),
        theme: savedTheme
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        theme: savedTheme
      }));
    }
  }, []);

  const handleThemeChange = (newTheme) => {
    setSettings(prev => ({
      ...prev,
      theme: newTheme
    }));

    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('theme-dark', newTheme === 'dark');
  };

  const handleNotificationChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const handlePrivacyChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
  };

  const handlePreferenceChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
    dispatch(updateUserSettings(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      setPasswordSuccess(true);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleResetSettings = () => {
    const defaultSettings = {
      notifications: {
        email: true,
        desktop: false,
        taskReminders: true,
        projectUpdates: true
      },
      privacy: {
        profileVisibility: 'team',
        activityStatus: true
      },
      preferences: {
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/dd/yyyy'
      }
    };

    setSettings(defaultSettings);
    localStorage.setItem('userSettings', JSON.stringify(defaultSettings));
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto text-gray-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">Settings</h1>
          <p className="text-gray-500 dark:text-zinc-400 text-sm">Customize your Heed experience</p>
        </div>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="p-4 bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-600 rounded-lg flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <span className="text-emerald-800 dark:text-emerald-200 text-sm">Settings saved successfully!</span>
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* Notification Settings */}
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded p-6">
          <div className="flex items-center gap-2 mb-5">
            <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition">
              <label className="text-gray-700 dark:text-gray-300 font-medium text-sm">Email Notifications</label>
              <Checkbox
                checked={settings.notifications.email}
                onChange={(e) => handleNotificationChange('email', e.target.checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition">
              <label className="text-gray-700 dark:text-gray-300 font-medium text-sm">Task Reminders</label>
              <Checkbox
                checked={settings.notifications.taskReminders}
                onChange={(e) => handleNotificationChange('taskReminders', e.target.checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition">
              <label className="text-gray-700 dark:text-gray-300 font-medium text-sm">Project Updates</label>
              <Checkbox
                checked={settings.notifications.projectUpdates}
                onChange={(e) => handleNotificationChange('projectUpdates', e.target.checked)}
              />
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded p-6">
          <div className="flex items-center gap-2 mb-5">
            <Lock className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Privacy</h2>
          </div>

          <div className="space-y-4">
            <div className="p-3 rounded hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition">
              <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm mb-2">Profile Visibility</label>
              <Select
                value={settings.privacy.profileVisibility}
                onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                fullWidth
                size="small"
              >
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="team">Team Members Only</MenuItem>
                <MenuItem value="private">Private</MenuItem>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 rounded hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition">
              <label className="text-gray-700 dark:text-gray-300 font-medium text-sm">Show Activity Status</label>
              <Checkbox
                checked={settings.privacy.activityStatus}
                onChange={(e) => handlePrivacyChange('activityStatus', e.target.checked)}
              />
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded p-6">
          <div className="flex items-center gap-2 mb-5">
            <Lock className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h2>
          </div>

          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>
          )}
          {passwordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>Password changed successfully!</Alert>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm">
            <TextField
              label="Current Password"
              type="password"
              size="small"
              fullWidth
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            />
            <TextField
              label="New Password"
              type="password"
              size="small"
              fullWidth
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            />
            <TextField
              label="Confirm New Password"
              type="password"
              size="small"
              fullWidth
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        </div>

        {/* Preferences Settings */}
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Preferences</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition">
              <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm mb-2">Language</label>
              <Select
                value={settings.preferences.language}
                onChange={(e) => handlePreferenceChange('language', e.target.value)}
                fullWidth
                size="small"
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
                <MenuItem value="de">German</MenuItem>
              </Select>
            </div>

            <div className="p-3 rounded hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition">
              <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm mb-2">Timezone</label>
              <Select
                value={settings.preferences.timezone}
                onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                fullWidth
                size="small"
              >
                <MenuItem value="UTC">UTC</MenuItem>
                <MenuItem value="EST">Eastern Time (EST)</MenuItem>
                <MenuItem value="CST">Central Time (CST)</MenuItem>
                <MenuItem value="MST">Mountain Time (MST)</MenuItem>
                <MenuItem value="PST">Pacific Time (PST)</MenuItem>
              </Select>
            </div>

            <div className="p-3 rounded hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition">
              <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm mb-2">Date Format</label>
              <Select
                value={settings.preferences.dateFormat}
                onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                fullWidth
                size="small"
              >
                <MenuItem value="MM/dd/yyyy">MM/dd/yyyy</MenuItem>
                <MenuItem value="dd/MM/yyyy">dd/MM/yyyy</MenuItem>
                <MenuItem value="yyyy-MM-dd">yyyy-MM-dd</MenuItem>
              </Select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end pt-4">
          <Button
            variant='outlined'
            color='primary'
            onClick={handleResetSettings}
          >
            Reset to Defaults
          </Button>
          <Button
            variant='contained'
            color='primary'
            startIcon={<Check size={16} />}
            onClick={handleSaveSettings}
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
