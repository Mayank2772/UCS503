import Topbar from "../components/Topbar";
import { useNavigate } from "react-router-dom";
import { calculateProfileCompletion } from "../utils/profileCompletion";
export default function Dashboard({
  user,
  drives,
  onNav,
  onSelectDrive,
  hasApplied,
  onApply,
  applicationCount,
}) {
  const navigate = useNavigate();

  const firstName = user?.firstName || "Student";
  const pct = calculateProfileCompletion(user);
  const upcomingDrives = drives.slice(0, 4);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#f0f6ff" }}
    >
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title="Dashboard" onNav={onNav} />

        <main className="min-w-0 flex-1 overflow-y-auto px-3 py-4 sm:p-6">
          {/* Welcome banner */}
          <div
            className="rounded-2xl p-6 mb-6 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 60%, #3b82f6 100%)",
            }}
          >
            <div
              className="absolute right-0 top-0 w-64 h-full opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 80% 50%, white 0%, transparent 60%)",
              }}
            />
            <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-blue-200 text-sm font-medium mb-1">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <h2
                  className="text-white text-2xl font-bold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Welcome back, {firstName} 👋
                </h2>
                <p className="text-blue-200 text-sm mt-1.5 max-w-sm">
                  Complete your profile to maximize your chances.
                </p>
              </div>
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 px-5 py-2.5 cursor-pointer rounded-xl text-sm font-semibold transition-all hover:bg-white/30 active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.18)",
                  color: "white",
                  fontFamily: "var(--font-display)",
                }}
              >
                Complete Profile
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div
              className="bg-white rounded-2xl p-5"
              style={{ border: "1px solid #e2e8f0" }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Profile Completion
                  </p>
                  <p
                    className="text-3xl font-bold text-slate-900 mt-1"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {pct}%
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "#eff6ff" }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </div>
              <div
                className="h-2 rounded-full"
                style={{ background: "#e2e8f0" }}
              >
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: "linear-gradient(90deg, #1d4ed8, #60a5fa)",
                  }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {pct === 100
                  ? "Your profile is complete!"
                  : "Add resume & skills to reach 100%"}
              </p>
            </div>

            <div
              className="bg-white rounded-2xl p-5"
              style={{ border: "1px solid #e2e8f0" }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Eligible Drives
                  </p>
                  <p
                    className="text-3xl font-bold mt-1"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "#059669",
                    }}
                  >
                    {drives.filter((d) => d.eligible).length}
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "#ecfdf5" }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 3H8l-2 4h12z" />
                  </svg>
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {drives
                  .filter((d) => d.eligible)
                  .slice(0, 3)
                  .map((d) => (
                    <span
                      key={d.id}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{
                        background: "#f0fdf4",
                        color: "#059669",
                        border: "1px solid #bbf7d0",
                      }}
                    >
                      {d.company}
                    </span>
                  ))}
              </div>
            </div>

            <div
              className="bg-white rounded-2xl p-5 cursor-pointer hover:shadow-md transition-shadow"
              style={{ border: "1px solid #e2e8f0" }}
              onClick={() => onNav("applications")}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Applications
                  </p>
                  <p
                    className="text-3xl font-bold text-slate-900 mt-1"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {applicationCount}
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "#f8fafc" }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                {applicationCount === 0
                  ? "No applications yet. Apply to drives below."
                  : `${applicationCount} application(s) submitted`}
              </p>
            </div>
          </div>

          {/* Upcoming drives */}
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ border: "1px solid #e2e8f0" }}
          >
            <div
              className="px-6 py-4 flex items-center justify-between border-b"
              style={{ borderColor: "#f1f5f9" }}
            >
              <div>
                <h3
                  className="text-base font-semibold text-slate-900"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Upcoming Placement Drives
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Showing 4 of {drives.length} active drives
                </p>
              </div>
              <button
                onClick={() => onNav("drives")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View all
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {[
                      "Company",
                      "Role",
                      "Package",
                      "Deadline",
                      "Eligibility",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {upcomingDrives.map((d) => (
                    <tr
                      key={d.id}
                      className="transition-colors hover:bg-blue-50/50 cursor-pointer"
                      style={{ borderTop: "1px solid #f1f5f9" }}
                      onClick={() => onSelectDrive(d.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                            style={{ background: d.logoColor }}
                          >
                            {d.logo}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {d.company}
                            </div>
                            <div className="text-xs text-slate-400">
                              {d.location}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-700 font-medium">
                          {d.role}
                        </div>
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block"
                          style={{
                            background: d.tagColor + "1a",
                            color: d.tagColor,
                          }}
                        >
                          {d.tag}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">
                          {d.package}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="2"
                          >
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <span className="text-slate-600 text-sm">
                            {d.deadline}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {d.eligible ? (
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{ background: "#dcfce7", color: "#15803d" }}
                          >
                            Eligible
                          </span>
                        ) : (
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{ background: "#fee2e2", color: "#b91c1c" }}
                          >
                            Not Eligible
                          </span>
                        )}
                      </td>
                      <td
                        className="px-6 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {d.eligible ? (
                          hasApplied(d.id) ? (
                            <span
                              className="text-xs font-semibold px-4 py-2 rounded-xl inline-flex items-center gap-1.5"
                              style={{
                                background: "#dcfce7",
                                color: "#15803d",
                              }}
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              Applied
                            </span>
                          ) : (
                            <button
                              onClick={() => onApply(d.id)}
                              className="text-xs font-semibold px-4 py-2 rounded-xl text-white transition-all hover:opacity-90 active:scale-95"
                              style={{
                                background:
                                  "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                              }}
                            >
                              Apply Now
                            </button>
                          )
                        ) : (
                          <button
                            disabled
                            className="text-xs font-semibold px-4 py-2 rounded-xl cursor-not-allowed"
                            style={{ background: "#f1f5f9", color: "#94a3b8" }}
                          >
                            Apply Now
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div
              className="md:hidden divide-y"
              style={{ borderColor: "#f1f5f9" }}
            >
              {upcomingDrives.map((d) => (
                <div
                  key={d.id}
                  className="p-4 cursor-pointer hover:bg-blue-50/50"
                  onClick={() => onSelectDrive(d.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                        style={{ background: d.logoColor }}
                      >
                        {d.logo}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {d.company}
                        </div>
                        <div className="text-xs text-slate-500">{d.role}</div>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 text-sm">
                      {d.package}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">
                        {d.deadline}
                      </span>
                      {d.eligible ? (
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: "#dcfce7", color: "#15803d" }}
                        >
                          Eligible
                        </span>
                      ) : (
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: "#fee2e2", color: "#b91c1c" }}
                        >
                          Not Eligible
                        </span>
                      )}
                    </div>
                    {d.eligible && !hasApplied(d.id) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onApply(d.id);
                        }}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                        style={{ background: "#1d4ed8" }}
                      >
                        Apply
                      </button>
                    )}
                    {hasApplied(d.id) && (
                      <span className="text-xs font-semibold text-green-600">
                        ✓ Applied
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick tips */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className="rounded-2xl p-5 flex gap-4 cursor-pointer hover:shadow-md transition-shadow"
              style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
              onClick={() => onNav("resources")}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#2563eb" }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <h4
                  className="font-semibold text-blue-900 text-sm"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Interview Prep Resources
                </h4>
                <p className="text-xs text-blue-700/70 mt-1">
                  Access curated DSA sheets, aptitude sets, and HR question
                  banks.
                </p>
              </div>
            </div>
            <div
              className="rounded-2xl p-5 flex gap-4"
              style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#16a34a" }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <div>
                <h4
                  className="font-semibold text-green-900 text-sm"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Placement Statistics 2024
                </h4>
                <p className="text-xs text-green-700/70 mt-1">
                  94% placement rate. Highest package: ₹42 LPA (Uber). View full
                  report.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
