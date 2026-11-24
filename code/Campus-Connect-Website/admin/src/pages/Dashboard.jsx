import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getApplications } from "../api/applications";
import { getDrives } from "../api/drives";

const statusColors = {
  Applied: "#4f7ef7",
  Shortlisted: "#10b981",
  Interview: "#0891b2",
  "On Hold": "#f59e0b",
  Rejected: "#ef4444",
  Offer: "#6c63ff",
};

function initials(name = "") {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

function studentName(application) {
  const student = application.student;
  if (!student) return "Unknown student";
  return (
    `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
    student.userId?.name ||
    "Unknown student"
  );
}

function formatDate(value) {
  if (!value) return "No deadline";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function daysUntil(value) {
  if (!value) return null;
  return Math.ceil((new Date(value).getTime() - Date.now()) / 86400000);
}

function Avatar({ name, color = "#4f7ef7" }) {
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {initials(name)}
    </div>
  );
}

function StatIcon({ type }) {
  const paths = {
    students: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    drives: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" />
      </>
    ),
    applications: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M8 13h8M8 17h5" />
      </>
    ),
    offers: (
      <>
        <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
      </>
    ),
    shortlisted: (
      <>
        <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[type]}
    </svg>
  );
}

export default function Dashboard() {
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = () =>
      Promise.all([getDrives(), getApplications()])
      .then(([driveData, applicationData]) => {
        setDrives(Array.isArray(driveData) ? driveData : []);
        setApplications(
          Array.isArray(applicationData)
            ? applicationData.filter(
                (application) => application.student && application.drive,
              )
            : [],
        );
        setError("");
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));

    loadDashboard();
    const refreshTimer = window.setInterval(loadDashboard, 30000);
    return () => window.clearInterval(refreshTimer);
  }, []);

  const activeDrives = drives.filter((drive) => drive.status === "Active");
  const offers = applications.filter(
    (application) => application.status === "Offer",
  );
  const shortlisted = applications.filter(
    (application) => application.status === "Shortlisted",
  );
  const studentCount = useMemo(
    () =>
      new Set(
        applications
          .map((application) => application.student?._id)
          .filter(Boolean),
      ).size,
    [applications],
  );
  const closingSoon = activeDrives.filter((drive) => {
    const days = daysUntil(drive.deadline);
    return days !== null && days >= 0 && days <= 7;
  }).length;
  const recentDrives = [...drives]
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.deadline) -
        new Date(a.createdAt || a.deadline),
    )
    .slice(0, 5);
  const recentApplications = applications.slice(0, 5);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f0f4fb]">
        <div className="rounded-2xl bg-white px-6 py-4 text-sm text-slate-500 shadow-sm">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#f6f8fc] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              Overview
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Good morning, Admin
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Here&apos;s what&apos;s happening across your placement program.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-500 shadow-sm">
            {new Intl.DateTimeFormat("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "short",
            }).format(new Date())}
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
            Unable to load live data: {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            ["Total Students", studentCount, "unique applicants", "#4f7ef7", "students"],
            [
              "Active Drives",
              activeDrives.length,
              `${closingSoon} closing this week`,
              "#f59e0b",
              "drives",
            ],
            [
              "Total Applications",
              applications.length,
              "across all drives",
              "#10b981",
              "applications",
            ],
            [
              "Offers Given",
              offers.length,
              `${shortlisted.length} shortlisted`,
              "#6c63ff",
              "offers",
            ],
            [
              "Shortlisted",
              shortlisted.length,
              "current applications",
              "#ec4899",
              "shortlisted",
            ],
          ].map(([label, value, note, color, icon]) => (
            <div
              key={label}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
            >
              <div
                className="absolute right-0 top-0 h-20 w-20 translate-x-7 -translate-y-7 rounded-full opacity-60"
                style={{ backgroundColor: `${color}12` }}
              />
              <div className="relative flex items-start justify-between">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ color, backgroundColor: `${color}16` }}
                >
                  <StatIcon type={icon} />
                </div>
                <span
                  className="rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide"
                  style={{ color, backgroundColor: `${color}12` }}
                >
                  Live
                </span>
              </div>
              <div className="relative mt-5 text-3xl font-bold tracking-tight text-slate-950">
                {value}
              </div>
              <div className="relative mt-1 text-sm font-semibold text-slate-600">
                {label}
              </div>
              <div className="relative mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                {note}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4.5">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                Recent Placement Drives
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">Latest opportunities</p>
              </div>
              <Link to="/drives" className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50">
                View all
              </Link>
            </div>
            {recentDrives.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-slate-400">
                No placement drives found.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentDrives.map((drive) => {
                  const days = daysUntil(drive.deadline);
                  return (
                    <div
                      key={drive._id || drive.id}
                      className="flex items-center gap-3 px-5 py-3"
                    >
                      <Avatar name={drive.company || "Drive"} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-slate-900">
                          {drive.company}
                        </div>
                        <div className="truncate text-xs text-slate-500">
                          {drive.role}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-semibold text-slate-900">
                          {drive.type || "Full-Time"}
                        </div>
                        <div className="text-xs text-slate-400">
                          {drive.applied || 0} applied
                        </div>
                      </div>
                      <div className="min-w-[82px] text-right">
                        <div
                          className={`text-xs font-semibold ${days !== null && days >= 0 && days <= 7 ? "text-orange-600" : "text-slate-500"}`}
                        >
                          {days !== null && days >= 0 && days <= 7
                            ? `${days}d left`
                            : drive.status || "Active"}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {formatDate(drive.deadline)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4.5">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                Recent Applications
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">Latest candidate activity</p>
              </div>
              <Link
                to="/applications"
                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50"
              >
                View all
              </Link>
            </div>
            {recentApplications.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-slate-400">
                No applications found.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentApplications.map((application) => {
                  const name = studentName(application);
                  const color =
                    statusColors[application.status] || statusColors.Applied;
                  return (
                    <div
                      key={application._id}
                      className="flex items-center gap-3 px-5 py-3"
                    >
                      <Avatar name={name} color={color} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-slate-900">
                          {name}
                        </div>
                        <div className="truncate text-xs text-slate-500">
                          {application.drive?.company || "Unknown drive"}
                        </div>
                      </div>
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={{ color, backgroundColor: `${color}18` }}
                      >
                        {application.status || "Applied"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Placement Overview
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">Performance at a glance</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live data
            </span>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [
                "Active Drive Share",
                drives.length
                  ? `${Math.round((activeDrives.length / drives.length) * 100)}%`
                  : "0%",
                `${activeDrives.length} of ${drives.length} drives active`,
                drives.length ? (activeDrives.length / drives.length) * 100 : 0,
                "#4f7ef7",
              ],
              [
                "Shortlist Rate",
                applications.length
                  ? `${Math.round((shortlisted.length / applications.length) * 100)}%`
                  : "0%",
                `${shortlisted.length} of ${applications.length} applications`,
                applications.length
                  ? (shortlisted.length / applications.length) * 100
                  : 0,
                "#10b981",
              ],
              [
                "Offer Rate",
                applications.length
                  ? `${Math.round((offers.length / applications.length) * 100)}%`
                  : "0%",
                `${offers.length} offers from ${applications.length} applications`,
                applications.length
                  ? (offers.length / applications.length) * 100
                  : 0,
                "#6c63ff",
              ],
              [
                "Internship Drives",
                drives
                  .filter((drive) => drive.type === "Internship")
                  .length.toString(),
                "from the live drive list",
                drives.length
                  ? (drives.filter((drive) => drive.type === "Internship")
                      .length /
                      drives.length) *
                    100
                  : 0,
                "#f59e0b",
              ],
            ].map(([label, value, note, progress, color]) => (
              <div key={label}>
                <div className="mb-1.5 flex items-end justify-between">
                  <span className="text-xs text-slate-500">{label}</span>
                  <strong className="text-sm text-slate-900">{value}</strong>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${progress}%`, backgroundColor: color }}
                  />
                </div>
                <div className="mt-1.5 text-xs text-slate-400">{note}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
