import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SearchIcon, PanelLeft, LogOut, User, Bell } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { assets } from '../../assets/assets';
import ThemeToggle from '../theme/ThemeToggle';
import { useGetNotificationsQuery, useGetUnreadNotificationCountQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation } from '../../store/slices/apiSlice';
import { formatDistanceToNow } from 'date-fns';

const Navbar = ({ setIsSidebarOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme } = useSelector(state => state.theme);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Notifications
  const { data: unreadCount } = useGetUnreadNotificationCountQuery(undefined, { pollingInterval: 30000 });
  const { data: notifications } = useGetNotificationsQuery(undefined, { 
    skip: !showNotifications,
    pollingInterval: showNotifications ? 10000 : undefined 
  });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markRead(notification.id);
    }
    setShowNotifications(false);
    // Navigate based on notification type
    if (notification.data?.taskId) {
      navigate(`/tasks/${notification.data.taskId}`);
    } else if (notification.data?.projectId) {
      navigate(`/projects/${notification.data.projectId}`);
    }
  };

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
          <button onClick={() => setIsSidebarOpen((prev) => !prev)} className="sm:hidden p-2 rounded-lg transition-colors text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800" >
            <PanelLeft size={20} />
          </button>

          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-400 size-3.5" />
            <input
              type="text"
              placeholder="Search projects, tasks..."
              className="pl-8 pr-4 py-2 w-full bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-white/20 transition"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Notifications Bell */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors relative"
            >
              <Bell className="w-5 h-5 text-gray-700 dark:text-white" />
              {(unreadCount || 0) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-medium rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-white/10 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-3 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Notifications</p>
                  {(unreadCount || 0) > 0 && (
                    <button
                      onClick={() => markAllRead()}
                      className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {notifications?.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors ${
                          !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {!notification.isRead && (
                            <span className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {notification.title}
                            </p>
                            {notification.message && (
                              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500 dark:text-zinc-400">
                    No notifications
                  </div>
                )}
              </div>
            )}
          </div>

          <ThemeToggle />

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <img src={assets.profile_img_a} alt="User Avatar" className="size-7 rounded-full cursor-pointer" />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-white/10 rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-gray-200 dark:border-white/10">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Account</p>
                </div>

                <button
                  onClick={handleProfileClick}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 border-t border-gray-200 dark:border-zinc-700"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar