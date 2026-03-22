import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, IconButton, InputAdornment, TextField } from '@mui/material';
import { SearchIcon, PanelLeft, LogOut, User } from 'lucide-react';
import { useSelector } from 'react-redux';

import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../theme/ThemeToggle';

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const currentUser = useSelector((state) => {
    const userId = state?.users?.currentUserId;
    return userId ? state?.users?.users?.[userId] : null;
  });

  const avatarSrc = currentUser?.avatarUrl || currentUser?.image || '';
  const avatarInitial = (currentUser?.fullName || currentUser?.name || currentUser?.username || '?')
    .slice(0, 1)
    .toUpperCase();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    navigate('/profile');
    setShowProfileMenu(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowProfileMenu(false);
  };

  return (
    <header className="glass-nav sticky top-0 w-full z-20 px-4 sm:px-6 lg:px-8 py-3 flex-shrink-0">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          {/* Hamburger button - always visible on mobile/tablet, hidden on lg+ */}
          <IconButton
            onClick={onMenuClick}
            className="lg:hidden"
            aria-label="Open menu"
          >
            <PanelLeft size={20} />
          </IconButton>

          <div className="relative flex-1 max-w-xs sm:max-w-sm">
            <TextField
              placeholder="Search coming soon..."
              size="small"
              fullWidth
              disabled
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon className="size-3.5" />
                  </InputAdornment>
                ),
              }}
              inputProps={{ 'aria-label': 'search' }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-2">
          <ThemeToggle />

          <div className="relative" ref={profileMenuRef}>
            <IconButton
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="p-1"
            >
              <Avatar src={avatarSrc} alt="User" sx={{ width: 32, height: 32 }}>
                {avatarInitial}
              </Avatar>
            </IconButton>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-white/10 rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-gray-200 dark:border-white/10">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Account</p>
                </div>

                <Button
                  onClick={handleProfileClick}
                  fullWidth
                  color="inherit"
                  sx={{ justifyContent: 'flex-start', borderRadius: 0, px: 2, py: 1.2 }}
                  startIcon={<User className="w-4 h-4" />}
                >
                  Profile
                </Button>

                <Button
                  onClick={handleLogout}
                  fullWidth
                  color="error"
                  sx={{ justifyContent: 'flex-start', borderRadius: 0, px: 2, py: 1.2 }}
                  startIcon={<LogOut className="w-4 h-4" />}
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

