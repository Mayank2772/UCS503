import { useState, useMemo, useEffect } from "react";
import Topbar from "../components/Topbar";

const types = ["All", "Full-Time", "Internship", "PPO"];

export default function DrivesPage({
  drives,
  onNav,
  onSelectDrive,
  hasApplied,
  onApply,
}) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [activeType, setActiveType] = useState("All");
  const [sortBy, setSortBy] = useState("deadline");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const filtered = useMemo(() => {
    let list = [...drives];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (d) =>
          d.company.toLowerCase().includes(q) ||
          d.role.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q) ||
          d.skills.some((s) => s.toLowerCase().includes(q)),
      );
    }

    if (activeTag !== "All") list = list.filter((d) => d.tag === activeTag);
    if (activeType !== "All") list = list.filter((d) => d.type === activeType);
    list.sort((a, b) =>
      sortBy === "deadline"
        ? a.deadlineDate.getTime() - b.deadlineDate.getTime()
        : parseInt(b.package.replace(/[^\d]/g, "")) -
          parseInt(a.package.replace(/[^\d]/g, "")),
    );

    return list;
  }, [drives, query, activeTag, activeType, sortBy]);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#f0f6ff" }}
    >
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title="Placement Drives" onNav={onNav} />

        <main className="min-w-0 flex-1 overflow-y-auto px-3 py-4 sm:p-6">
          {/* Header stats */}
          <div className="flex flex-wrap gap-3 mb-6">
            {[
              {
                label: "Total Drives",
                value: drives.length,
                color: "#2563eb",
                bg: "#eff6ff",
              },
              {
                label: "Eligible For",
                value: drives.filter((d) => d.eligible).length,
                color: "#059669",
                bg: "#ecfdf5",
              },
              {
                label: "Applied",
                value: drives.filter((d) => hasApplied(d.id)).length,
                color: "#7c3aed",
                bg: "#f5f3ff",
              },
              {
                label: "Closing Soon",
                value: drives.filter((d) => {
                  const days = Math.ceil(
                    (d.deadlineDate.getTime() - now.getTime()) / 86400000,
                  );
                  return days <= 15 && days > 0;
                }).length,
                color: "#dc2626",
                bg: "#fef2f2",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white"
                style={{ border: "1px solid #e2e8f0" }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                  style={{
                    background: s.bg,
                    color: s.color,
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {s.value}
                </div>
                <span className="text-sm text-slate-600 font-medium">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Search + filters */}
          <div
            className="bg-white rounded-2xl p-4 mb-5"
            style={{ border: "1px solid #e2e8f0" }}
          >
            {/* Search bar */}
            <div className="relative mb-4">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                width="16"
                height="16"
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
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by company, role, location, skill..."
                className="w-full h-11 pl-11 pr-4 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontFamily: "var(--font-body)",
                  color: "#0f172a",
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
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filter row */}
            <div className="flex flex-wrap gap-3 items-center">
              {/* Tag filter */}

              <div className="w-px h-5 bg-slate-200 hidden sm:block" />

              {/* Type filter */}
              <div className="flex gap-1.5">
                {types.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveType(t)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: activeType === t ? "#7c3aed" : "#f1f5f9",
                      color: activeType === t ? "white" : "#475569",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="w-px h-5 bg-slate-200 hidden sm:block" />

              {/* Sort */}
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-slate-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs font-medium rounded-lg px-2 py-1.5 outline-none"
                  style={{
                    background: "#f1f5f9",
                    color: "#475569",
                    border: "none",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  <option value="deadline">Deadline</option>
                  <option value="package">Package</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results count */}
          <p className="text-xs text-slate-400 mb-3 px-1">
            {filtered.length} drive{filtered.length !== 1 ? "s" : ""} found
            {query && (
              <span>
                {" "}
                for "<span className="text-slate-600 font-medium">{query}</span>
                "
              </span>
            )}
          </p>

          {/* Drive cards */}
          {filtered.length === 0 ? (
            <div
              className="bg-white rounded-2xl p-16 text-center"
              style={{ border: "1px solid #e2e8f0" }}
            >
              <svg
                className="mx-auto mb-3"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="1.5"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p className="text-slate-500 font-medium">
                No drives match your search
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Try adjusting filters or clearing the search
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setActiveTag("All");
                  setActiveType("All");
                }}
                className="mt-4 text-xs font-semibold text-blue-600 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map((d) => {
                const daysLeft = Math.ceil(
                  (d.deadlineDate.getTime() - now.getTime()) / 86400000,
                );
                const applied = hasApplied(d.id);
                return (
                  <div
                    key={d.id}
                    className="bg-white rounded-2xl p-5 cursor-pointer group transition-all hover:shadow-md hover:-translate-y-0.5"
                    style={{ border: "1px solid #e2e8f0" }}
                    onClick={() => onSelectDrive(d.id)}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                          style={{ background: d.logoColor }}
                        >
                          {d.logo}
                        </div>
                        <div>
                          <div
                            className="font-bold text-slate-900 text-sm"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {d.company}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {d.location} • {d.mode}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
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
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
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
                    </div>

                    {/* Role + package */}
                    <div className="mb-3">
                      <div className="text-sm font-semibold text-slate-800 mb-1">
                        {d.role}
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className="text-lg font-bold"
                          style={{
                            color: "#1d4ed8",
                            fontFamily: "var(--font-display)",
                          }}
                        >
                          {d.package}
                        </span>
                        <span className="text-xs text-slate-400">CTC</span>
                      </div>
                    </div>

                    {/* Meta chips */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span
                        className="text-[10px] font-medium px-2 py-1 rounded-lg flex items-center gap-1"
                        style={{ background: "#f8fafc", color: "#475569" }}
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        CGPA ≥ {d.cgpaCutoff}
                      </span>
                      <span
                        className="text-[10px] font-medium px-2 py-1 rounded-lg flex items-center gap-1"
                        style={{ background: "#f8fafc", color: "#475569" }}
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="2" y="7" width="20" height="14" rx="2" />
                          <path d="M16 3H8l-2 4h12z" />
                        </svg>
                        {d.openings} openings
                      </span>
                      <span
                        className={`text-[10px] font-medium px-2 py-1 rounded-lg`}
                        style={{
                          background: d.backlogAllowed ? "#ecfdf5" : "#fff7ed",
                          color: d.backlogAllowed ? "#059669" : "#c2410c",
                        }}
                      >
                        {d.backlogAllowed ? "Backlog OK" : "No Backlog"}
                      </span>
                    </div>

                    {/* Bottom row: deadline + actions */}
                    <div
                      className="flex items-center justify-between pt-3"
                      style={{ borderTop: "1px solid #f1f5f9" }}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={daysLeft <= 7 ? "#dc2626" : "#f59e0b"}
                            strokeWidth="2"
                          >
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <span
                            className="text-xs font-medium"
                            style={{
                              color: daysLeft <= 7 ? "#dc2626" : "#475569",
                            }}
                          >
                            {d.deadline}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {daysLeft > 0
                            ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`
                            : "Deadline passed"}
                        </div>
                      </div>

                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {d.eligible ? (
                          applied ? (
                            <span
                              className="text-xs font-semibold px-4 py-2 rounded-xl inline-flex items-center gap-1.5"
                              style={{
                                background: "#dcfce7",
                                color: "#15803d",
                              }}
                            >
                              <svg
                                width="11"
                                height="11"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
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
                          <span
                            className="text-xs font-semibold px-4 py-2 rounded-xl"
                            style={{ background: "#fee2e2", color: "#b91c1c" }}
                          >
                            Not Eligible
                          </span>
                        )}
                        <button className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-slate-100 text-slate-400 hover:text-blue-600">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
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
