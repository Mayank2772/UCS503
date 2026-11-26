import { useEffect, useRef, useState } from "react";
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/notifications";

function timeAgo(value) {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 1000),
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Topbar({ title, onNav }) {
  const [showNotifDrop, setShowNotifDrop] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationError, setNotificationError] = useState("");
  const notificationRef = useRef(null);
  const [user] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Invalid user data:", error);
      return null;
    }
  });

  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";

  const fullName = `${firstName} ${lastName}`.trim() || "Student";

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "S";

  useEffect(() => {
    const loadNotifications = () => {
      getNotifications()
        .then((data) => {
          setNotifications(data);
          setNotificationError("");
        })
        .catch((error) =>
          setNotificationError(
            error.message || "Unable to load notifications. Please try again.",
          ),
        );
    };

    loadNotifications();
    const refreshTimer = window.setInterval(loadNotifications, 15000);
    return () => window.clearInterval(refreshTimer);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!notificationRef.current?.contains(event.target)) {
        setShowNotifDrop(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  const handleMarkRead = async (notification) => {
    if (notification.isRead) return;
    try {
      const updated = await markNotificationRead(notification._id);
      setNotifications((current) =>
        current.map((item) => (item._id === updated._id ? updated : item)),
      );
      setNotificationError("");
    } catch (error) {
      console.error("Mark notification read error:", error);
      setNotificationError(
        error.message || "Unable to mark the notification as read.",
      );
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, isRead: true })),
      );
      setNotificationError("");
    } catch (error) {
      console.error("Mark all notifications read error:", error);
      setNotificationError(
        error.message || "Unable to mark notifications as read.",
      );
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications((current) =>
        current.filter((notification) => notification._id !== notificationId),
      );
      setNotificationError("");
    } catch (error) {
      console.error("Delete notification error:", error);
      setNotificationError(error.message || "Unable to delete notification.");
    }
  };

  return (
    <header
      className="flex items-center justify-between px-3 sm:px-6 h-16 flex-shrink-0 relative"
      style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0" }}
    >
      {/* Page title */}
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          aria-label="Open navigation"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => window.dispatchEvent(new Event("toggle-mobile-nav"))}
        >
          ☰
        </button>
        <h1
          className="truncate text-slate-900 text-lg font-semibold"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h1>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-3">
        {/* Search */}
        {/* <div className="relative hidden sm:block">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            placeholder="Search companies, roles..."
            className="h-9 pl-9 pr-4 rounded-xl text-sm outline-none transition-all"
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              fontFamily: "var(--font-body)",
              width: "220px",
              color: "#334155",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#2563eb";
              e.target.style.background = "#fff";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e2e8f0";
              e.target.style.background = "#f8fafc";
            }}
          />
        </div> */}

        {/* Notification bell */}
        <div ref={notificationRef} className="relative">
          <button
            onClick={() => setShowNotifDrop(!showNotifDrop)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-slate-100 relative cursor-pointer"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#475569"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                style={{ background: "#ef4444" }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifDrop && (
            <div
              className="absolute right-0 top-11 rounded-2xl shadow-xl overflow-hidden z-50"
              style={{
                width: "min(300px, calc(100vw - 1.5rem))",
                background: "#fff",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                className="px-4 py-3 border-b flex items-center justify-between"
                style={{ borderColor: "#f1f5f9" }}
              >
                <span
                  className="text-sm font-semibold text-slate-800"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Notifications
                </span>
                <button
                  onClick={handleMarkAllRead}
                  disabled={unreadCount === 0}
                  className="text-xs text-blue-600 cursor-pointer hover:underline disabled:text-slate-300 disabled:no-underline"
                >
                  Mark all read
                </button>
              </div>
              {notificationError && (
                <p className="px-4 py-2 text-xs text-red-700" role="alert">
                  {notificationError}
                </p>
              )}
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-slate-400">
                  {notificationError ? "Notifications are unavailable." : "No notifications yet."}
                </div>
              ) : (
                notifications.map((notification, i) => (
                  <div
                    key={notification._id}
                    onClick={() => handleMarkRead(notification)}
                    className="px-4 py-3 flex gap-3 cursor-pointer transition-colors hover:bg-slate-50"
                    style={{
                      borderBottom:
                        i < notifications.length - 1
                          ? "1px solid #f1f5f9"
                          : "none",
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{
                        background: notification.isRead
                          ? "transparent"
                          : "#2563eb",
                        border: notification.isRead
                          ? "1px solid #cbd5e1"
                          : "none",
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {timeAgo(notification.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDelete(notification._id);
                      }}
                      className="self-start text-xs text-slate-300 hover:text-red-500"
                      aria-label="Delete notification"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Profile avatar */}
        <button
          onClick={() => onNav("profile")}
          className="flex items-center gap-2.5 pl-2 pr-3 h-9 rounded-xl transition-all hover:bg-slate-100"
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #1d4ed8, #60a5fa)" }}
          >
            {initials}
          </div>
          <div className="text-left hidden sm:block">
            <div
              className="text-xs font-semibold text-slate-800 leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {fullName}
            </div>
            <div className="text-[10px] text-slate-400 leading-tight">
              Student
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}
