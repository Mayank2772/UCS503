import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },

  {
    id: "profile",
    label: "My Profile",
    path: "/profile",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },

  {
    id: "drives",
    label: "Placement Drives",
    path: "/drives",
    badgeColor: "#10b981",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-4 0v2M8 7V5a2 2 0 0 1 4 0" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
  },

  {
    id: "applications",
    label: "Applications",
    path: "/applications",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="12" y2="17" />
      </svg>
    ),
  },
  {
    id: "resources",
    label: "Interview Prep",
    path: "/resources",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    id: "team",
    label: "Our Team",
    path: "/team",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="7" r="4" />
        <path d="M2 21a7 7 0 0 1 14 0" />
        <path d="M16 3.5a4 4 0 0 1 0 7.5" />
        <path d="M18 14a5 5 0 0 1 4 5" />
      </svg>
    ),
  },
];

const bottomItems = [
  {
    id: "settings",
    label: "Settings",
    path: "/settings",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

function NavButton({ label, badge, badgeColor, icon, path, onClick }) {
  return (
    <NavLink
      to={path}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
      style={({ isActive }) => ({
        color: isActive ? "#ffffff" : "rgba(148,189,255,0.75)",

        background: isActive ? "#2563eb" : "transparent",

        fontFamily: "var(--font-body)",
      })}
      onMouseEnter={(e) => {
        if (!e.currentTarget.classList.contains("active")) {
          e.currentTarget.style.background = "rgba(255,255,255,0.07)";
          e.currentTarget.style.color = "#ffffff";
        }
      }}
      onMouseLeave={(e) => {
        if (!e.currentTarget.classList.contains("active")) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "rgba(148,189,255,0.75)";
        }
      }}
      onClick={onClick}
    >
      {() => (
        <>
          <span className="flex-shrink-0">{icon}</span>

          <span className="flex-1">{label}</span>

          {Number(badge) > 0 && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{
                background: badgeColor,
                color: "white",
              }}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({
  onLogout,
  drivesCount = 0,
  onDrivesOpen,
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const toggle = () => setOpen((value) => !value);
    window.addEventListener("toggle-mobile-nav", toggle);
    return () => window.removeEventListener("toggle-mobile-nav", toggle);
  }, []);

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
  const rollNumber = user?.rollNumber || "";
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-slate-950/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
      className={`fixed inset-y-0 left-0 z-40 flex h-full flex-col transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
      style={{
        background: "#0f2a5e",
        width: "240px",
        minWidth: "240px",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-6 py-5 border-b"
        style={{
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: "rgba(255,255,255,0.15)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" />

            <path
              d="M2 17l10 5 10-5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M2 12l10 5 10-5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div>
          <div
            className="text-white text-sm font-bold leading-tight"
            style={{
              fontFamily: "var(--font-display)",
            }}
          >
            CampusConnect
          </div>

          <div className="text-blue-300 text-xs opacity-70">
            Placement Portal
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-blue-400/50 text-[10px] font-semibold uppercase tracking-widest px-3 mb-3">
          Main Menu
        </p>

        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.id}>
              <NavButton
                {...item}
                badge={item.id === "drives" ? drivesCount : item.badge}
                onClick={() => {
                  setOpen(false);
                  if (item.id === "drives") onDrivesOpen?.();
                }}
              />
            </li>
          ))}
        </ul>

        <p className="text-blue-400/50 text-[10px] font-semibold uppercase tracking-widest px-3 mb-3 mt-6">
          Account
        </p>

        <ul className="space-y-0.5">
          {bottomItems.map((item) => (
            <li key={item.id}>
              <NavButton {...item} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Profile strip */}
      <div
        className="px-4 py-4 border-t"
        style={{
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center gap-3">
          {/* User Avatar */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
            }}
          >
            {initials}
          </div>

          {/* User Details */}
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-semibold truncate">
              {fullName}
            </div>

            <div className="text-blue-300/70 text-xs truncate">
              {rollNumber && ` • ${rollNumber}`}
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            title="Logout"
            aria-label="Logout"
            className="flex-shrink-0 w-9 h-9 cursor-pointer flex items-center justify-center rounded-lg text-blue-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
      </aside>
    </>
  );
}
