import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import { getMyApplications } from "../api/applications";

const statusConfig = {
  Applied: {
    color: "#2563eb",
    bg: "#eff6ff",
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
    step: 1,
  },
  Shortlisted: {
    color: "#7c3aed",
    bg: "#f5f3ff",
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    step: 2,
  },
  "On Hold": {
    color: "#d97706",
    bg: "#fffbeb",
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    step: 2,
  },
  Rejected: {
    color: "#dc2626",
    bg: "#fef2f2",
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    step: 3,
  },
  Offer: {
    color: "#059669",
    bg: "#ecfdf5",
    icon: (
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
    ),
    step: 4,
  },
  Interview: {
    color: "#0891b2",
    bg: "#ecfeff",
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
    step: 3,
  },
};

const PIPELINE_STEPS = ["Applied", "Shortlisted", "Interview", "Offer"];

export default function ApplicationsPage({
  drives,
  onNav,
  applications,
  onSelectDrive,
}) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [fetchedApplications, setFetchedApplications] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [hasFetchedApplications, setHasFetchedApplications] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let isMounted = true;

    getMyApplications()
      .then((data) => {
        if (isMounted) {
          setFetchedApplications(Array.isArray(data) ? data : []);
          setHasFetchedApplications(true);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setLoadError(error.message);
          setHasFetchedApplications(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [applications]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const pageApplications = hasFetchedApplications
    ? fetchedApplications
    : Array.isArray(applications)
      ? applications
      : [];

  const enriched = pageApplications
    .map((app) => {
      const sourceDrive =
        app.drive ||
        drives.find(
          (drive) =>
            String(drive._id || drive.id) ===
            String(app.driveId || app.drive?._id),
        );

      if (!sourceDrive) return null;

      const deadlineDate = new Date(
        sourceDrive.deadlineDate || sourceDrive.deadline,
      );
      const packageValue =
        sourceDrive.package ||
        (sourceDrive.ctcRange || sourceDrive.ctc
          ? `₹${sourceDrive.ctcRange || sourceDrive.ctc} LPA`
          : "CTC not specified");

      return {
        ...app,
        drive: {
          ...sourceDrive,
          id: sourceDrive._id || sourceDrive.id,
          deadlineDate,
          deadline: deadlineDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          package: packageValue,
          logo:
            sourceDrive.logo || sourceDrive.company?.slice(0, 2).toUpperCase(),
          logoColor: sourceDrive.logoColor || "#2563eb",
          tag: sourceDrive.tag || sourceDrive.type || "Placement",
          tagColor: sourceDrive.tagColor || "#2563eb",
        },
      };
    })
    .filter(Boolean);

  const filtered =
    statusFilter === "All"
      ? enriched
      : enriched.filter((a) => a.status === statusFilter);

  const counts = { All: enriched.length };
  enriched.forEach((a) => {
    counts[a.status] = (counts[a.status] || 0) + 1;
  });

  const statuses = [
    "All",
    "Applied",
    "Shortlisted",
    "Interview",
    "On Hold",
    "Rejected",
    "Offer",
  ];

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#f0f6ff" }}
    >
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title="My Applications" onNav={onNav} />

        <main className="min-w-0 flex-1 overflow-y-auto px-3 py-4 sm:p-6">
          {loadError && (
            <div
              className="mb-5 rounded-xl px-4 py-3 text-sm"
              style={{ background: "#fef2f2", color: "#b91c1c" }}
            >
              {loadError}
            </div>
          )}

          {/* Summary stat cards */}
          <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-3 lg:grid-cols-5">
            {[
              {
                label: "Total",
                value: enriched.length,
                color: "#2563eb",
                bg: "#eff6ff",
              },
              {
                label: "Shortlisted",
                value: counts["Shortlisted"] || 0,
                color: "#7c3aed",
                bg: "#f5f3ff",
              },
              {
                label: "On Hold",
                value: counts["On Hold"] || 0,
                color: "#d97706",
                bg: "#fffbeb",
              },
              {
                label: "Rejected",
                value: counts["Rejected"] || 0,
                color: "#dc2626",
                bg: "#fef2f2",
              },
              {
                label: "Offers",
                value: counts["Offer"] || 0,
                color: "#059669",
                bg: "#ecfdf5",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-2xl p-4 text-center"
                style={{ border: "1px solid #e2e8f0" }}
              >
                <div
                  className="text-2xl font-bold"
                  style={{ color: s.color, fontFamily: "var(--font-display)" }}
                >
                  {s.value}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {statuses.map((s) => {
              const cfg = s !== "All" ? statusConfig[s] : null;
              const isActive = statusFilter === s;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: isActive ? cfg?.bg || "#eff6ff" : "#fff",
                    color: isActive ? cfg?.color || "#2563eb" : "#475569",
                    border: isActive
                      ? `1.5px solid ${cfg?.color || "#2563eb"}`
                      : "1.5px solid #e2e8f0",
                  }}
                >
                  {s !== "All" && cfg && <span>{cfg.icon}</span>}
                  {s}
                  {counts[s] !== undefined && (
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                      style={{
                        background: isActive
                          ? cfg?.color || "#2563eb"
                          : "#f1f5f9",
                        color: isActive ? "white" : "#64748b",
                      }}
                    >
                      {counts[s]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Applications list */}
          {enriched.length === 0 ? (
            <div
              className="bg-white rounded-2xl p-16 text-center"
              style={{ border: "1px solid #e2e8f0" }}
            >
              <svg
                className="mx-auto mb-4"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="1.2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="9" y1="13" x2="15" y2="13" />
                <line x1="9" y1="17" x2="12" y2="17" />
              </svg>
              <p
                className="text-slate-600 font-medium text-base"
                style={{ fontFamily: "var(--font-display)" }}
              >
                No applications yet
              </p>
              <p className="text-sm text-slate-400 mt-1 mb-5">
                Apply to placement drives to track your progress here.
              </p>
              <button
                onClick={() => onNav("drives")}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                }}
              >
                Browse Placement Drives
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="bg-white rounded-2xl p-12 text-center"
              style={{ border: "1px solid #e2e8f0" }}
            >
              <p className="text-slate-500 font-medium">
                No applications with status "{statusFilter}"
              </p>
              <button
                onClick={() => setStatusFilter("All")}
                className="mt-2 text-xs text-blue-600 hover:underline"
              >
                Show all
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((app, idx) => {
                const cfg = statusConfig[app.status] || statusConfig.Applied;
                const d = app.drive;
                const daysLeft = Math.ceil(
                  (d.deadlineDate.getTime() - now.getTime()) / 86400000,
                );

                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl overflow-hidden"
                    style={{ border: "1px solid #e2e8f0" }}
                  >
                    {/* Status accent line */}
                    <div
                      className="h-1 w-full"
                      style={{ background: cfg.color }}
                    />

                    <div className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        {/* Company info */}
                        <div
                          className="flex items-center gap-4 cursor-pointer group"
                          onClick={() => onSelectDrive(d.id)}
                        >
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                            style={{ background: d.logoColor }}
                          >
                            {d.logo}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors"
                                style={{ fontFamily: "var(--font-display)" }}
                              >
                                {d.company}
                              </span>
                              <span
                                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{
                                  background: d.tagColor + "18",
                                  color: d.tagColor,
                                }}
                              >
                                {d.tag}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 mt-0.5">
                              {d.role}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {d.location} • {d.package}
                            </p>
                          </div>
                        </div>

                        {/* Status badge + meta */}
                        <div className="flex flex-col items-start sm:items-end gap-2">
                          <span
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                            style={{ background: cfg.bg, color: cfg.color }}
                          >
                            {cfg.icon}
                            {app.status}
                          </span>
                          <span className="text-xs text-slate-400">
                            Applied{" "}
                            {new Date(
                              app.appliedAt || app.createdAt,
                            ).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Pipeline tracker */}
                      <div
                        className="mt-5 pt-4"
                        style={{ borderTop: "1px solid #f1f5f9" }}
                      >
                        <div className="flex items-center gap-0">
                          {PIPELINE_STEPS.map((step, i) => {
                            const isRejected = app.status === "Rejected";
                            const isOnHold = app.status === "On Hold";
                            const currentStep = cfg.step;
                            const isDone = isRejected
                              ? i < 1
                              : isOnHold
                                ? i < 2
                                : i < currentStep;
                            const isCurrent = isRejected
                              ? i === 1
                              : isOnHold
                                ? i === 1
                                : i === currentStep - 1;
                            const isLast = i === PIPELINE_STEPS.length - 1;

                            return (
                              <div
                                key={step}
                                className="flex items-center flex-1 last:flex-initial"
                              >
                                <div className="flex flex-col items-center">
                                  <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                                    style={{
                                      background:
                                        isRejected && isCurrent
                                          ? "#fef2f2"
                                          : isDone || isCurrent
                                            ? isCurrent
                                              ? cfg.color
                                              : "#1d4ed8"
                                            : "#f1f5f9",
                                      color:
                                        isRejected && isCurrent
                                          ? "#dc2626"
                                          : isDone || isCurrent
                                            ? "white"
                                            : "#94a3b8",
                                      border: isCurrent
                                        ? `2px solid ${cfg.color}`
                                        : "none",
                                    }}
                                  >
                                    {isRejected && isCurrent ? (
                                      <svg
                                        width="10"
                                        height="10"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#dc2626"
                                        strokeWidth="3"
                                      >
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                      </svg>
                                    ) : isDone ? (
                                      <svg
                                        width="10"
                                        height="10"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="3"
                                      >
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    ) : (
                                      i + 1
                                    )}
                                  </div>
                                  <span
                                    className="text-[9px] mt-1 font-medium whitespace-nowrap"
                                    style={{
                                      color: isCurrent
                                        ? cfg.color
                                        : isDone
                                          ? "#1d4ed8"
                                          : "#94a3b8",
                                    }}
                                  >
                                    {isRejected && isCurrent
                                      ? "Rejected"
                                      : isOnHold && isCurrent
                                        ? "On Hold"
                                        : step}
                                  </span>
                                </div>
                                {!isLast && (
                                  <div
                                    className="h-0.5 flex-1 mx-1 mb-3"
                                    style={{
                                      background: isDone
                                        ? "#1d4ed8"
                                        : "#e2e8f0",
                                    }}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Footer actions */}
                      <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          Drive deadline: {d.deadline}
                          {daysLeft > 0 && (
                            <span className="text-amber-500 font-medium">
                              ({daysLeft}d left)
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => onSelectDrive(d.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          View Drive Details
                          <svg
                            width="11"
                            height="11"
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
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
