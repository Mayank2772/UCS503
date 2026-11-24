import { useEffect, useState } from "react";
import { getApplications } from "../api/applications";
import {
  deleteStudent as deleteStudentRequest,
  fetchStudentResume,
  getStudents,
  updateStudent,
} from "../api/students";

function normalizeStudent(student, offer) {
  const graduation = student.academicDetails?.graduation || {};
  const class10 = student.academicDetails?.class10 || {};
  const class12 = student.academicDetails?.class12 || {};
  const user =
    student.userId && typeof student.userId === "object" ? student.userId : {};

  return {
    id: student._id,
    name:
      `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
      user.name ||
      "Unnamed student",
    roll: student.rollNumber || "-",
    branch: graduation.branch || "-",
    batch: graduation.endYear || "-",
    cgpa: graduation.cgpa ?? student.cgpa ?? 0,
    tenth: class10.percentage ?? student.tenthPercentage ?? 0,
    twelfth: class12.percentage ?? student.twelfthPercentage ?? 0,
    backlog: Number(student.activeBacklogs || 0) > 0,
    phone: student.phone || "",
    email: user.email || "",
    placed: Boolean(offer),
    company: offer?.drive?.company || "",
    ctc: offer?.drive?.ctc ? `₹${offer.drive.ctc} LPA` : "",
    hasResume: Boolean(student.resume),
  };
}

function Avatar({ name }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const colors = [
    "#4f7ef7",
    "#6c63ff",
    "#10b981",
    "#f59e0b",
    "#ec4899",
    "#ef4444",
    "#14b8a6",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      className="flex items-center justify-center rounded-full text-white text-xs font-bold shrink-0"
      style={{ width: 34, height: 34, background: color }}
    >
      {initials}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ maxWidth: 580 }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "#f1f5f9" }}
        >
          <h2 className="font-semibold text-base" style={{ color: "#0f172a" }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-gray-100"
            style={{ color: "#64748b" }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function StudentForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({ ...initial });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const field = (label, key, type = "text", placeholder = "") => (
    <div>
      <label
        className="block text-xs font-semibold mb-1.5"
        style={{ color: "#475569" }}
      >
        {label}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl px-3.5 py-2.5 text-sm border outline-none"
        style={{ borderColor: "#e2e8f0", color: "#0f172a" }}
        onFocus={(e) => (e.target.style.borderColor = "#4f7ef7")}
        onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
      />
    </div>
  );
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {field("Full Name", "name", "text", "e.g. Arjun Mehta")}
        {field("Roll Number", "roll", "text", "e.g. CSE/2025/042")}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label
            className="block text-xs font-semibold mb-1.5"
            style={{ color: "#475569" }}
          >
            Branch
          </label>
          <select
            value={form.branch}
            onChange={(e) => set("branch", e.target.value)}
            className="w-full rounded-xl px-3.5 py-2.5 text-sm border outline-none"
            style={{ borderColor: "#e2e8f0", color: "#0f172a" }}
          >
            {["CSE", "ECE", "IT", "EEE", "ME", "CE"].map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>
        {field("Batch Year", "batch", "number", "2025")}
        {field("CGPA", "cgpa", "number", "e.g. 8.5")}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {field("10th %", "tenth", "number", "e.g. 92")}
        {field("12th %", "twelfth", "number", "e.g. 88")}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {field("Phone", "phone", "text", "+91 XXXXX XXXXX")}
        {field("Email", "email", "email", "student@nitr.ac.in")}
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.backlog}
            onChange={(e) => set("backlog", e.target.checked)}
          />
          <span className="text-xs font-semibold" style={{ color: "#475569" }}>
            Has Active Backlog
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.placed}
            onChange={(e) => set("placed", e.target.checked)}
          />
          <span className="text-xs font-semibold" style={{ color: "#475569" }}>
            Placed
          </span>
        </label>
      </div>
      {form.placed && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {field("Company", "company", "text", "e.g. Google")}
          {field("CTC", "ctc", "text", "e.g. ₹32 LPA")}
        </div>
      )}
      <div className="flex gap-3 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 rounded-xl py-2.5 text-sm font-semibold border"
          style={{ borderColor: "#e2e8f0", color: "#64748b" }}
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(form)}
          className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: "#4f7ef7" }}
        >
          Save Student
        </button>
      </div>
    </div>
  );
}

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);

  useEffect(() => {
    const loadStudents = () => {
      getStudents()
        .then((studentData) => {
          setStudents(studentData.map((student) => normalizeStudent(student)));
          setLoadError("");
        })
        .catch((error) => setLoadError(error.message));

      getApplications()
        .then((applicationData) => {
          const offersByStudent = new Map(
            applicationData
              .filter((application) => application.status === "Offer")
              .map((application) => [
                String(application.student?._id || application.student),
                application,
              ]),
          );

          setStudents((currentStudents) =>
            currentStudents.map((student) =>
              (() => {
                const offer = offersByStudent.get(String(student.id));
                return {
                  ...student,
                  placed: Boolean(offer),
                  company: offer?.drive?.company || "",
                  ctc: offer?.drive?.ctc ? `₹${offer.drive.ctc} LPA` : "",
                };
              })(),
            ),
          );
        })
        .catch((error) => {
          console.warn("Unable to load placement data:", error.message);
        });
    };

    loadStudents();
    const refreshTimer = window.setInterval(loadStudents, 15000);

    return () => window.clearInterval(refreshTimer);
  }, []);

  const filtered = students.filter((s) => {
    const query = search.toLowerCase();
    return (
      !query ||
      s.name.toLowerCase().includes(query) ||
      s.roll.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query)
    );
  });

  const handleSave = async (form) => {
    if (!modal?.student) return;

    try {
      const [firstName, ...lastNameParts] = form.name.trim().split(/\s+/);
      const response = await updateStudent(modal.student.id, {
        firstName,
        lastName: lastNameParts.join(" ") || firstName,
        phone: form.phone,
        rollNumber: form.roll,
        activeBacklogs: form.backlog ? 1 : 0,
        academicDetails: {
          graduation: {
            branch: form.branch,
            endYear: Number(form.batch) || 0,
            cgpa: Number(form.cgpa) || 0,
          },
          class10: { percentage: Number(form.tenth) || 0 },
          class12: { percentage: Number(form.twelfth) || 0 },
        },
      });

      setStudents((prev) =>
        prev.map((student) =>
          student.id === modal.student.id
            ? normalizeStudent(response.student, {
                drive: {
                  company: student.company,
                  ctc: student.ctc.replace(/[^\d.]/g, ""),
                },
              })
            : student,
        ),
      );
      setModal(null);
    } catch (error) {
      setLoadError(error.message);
    }
  };

  const handleDelete = () => {
    if (!modal?.student) return;

    deleteStudentRequest(modal.student.id)
      .then(() => {
        setStudents((prev) =>
          prev.filter((student) => student.id !== modal.student.id),
        );
        setModal(null);
      })
      .catch((error) => setLoadError(error.message));
  };

  const handleViewResume = async (student) => {
    try {
      const blob = await fetchStudentResume(student.id);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      setLoadError(error.message);
    }
  };

  return (
    <div
      className="flex min-h-full flex-col gap-4 overflow-y-auto p-3 sm:gap-5 sm:p-6"
      style={{ backgroundColor: "#f0f4fb" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>
            Students
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
            Manage registered students
          </p>
          {loadError && (
            <p className="mt-2 text-xs font-medium text-red-600">{loadError}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {[
          { label: "Total Students", value: students.length, color: "#4f7ef7" },
          {
            label: "Placed",
            value: students.filter((s) => s.placed).length,
            color: "#10b981",
          },
          {
            label: "Unplaced",
            value: students.filter((s) => !s.placed).length,
            color: "#f59e0b",
          },
          {
            label: "With Backlog",
            value: students.filter((s) => s.backlog).length,
            color: "#ef4444",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl px-3 py-3 sm:px-5 sm:py-4 flex items-center gap-3 sm:gap-4"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          >
            <div className="text-2xl font-bold" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-sm font-medium" style={{ color: "#64748b" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        className="bg-white rounded-2xl px-5 py-4 flex items-center gap-3 flex-wrap"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
      >
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 border flex-1"
          style={{ borderColor: "#e2e8f0" }}
        >
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, roll number, email..."
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: "#0f172a" }}
          />
        </div>
      </div>

      {/* Table */}
      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
      >
        <div className="px-5 py-3 border-b" style={{ borderColor: "#f1f5f9" }}>
          <span className="text-sm font-medium" style={{ color: "#64748b" }}>
            {filtered.length} students
          </span>
        </div>
        <div className="grid gap-3 p-3 lg:hidden">
          {filtered.map((s) => (
            <article key={s.id} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-start gap-3">
                <Avatar name={s.name} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-900">{s.name}</div>
                  <div className="truncate text-xs text-slate-500">{s.email}</div>
                  <div className="text-xs text-slate-400">{s.roll} · {s.branch}</div>
                </div>
                <span
                  className="shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold"
                  style={{
                    backgroundColor: s.placed ? "#ede9fe" : "#fef3c7",
                    color: s.placed ? "#6c63ff" : "#d97706",
                  }}
                >
                  {s.placed ? "Placed" : "Unplaced"}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-slate-50 p-2">
                  <div className="text-slate-400">CGPA</div>
                  <div className="mt-0.5 font-semibold text-slate-700">{s.cgpa}</div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <div className="text-slate-400">Backlog</div>
                  <div className="mt-0.5 font-semibold text-slate-700">{s.backlog ? "Yes" : "No"}</div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <div className="text-slate-400">10th / 12th</div>
                  <div className="mt-0.5 font-semibold text-slate-700">{s.tenth}% / {s.twelfth}%</div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <div className="text-slate-400">Placement</div>
                  <div className="mt-0.5 truncate font-semibold text-slate-700">{s.placed ? `${s.company} · ${s.ctc}` : "Not placed"}</div>
                </div>
              </div>
              <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                <button
                  onClick={() => handleViewResume(s)}
                  disabled={!s.hasResume}
                  className="flex-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 disabled:opacity-40"
                >
                  Resume
                </button>
                <button
                  onClick={() => setModal({ type: "edit", student: s })}
                  className="flex-1 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => setModal({ type: "delete", student: s })}
                  className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-slate-400">
              No students found matching your search.
            </div>
          )}
        </div>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                {[
                  "Student",
                  "Roll No.",
                  "Branch",
                  "CGPA",
                  "10th",
                  "12th",
                  "Backlog",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold"
                    style={{ color: "#64748b" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "#f1f5f9" }}>
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={s.name} />
                      <div>
                        <div
                          className="text-sm font-medium"
                          style={{ color: "#0f172a" }}
                        >
                          {s.name}
                        </div>
                        <div className="text-xs" style={{ color: "#94a3b8" }}>
                          {s.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: "#64748b" }}
                  >
                    {s.roll}
                  </td>
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: "#334155" }}
                  >
                    {s.branch}
                  </td>
                  <td
                    className="px-4 py-3 text-sm font-semibold"
                    style={{ color: "#0f172a" }}
                  >
                    {s.cgpa}
                  </td>
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: "#334155" }}
                  >
                    {s.tenth}%
                  </td>
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: "#334155" }}
                  >
                    {s.twelfth}%
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: s.backlog ? "#fee2e2" : "#d1fae5",
                        color: s.backlog ? "#dc2626" : "#059669",
                      }}
                    >
                      {s.backlog ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {s.placed ? (
                      <div>
                        <span
                          className="text-xs font-semibold px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: "#ede9fe",
                            color: "#6c63ff",
                          }}
                        >
                          Placed
                        </span>
                        <div
                          className="text-xs mt-1"
                          style={{ color: "#94a3b8" }}
                        >
                          {s.company} · {s.ctc}
                        </div>
                      </div>
                    ) : (
                      <span
                        className="text-xs font-semibold px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: "#fef3c7",
                          color: "#d97706",
                        }}
                      >
                        Unplaced
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleViewResume(s)}
                        disabled={!s.hasResume}
                        title={s.hasResume ? "View resume" : "No resume uploaded"}
                        className="p-1.5 rounded-lg hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ color: "#2563eb" }}
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="8" y1="13" x2="16" y2="13" />
                          <line x1="8" y1="17" x2="16" y2="17" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setModal({ type: "edit", student: s })}
                        title="Edit"
                        className="p-1.5 rounded-lg hover:bg-yellow-50"
                        style={{ color: "#f59e0b" }}
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setModal({ type: "delete", student: s })}
                        title="Delete"
                        className="p-1.5 rounded-lg hover:bg-red-50"
                        style={{ color: "#ef4444" }}
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-16 text-center text-sm"
                    style={{ color: "#94a3b8" }}
                  >
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal?.type === "edit" && modal.student && (
        <Modal title="Edit Student" onClose={() => setModal(null)}>
          <StudentForm
            initial={modal.student}
            onSave={handleSave}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
      {modal?.type === "delete" && modal.student && (
        <Modal title="Delete Student" onClose={() => setModal(null)}>
          <div className="flex flex-col items-center gap-4 py-2">
            <div
              className="rounded-full flex items-center justify-center"
              style={{ width: 52, height: 52, backgroundColor: "#fee2e2" }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
            </div>
            <div className="text-center">
              <div className="font-semibold" style={{ color: "#0f172a" }}>
                Delete Student
              </div>
              <div className="text-sm mt-1" style={{ color: "#64748b" }}>
                Remove <strong>{modal.student.name}</strong> (
                {modal.student.roll}) from the system?
              </div>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setModal(null)}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold border"
                style={{ borderColor: "#e2e8f0", color: "#64748b" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white"
                style={{ backgroundColor: "#ef4444" }}
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
