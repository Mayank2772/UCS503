import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";

export default function DriveDetailPage({
  drives,
  onNav,
  hasApplied,
  onApply,
}) {
  const { driveId } = useParams();
  const navigate = useNavigate();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const d = drives.find((dr) => String(dr.id) === driveId);
  if (!d) return null;

  const applied = hasApplied(d.id);

  const daysLeft = Math.ceil(
    (d.deadlineDate.getTime() - now.getTime()) / 86400000,
  );
  const fillPct = Math.min(
    100,
    Math.round((d.registeredCount / (d.openings * 10)) * 100),
  );

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#f0f6ff" }}
    >
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title="Drive Details" onNav={onNav} />

        <main className="min-w-0 flex-1 overflow-y-auto px-3 py-4 sm:p-6">
          {/* Back button */}
          <button
            onClick={() => navigate("/drives")}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 mb-5 transition-colors group"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors group-hover:bg-blue-50"
              style={{ background: "#f1f5f9" }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </div>
            Back to Placement Drives
          </button>

          <div className="max-w-4xl mx-auto">
            {/* Hero card */}
            <div
              className="bg-white rounded-2xl overflow-hidden mb-5"
              style={{ border: "1px solid #e2e8f0" }}
            >
              {/* Color banner */}
              <div
                className="h-3 w-full"
                style={{
                  background: `linear-gradient(90deg, ${d.logoColor}, ${d.logoColor}88)`,
                }}
              />

              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-sm"
                      style={{ background: d.logoColor }}
                    >
                      {d.logo}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h1
                          className="text-xl font-bold text-slate-900"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {d.company}
                        </h1>
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{
                            background: d.tagColor + "18",
                            color: d.tagColor,
                          }}
                        >
                          {d.tag}
                        </span>
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            background:
                              d.type === "Internship"
                                ? "#fef3c7"
                                : d.type === "PPO"
                                  ? "#ede9fe"
                                  : "#eff6ff",
                            color:
                              d.type === "Internship"
                                ? "#b45309"
                                : d.type === "PPO"
                                  ? "#7c3aed"
                                  : "#1d4ed8",
                          }}
                        >
                          {d.type}
                        </span>
                      </div>
                      <p className="text-slate-600 font-medium">{d.role}</p>
                      <p className="text-sm text-slate-400 mt-0.5">
                        {d.location} • {d.mode}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start sm:items-end gap-2">
                    <div
                      className="text-2xl font-bold"
                      style={{
                        color: "#1d4ed8",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {d.package}
                    </div>
                    <div className="text-xs text-slate-400">
                      Range: {d.packageRange}
                    </div>
                    {applied ? (
                      <span
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                        style={{ background: "#dcfce7", color: "#15803d" }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Application Submitted
                      </span>
                    ) : d.eligible ? (
                      <button
                        onClick={() => onApply(d.id)}
                        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 shadow-sm"
                        style={{
                          background:
                            "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        Apply Now
                      </button>
                    ) : (
                      <span
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold"
                        style={{ background: "#fee2e2", color: "#b91c1c" }}
                      >
                        Not Eligible
                      </span>
                    )}
                  </div>
                </div>

                {/* Key stats bar */}
                <div
                  className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5"
                  style={{ borderTop: "1px solid #f1f5f9" }}
                >
                  {[
                    {
                      icon: (
                        <svg
                          width="14"
                          height="14"
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
                      ),
                      label: "Deadline",
                      value: d.deadline,
                      sub: daysLeft > 0 ? `${daysLeft}d left` : "Expired",
                      valueColor: daysLeft <= 7 ? "#dc2626" : "#0f172a",
                    },
                    {
                      icon: (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      ),
                      label: "Openings",
                      value: `${d.openings} seats`,
                      sub: `${d.registeredCount} registered`,
                      valueColor: "#0f172a",
                    },
                    {
                      icon: (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      ),
                      label: "CGPA Cutoff",
                      value: `≥ ${d.cgpaCutoff}`,
                      sub: d.backlogAllowed ? "Backlog allowed" : "No backlog",
                      valueColor: "#0f172a",
                    },
                    {
                      icon: (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="2" y="3" width="20" height="14" rx="2" />
                          <path d="M8 21h8M12 17v4" />
                        </svg>
                      ),
                      label: "Bond",
                      value: d.bond,
                      sub: d.mode,
                      valueColor: d.bond === "No Bond" ? "#059669" : "#c2410c",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="rounded-xl p-3"
                      style={{ background: "#f8fafc" }}
                    >
                      <div className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                        {item.icon}
                        <span className="text-[10px] font-semibold uppercase tracking-wide">
                          {item.label}
                        </span>
                      </div>
                      <div
                        className="text-sm font-bold"
                        style={{
                          color: item.valueColor,
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {item.value}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {item.sub}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Left column */}
              <div className="space-y-5">
                {/* Eligibility */}
                <div
                  className="bg-white rounded-2xl p-5"
                  style={{ border: "1px solid #e2e8f0" }}
                >
                  <h3
                    className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    Eligibility Criteria
                  </h3>
                  <ul className="space-y-2">
                    {[
                      {
                        label: "Min CGPA",
                        value: `${d.cgpaCutoff} / 10`,
                        ok: true,
                      },
                      {
                        label: "Active Backlogs",
                        value: d.backlogAllowed ? "Allowed" : "Not Allowed",
                        ok: d.backlogAllowed,
                      },
                      {
                        label: "Eligible Branches",
                        value: d.branches.join(", "),
                        ok: true,
                      },
                    ].map((item) => (
                      <li
                        key={item.label}
                        className="flex items-start justify-between gap-2 text-xs"
                      >
                        <span className="text-slate-500">{item.label}</span>
                        <span
                          className="font-semibold text-right"
                          style={{
                            color: item.ok ? "#0f172a" : "#dc2626",
                            maxWidth: "55%",
                            textAlign: "right",
                          }}
                        >
                          {item.value}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div
                    className="mt-4 pt-3"
                    style={{ borderTop: "1px solid #f1f5f9" }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-500">
                        Registration Fill
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {d.registeredCount}/{d.openings * 10}
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full"
                      style={{ background: "#e2e8f0" }}
                    >
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${fillPct}%`,
                          background: fillPct > 70 ? "#ef4444" : "#2563eb",
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {fillPct}% seats registered
                    </p>
                  </div>

                  <div
                    className="mt-3 flex items-center gap-2 p-2.5 rounded-xl"
                    style={{ background: d.eligible ? "#f0fdf4" : "#fef2f2" }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={d.eligible ? "#16a34a" : "#dc2626"}
                      strokeWidth="2"
                    >
                      {d.eligible ? (
                        <polyline points="20 6 9 17 4 12" />
                      ) : (
                        <>
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </>
                      )}
                    </svg>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: d.eligible ? "#15803d" : "#b91c1c" }}
                    >
                      {d.eligible
                        ? "You are eligible for this drive"
                        : "You are not eligible for this drive"}
                    </span>
                  </div>
                </div>

                {/* Required skills */}
                <div
                  className="bg-white rounded-2xl p-5"
                  style={{ border: "1px solid #e2e8f0" }}
                >
                  <h3
                    className="text-sm font-semibold text-slate-800 mb-3"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {d.skills.map((s) => (
                      <span
                        key={s}
                        className="text-xs font-medium px-2.5 py-1 rounded-lg"
                        style={{
                          background: "#eff6ff",
                          color: "#1d4ed8",
                          border: "1px solid #bfdbfe",
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: description + process + about */}
              <div className="lg:col-span-2 space-y-5">
                {/* Job description */}
                <div
                  className="bg-white rounded-2xl p-5"
                  style={{ border: "1px solid #e2e8f0" }}
                >
                  <h3
                    className="text-sm font-semibold text-slate-800 mb-3"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Job Description
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {d.description}
                  </p>
                </div>

                {/* Selection process */}
                <div
                  className="bg-white rounded-2xl p-5"
                  style={{ border: "1px solid #e2e8f0" }}
                >
                  <h3
                    className="text-sm font-semibold text-slate-800 mb-4"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Selection Process
                  </h3>
                  <div className="relative">
                    {d.process.map((step, i) => (
                      <div key={i} className="flex gap-4 pb-4 last:pb-0">
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{
                              background:
                                "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                              color: "white",
                            }}
                          >
                            {i + 1}
                          </div>
                          {i < d.process.length - 1 && (
                            <div
                              className="w-0.5 flex-1 mt-1"
                              style={{
                                background: "#e2e8f0",
                                minHeight: "20px",
                              }}
                            />
                          )}
                        </div>
                        <div className="pt-1.5 pb-2">
                          <p className="text-sm font-medium text-slate-800">
                            {step}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* About company */}
                <div
                  className="bg-white rounded-2xl p-5"
                  style={{ border: "1px solid #e2e8f0" }}
                >
                  <h3
                    className="text-sm font-semibold text-slate-800 mb-3"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    About {d.company}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {d.aboutCompany}
                  </p>
                </div>

                {/* CTA */}
                {!applied && d.eligible && (
                  <div
                    className="rounded-2xl p-5 flex items-center justify-between gap-4"
                    style={{
                      background: "linear-gradient(135deg, #1e3a8a, #1d4ed8)",
                      border: "1px solid #1d4ed8",
                    }}
                  >
                    <div>
                      <p
                        className="text-white font-semibold text-sm"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        Ready to apply?
                      </p>
                      <p className="text-blue-200 text-xs mt-0.5">
                        Deadline: {d.deadline} •{" "}
                        {daysLeft > 0
                          ? `${daysLeft} days left`
                          : "Today is the last day!"}
                      </p>
                    </div>
                    <button
                      onClick={() => onApply(d.id)}
                      className="flex-shrink-0 px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-white/90 active:scale-95"
                      style={{
                        background: "white",
                        color: "#1d4ed8",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      Apply Now
                    </button>
                  </div>
                )}

                {applied && (
                  <div
                    className="rounded-2xl p-5 flex items-center gap-4"
                    style={{
                      background: "#f0fdf4",
                      border: "1px solid #86efac",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "#dcfce7" }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#16a34a"
                        strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-green-800 font-semibold text-sm">
                        Application submitted successfully
                      </p>
                      <p className="text-green-600 text-xs mt-0.5">
                        Track status in{" "}
                        <span
                          className="underline cursor-pointer"
                          onClick={() => onNav("applications")}
                        >
                          My Applications
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
