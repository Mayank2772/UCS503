import { useEffect, useMemo, useState } from "react";
import {
  getApplications,
  updateApplicationStatus,
} from "../api/applications";

const rounds = ["Shortlisted", "Interview", "Offer"];

const roundConfig = {
  Shortlisted: { color: "#4f7ef7", bg: "#dbeafe" },
  Interview: { color: "#6c63ff", bg: "#ede9fe" },
  Offer: { color: "#10b981", bg: "#d1fae5" },
};

function studentName(application) {
  const student = application.student;
  if (!student) return "Unknown student";
  return (
    `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
    student.userId?.name ||
    "Unknown student"
  );
}

function hasCompanyAndRole(application) {
  return Boolean(
    application.drive?.company?.trim() && application.drive?.role?.trim(),
  );
}

function Avatar({ name }) {
  const initials =
    name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";
  const colors = ["#4f7ef7", "#6c63ff", "#10b981", "#f59e0b", "#ec4899"];
  const color = colors[name.charCodeAt(0) % colors.length];

  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

function RoundProgress({ current }) {
  const currentIndex = rounds.indexOf(current);

  return (
    <div className="flex items-center gap-0.5" title={current}>
      {rounds.map((round, index) => (
        <div key={round} className="flex items-center gap-0.5">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{
              backgroundColor:
                index <= currentIndex
                  ? roundConfig[round].color
                  : "#e2e8f0",
            }}
          />
          {index < rounds.length - 1 && (
            <div
              className="h-0.5 w-3"
              style={{
                backgroundColor: index < currentIndex ? "#4f7ef7" : "#e2e8f0",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function Shortlisted() {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCompany, setFilterCompany] = useState("All");
  const [filterRound, setFilterRound] = useState("All");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getApplications()
      .then((data) => setApplications(Array.isArray(data) ? data : []))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const shortlistedApplications = useMemo(
    () =>
      applications.filter(
        (application) =>
          (application.status === "Shortlisted" ||
            application.status === "Interview" ||
            application.status === "Offer") &&
          hasCompanyAndRole(application),
      ),
    [applications],
  );

  const companies = useMemo(
    () => [
      "All",
      ...new Set(
        shortlistedApplications
          .map((application) => application.drive?.company)
          .filter(Boolean),
      ),
    ],
    [shortlistedApplications],
  );

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return shortlistedApplications.filter((application) => {
      const name = studentName(application).toLowerCase();
      const student = application.student || {};
      const company = application.drive?.company || "";
      const role = application.drive?.role || "";
      const matchesSearch =
        !query ||
        name.includes(query) ||
        student.rollNumber?.toLowerCase().includes(query) ||
        company.toLowerCase().includes(query) ||
        role.toLowerCase().includes(query);
      const matchesCompany =
        filterCompany === "All" || company === filterCompany;
      const matchesRound =
        filterRound === "All" || application.status === filterRound;

      return matchesSearch && matchesCompany && matchesRound;
    });
  }, [
    filterCompany,
    filterRound,
    search,
    shortlistedApplications,
  ]);

  const handleRoundChange = async (id, status) => {
    setError("");
    setUpdatingId(id);

    try {
      const updated = await updateApplicationStatus(id, status);
      setApplications((current) =>
        current.map((application) =>
          application._id === id ? updated : application,
        ),
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUpdatingId("");
    }
  };

  const stats = [
    {
      label: "Total Shortlisted",
      value: shortlistedApplications.length,
      color: "#4f7ef7",
    },
    {
      label: "Offers Given",
      value: shortlistedApplications.filter(
        (application) => application.status === "Offer",
      ).length,
      color: "#10b981",
    },
    {
      label: "In Process",
      value: shortlistedApplications.filter(
        (application) => application.status !== "Offer",
      ).length,
      color: "#f59e0b",
    },
    {
      label: "Companies",
      value: new Set(
        shortlistedApplications
          .map((application) => application.drive?.company)
          .filter(Boolean),
      ).size,
      color: "#6c63ff",
    },
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f0f4fb]">
        <div className="rounded-2xl bg-white px-6 py-4 text-sm text-slate-500 shadow-sm">
          Loading shortlisted students...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col gap-4 overflow-y-auto bg-[#f0f4fb] p-3 sm:gap-5 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Shortlisted Students
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Track shortlisted candidates across selection rounds
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-3 py-3 shadow-sm sm:gap-4 sm:px-5 sm:py-4"
          >
            <div className="text-2xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-sm font-medium text-slate-500">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {rounds.map((round) => (
          <div
            key={round}
            className="rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm"
          >
            <div
              className="text-xl font-bold"
              style={{ color: roundConfig[round].color }}
            >
              {
                shortlistedApplications.filter(
                  (application) => application.status === round,
                ).length
              }
            </div>
            <div className="mt-1 text-xs font-medium text-slate-500">
              {round}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search student, roll number, company..."
            className="flex-1 bg-transparent text-sm text-slate-900 outline-none"
          />
        </div>
        <div className="hidden flex-wrap gap-2 lg:flex">
          {companies.map((company) => (
            <button
              key={company}
              onClick={() => setFilterCompany(company)}
              className="rounded-xl px-3 py-2 text-xs font-semibold transition-all"
              style={{
                backgroundColor:
                  filterCompany === company ? "#4f7ef7" : "#f1f5f9",
                color: filterCompany === company ? "#fff" : "#64748b",
              }}
            >
              {company}
            </button>
          ))}
        </div>
        <select
          value={filterRound}
          onChange={(event) => setFilterRound(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 outline-none sm:w-auto"
        >
          <option value="All">All rounds</option>
          {rounds.map((round) => (
            <option key={round} value={round}>
              {round}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-3">
          <span className="text-sm font-medium text-slate-500">
            {filtered.length} {filtered.length === 1 ? "student" : "students"}
          </span>
        </div>
        <div className="grid gap-3 p-3 lg:hidden">
          {filtered.map((application) => {
            const student = application.student || {};
            const graduation = student.academicDetails?.graduation || {};
            const name = studentName(application);
            const status = application.status;
            const config = roundConfig[status];

            return (
              <article key={application._id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-start gap-3">
                  <Avatar name={name} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-slate-900">{name}</div>
                    <div className="truncate text-xs text-slate-500">{application.drive?.company || "-"}</div>
                    <div className="text-xs text-slate-400">{student.rollNumber || "-"} · {graduation.branch || "-"}</div>
                  </div>
                  <span className="shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold" style={{ backgroundColor: config.bg, color: config.color }}>
                    {status}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-slate-50 p-2">
                    <div className="text-slate-400">Role</div>
                    <div className="mt-0.5 truncate font-semibold text-slate-700">{application.drive?.role || "-"}</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2">
                    <div className="text-slate-400">CGPA</div>
                    <div className="mt-0.5 font-semibold text-slate-700">{graduation.cgpa || "-"}</div>
                  </div>
                </div>
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <RoundProgress current={status} />
                  <select
                    value={status}
                    disabled={updatingId === application._id}
                    onChange={(event) => handleRoundChange(application._id, event.target.value)}
                    className="mt-3 w-full rounded-lg border border-slate-200 px-2 py-2 text-xs text-slate-600 outline-none disabled:opacity-60"
                  >
                    {rounds.map((round) => <option key={round}>{round}</option>)}
                  </select>
                </div>
              </article>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-slate-400">
              No shortlisted applications found.
            </div>
          )}
        </div>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-245">
            <thead>
              <tr className="bg-slate-50">
                {[
                  "Student",
                  "Roll No.",
                  "Branch",
                  "CGPA",
                  "Company",
                  "Role",
                  "Progress",
                  "Current Round",
                  "Update Round",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((application) => {
                const student = application.student || {};
                const graduation = student.academicDetails?.graduation || {};
                const name = studentName(application);
                const status = application.status;
                const config = roundConfig[status];

                return (
                  <tr
                    key={application._id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={name} />
                        <span className="text-sm font-medium text-slate-900">
                          {name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {student.rollNumber || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {graduation.branch || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                      {graduation.cgpa || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {application.drive?.company || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {application.drive?.role || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <RoundProgress current={status} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={{
                          backgroundColor: config.bg,
                          color: config.color,
                        }}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={status}
                        disabled={updatingId === application._id}
                        onChange={(event) =>
                          handleRoundChange(
                            application._id,
                            event.target.value,
                          )
                        }
                        className="cursor-pointer rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-600 outline-none disabled:cursor-wait disabled:opacity-60"
                      >
                        {rounds.map((round) => (
                          <option key={round}>{round}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-16 text-center text-sm text-slate-400"
                  >
                    No shortlisted applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
