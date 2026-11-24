import { useEffect, useMemo, useState } from "react";
import {
  downloadApplicationsExport,
  getApplications,
  updateApplicationStatus,
} from "../api/applications";
import { fetchStudentResume } from "../api/students";

const statuses = [
  "Applied",
  "Shortlisted",
  "Interview",
  "On Hold",
  "Rejected",
  "Offer",
];
const statusConfig = {
  Applied: { bg: "#dbeafe", text: "#2563eb" },
  Shortlisted: { bg: "#d1fae5", text: "#059669" },
  "On Hold": { bg: "#fef3c7", text: "#d97706" },
  Rejected: { bg: "#fee2e2", text: "#dc2626" },
  Offer: { bg: "#ede9fe", text: "#6c63ff" },
  Interview: { bg: "#cffafe", text: "#0891b2" },
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

function Avatar({ name, size = 40 }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="flex items-center justify-center rounded-xl text-white text-sm font-bold shrink-0"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #4f7ef7, #6c63ff)",
      }}
    >
      {initials || "?"}
    </div>
  );
}

function CompanyAvatar({ company }) {
  return (
    <div
      className="flex items-center justify-center rounded-2xl text-white text-xl font-bold shrink-0"
      style={{
        width: 56,
        height: 56,
        background: "linear-gradient(135deg, #4f7ef7, #6c63ff)",
      }}
    >
      {company.slice(0, 2).toUpperCase()}
    </div>
  );
}

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getApplications()
      .then((applicationData) =>
        setApplications(
          Array.isArray(applicationData)
            ? applicationData.filter(
                (application) => application.student && application.drive,
              )
            : [],
        ),
      )
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const companies = useMemo(() => {
    const companiesByDrive = new Map();
    applications.forEach((application) => {
      const drive = application.drive;
      if (!drive?._id) return;

      const key = String(drive._id);
      const current = companiesByDrive.get(key) || {
        drive,
        applications: [],
      };
      current.applications.push(application);
      companiesByDrive.set(key, current);
    });

    return [...companiesByDrive.values()].filter(({ drive }) => {
        const query = search.toLowerCase().trim();
        return (
          !query ||
          drive.company?.toLowerCase().includes(query) ||
          drive.role?.toLowerCase().includes(query)
        );
      });
  }, [applications, search]);

  const handleStatusChange = async (id, status) => {
    try {
      const updated = await updateApplicationStatus(id, status);
      setApplications((current) =>
        current.map((application) =>
          application._id === id ? updated : application,
        ),
      );
      setSelectedCompany(
        (current) =>
          current && {
            ...current,
            applications: current.applications.map((application) =>
              application._id === id ? updated : application,
            ),
          },
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleViewResume = async (application) => {
    const studentId = application.student?._id;
    if (!studentId) {
      setError("Student profile not found");
      return;
    }

    try {
      const blob = await fetchStudentResume(studentId);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleDownloadExport = async (driveId) => {
    try {
      const blob = await downloadApplicationsExport(driveId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = driveId
        ? `applications-${selectedCompany?.drive?.company || "company"}.xls`
        : "campus-connect-applications.xls";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div
      className="flex flex-col gap-5 p-6 overflow-y-auto h-full"
      style={{ backgroundColor: "#f0f4fb" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>
            Applications
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
            Select a company to view students who applied
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="rounded-xl px-4 py-2 text-sm font-semibold bg-white"
            style={{ color: "#4f7ef7" }}
          >
            {applications.length} total applications
          </div>
          <button
            type="button"
            onClick={() => handleDownloadExport()}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: "#4f7ef7" }}
          >
            Download Excel
          </button>
        </div>
      </div>

      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{ backgroundColor: "#fee2e2", color: "#b91c1c" }}
        >
          {error}
        </div>
      )}

      <div
        className="bg-white rounded-2xl px-5 py-4 flex items-center gap-2"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
      >
        <svg
          width="15"
          height="15"
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
          placeholder="Search company or role..."
          className="flex-1 text-sm outline-none"
          style={{ color: "#0f172a" }}
        />
      </div>

      {loading ? (
        <div
          className="bg-white rounded-2xl p-12 text-center text-sm"
          style={{ color: "#64748b" }}
        >
          Loading applications...
        </div>
      ) : companies.length === 0 ? (
        <div
          className="bg-white rounded-2xl p-12 text-center text-sm"
          style={{ color: "#64748b" }}
        >
          No applications found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {companies.map(({ drive, applications: companyApplications }) => (
            <button
              key={drive._id}
              type="button"
              onClick={() =>
                setSelectedCompany({ drive, applications: companyApplications })
              }
              className="bg-white rounded-2xl p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            >
              <div className="flex items-center gap-3">
                <CompanyAvatar company={drive.company} />
                <div className="min-w-0">
                  <div
                    className="font-bold truncate"
                    style={{ color: "#0f172a" }}
                  >
                    {drive.company}
                  </div>
                  <div
                    className="text-sm truncate"
                    style={{ color: "#64748b" }}
                  >
                    {drive.role}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-5">
                <div
                  className="rounded-xl p-3"
                  style={{ backgroundColor: "#f8fafc" }}
                >
                  <div
                    className="text-2xl font-bold"
                    style={{ color: "#4f7ef7" }}
                  >
                    {companyApplications.length}
                  </div>
                  <div className="text-xs" style={{ color: "#64748b" }}>
                    Students Applied
                  </div>
                </div>
                <div
                  className="rounded-xl p-3"
                  style={{ backgroundColor: "#f8fafc" }}
                >
                  <div
                    className="text-2xl font-bold"
                    style={{ color: "#059669" }}
                  >
                    {
                      companyApplications.filter(
                        (application) => application.status === "Shortlisted",
                      ).length
                    }
                  </div>
                  <div className="text-xs" style={{ color: "#64748b" }}>
                    Shortlisted
                  </div>
                </div>
              </div>
              <div
                className="text-xs font-semibold mt-4"
                style={{ color: "#4f7ef7" }}
              >
                View student details →
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedCompany && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
          style={{ backgroundColor: "rgba(15,23,42,0.48)" }}
        >
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div
              className="flex items-center justify-between px-6 py-5 border-b"
              style={{ borderColor: "#f1f5f9" }}
            >
              <div className="flex items-center gap-3">
                <CompanyAvatar company={selectedCompany.drive.company} />
                <div>
                  <h2
                    className="text-lg font-bold"
                    style={{ color: "#0f172a" }}
                  >
                    {selectedCompany.drive.company}
                  </h2>
                  <p className="text-sm" style={{ color: "#64748b" }}>
                    {selectedCompany.drive.role} ·{" "}
                    {selectedCompany.applications.length} applicants
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDownloadExport(selectedCompany.drive._id)}
                className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Download Excel
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCompany(null);
                  setSelectedApplication(null);
                }}
                className="rounded-lg p-2 hover:bg-slate-100 text-2xl"
                style={{ color: "#64748b" }}
              >
                ×
              </button>
            </div>

            {selectedApplication && (
              <div
                className="px-6 py-5 border-b"
                style={{ borderColor: "#f1f5f9", backgroundColor: "#f8fafc" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                      Applicant profile
                    </p>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                      {studentName(selectedApplication)}
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {selectedApplication.student?.userId?.email || "No email"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedApplication(null)}
                    className="text-xs font-semibold text-slate-500 hover:text-blue-600"
                  >
                    Close details
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  {[
                    ["Roll number", selectedApplication.student?.rollNumber || "-"],
                    [
                      "Branch",
                      selectedApplication.student?.academicDetails?.graduation
                        ?.branch || "-",
                    ],
                    [
                      "CGPA",
                      selectedApplication.student?.academicDetails?.graduation
                        ?.cgpa || "-",
                    ],
                    [
                      "Resume",
                      selectedApplication.resume ||
                        selectedApplication.student?.resume
                        ? "Attached"
                        : "Not uploaded",
                    ],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-white p-3">
                      <p className="text-[10px] uppercase tracking-wide text-slate-400">
                        {label}
                      </p>
                      <p className="text-sm font-semibold text-slate-700 mt-1 truncate">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
                {(selectedApplication.student?.resume ||
                  selectedApplication.resume) && (
                  <button
                    type="button"
                    onClick={() => handleViewResume(selectedApplication)}
                    className="mt-4 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    View applicant resume
                  </button>
                )}

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-2">
                      Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedApplication.student?.skills || []).length > 0 ? (
                        selectedApplication.student.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-700"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">No skills added</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-2">
                      Cover letter
                    </p>
                    <p className="text-xs leading-relaxed text-slate-500 whitespace-pre-wrap">
                      {selectedApplication.coverLetter || "No cover letter provided."}
                    </p>
                  </div>
                </div>

                {(selectedApplication.student?.projects || []).length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-slate-600 mb-2">
                      Projects
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.student.projects.map((project) => (
                        <span
                          key={project._id || project.name}
                          className="rounded-lg bg-white px-3 py-2 text-xs text-slate-600"
                        >
                          {project.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="overflow-auto max-h-[calc(90vh-105px)]">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc" }}>
                    {[
                      "Student",
                      "Email",
                      "Roll No.",
                      "Branch",
                      "CGPA",
                      "Resume",
                      "Applied On",
                      "Status",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 text-left text-xs font-semibold"
                        style={{ color: "#64748b" }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "#f1f5f9" }}>
                  {selectedCompany.applications.map((application) => {
                    const student = application.student || {};
                    const name = studentName(application);
                    const graduation =
                      student.academicDetails?.graduation || {};
                    const status =
                      statusConfig[application.status] || statusConfig.Applied;
                    return (
                      <tr key={application._id}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={name} size={34} />
                            <button
                              type="button"
                              onClick={() => setSelectedApplication(application)}
                              className="text-sm font-semibold hover:text-blue-600"
                              style={{ color: "#0f172a" }}
                            >
                              {name}
                            </button>
                          </div>
                        </td>
                        <td
                          className="px-4 py-3 text-sm"
                          style={{ color: "#64748b" }}
                        >
                          {student.userId?.email || "-"}
                        </td>
                        <td
                          className="px-4 py-3 text-sm"
                          style={{ color: "#334155" }}
                        >
                          {student.rollNumber || "-"}
                        </td>
                        <td
                          className="px-4 py-3 text-sm"
                          style={{ color: "#334155" }}
                        >
                          {graduation.branch || "-"}
                        </td>
                        <td
                          className="px-4 py-3 text-sm font-semibold"
                          style={{ color: "#334155" }}
                        >
                          {graduation.cgpa || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleViewResume(application)}
                            disabled={
                              !application.student?.resume &&
                              !application.resume
                            }
                            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            View resume
                          </button>
                        </td>
                        <td
                          className="px-4 py-3 text-sm"
                          style={{ color: "#64748b" }}
                        >
                          {new Date(
                            application.appliedAt || application.createdAt,
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={application.status}
                            onChange={(event) =>
                              handleStatusChange(
                                application._id,
                                event.target.value,
                              )
                            }
                            className="text-xs rounded-lg px-2 py-1.5 border outline-none"
                            style={{
                              backgroundColor: status.bg,
                              color: status.text,
                              borderColor: status.bg,
                            }}
                          >
                            {statuses.map((option) => (
                              <option key={option}>{option}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
