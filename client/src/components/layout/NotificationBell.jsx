import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IconButton, Badge } from "@mui/material";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useClearAllNotificationsMutation,
} from "../../store/slices/apiSlice";

const ENTITY_ROUTES = {
  task: (id) => `/taskDetails?taskId=${id}`,
  project: (id) => `/projects/${id}`,
  team: (id) => `/teams/${id}`,
  comment: (id) => `/taskDetails?taskId=${id}`,
};

const TYPE_ICONS = {
  TASK_ASSIGNED: "🎯",
  TASK_UPDATED: "✏️",
  COMMENT_ADDED: "💬",
  MENTION: "🔔",
  PROJECT_UPDATED: "📁",
  TEAM_MEMBER_ADDED: "👥",
  PROJECT_MEMBER_ADDED: "📌",
  INVITE: "✉️",
};

export default function NotificationBell() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  const { data, refetch } = useGetNotificationsQuery(undefined, {
    pollingInterval: 60_000,
    refetchOnFocus: true,
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();
  const [clearAll] = useClearAllNotificationsMutation();

  useEffect(() => {
    const handler = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markRead(notification.id);
    }

    const route =
      notification.entityType && notification.entityId
        ? ENTITY_ROUTES[notification.entityType]?.(notification.entityId)
        : null;

    if (route) {
      navigate(route);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <IconButton
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) refetch();
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          max={99}
          sx={{ "& .MuiBadge-badge": { fontSize: "10px", minWidth: 16, height: 16 } }}
        >
          <Bell size={20} className="text-gray-600 dark:text-zinc-400" />
        </Badge>
      </IconButton>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50
                     bg-white dark:bg-zinc-950 border border-gray-200 dark:border-white/10
                     rounded-xl shadow-2xl overflow-hidden"
        >
          <div
            className="flex items-center justify-between px-4 py-3
                       border-b border-gray-200 dark:border-white/10"
          >
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-gray-500 dark:text-zinc-400" />
              <span className="font-semibold text-sm text-gray-900 dark:text-white">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead()}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline
                             flex items-center gap-1 px-2 py-1"
                >
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={() => clearAll()}
                  className="text-xs text-red-500 hover:underline flex items-center
                             gap-1 px-2 py-1"
                >
                  <Trash2 size={12} /> Clear
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-white/5">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell size={28} className="mx-auto text-gray-300 dark:text-zinc-700 mb-3" />
                <p className="text-sm text-gray-500 dark:text-zinc-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={[
                    "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors",
                    notification.isRead
                      ? "hover:bg-gray-50 dark:hover:bg-white/5"
                      : "bg-blue-50/60 dark:bg-blue-500/8 hover:bg-blue-50 dark:hover:bg-blue-500/15",
                  ].join(" ")}
                >
                  <span className="text-lg flex-shrink-0 mt-0.5">
                    {TYPE_ICONS[notification.type] || "🔔"}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        notification.isRead ? "text-gray-700 dark:text-zinc-300" : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-zinc-500 line-clamp-2 mt-0.5">
                      {notification.message}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-zinc-600 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>

                  {!notification.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
