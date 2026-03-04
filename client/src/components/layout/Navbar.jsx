import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, IconButton, InputAdornment, TextField } from '@mui/material';
import { SearchIcon, PanelLeft, LogOut, User } from 'lucide-react';

import { useAuth } from '../../firebase/auth';
import { assets } from '../../assets/assets';
import ThemeToggle from '../theme/ThemeToggle';

const Navbar = ({ setIsSidebarOpen }) => {

  const navigate = useNavigate();
  const { logout } = useAuth();
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
    <div className="glass-nav sticky top-0 w-full z-50 px-6 xl:px-16 py-3 flex-shrink-0">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* Left section */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* Sidebar Trigger */}
          <IconButton onClick={() => setIsSidebarOpen((prev) => !prev)} className="sm:hidden">
            <PanelLeft size={20} />
          </IconButton>

          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <TextField
              placeholder="Search projects, tasks..."
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon className="size-3.5" />
                  </InputAdornment>
                ),
              }}
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <IconButton
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="p-1"
            >
              <Avatar src={assets.profile_img_a} alt="User Avatar" sx={{ width: 28, height: 28 }} />
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
    </div>
  )
}

export default Navbar
