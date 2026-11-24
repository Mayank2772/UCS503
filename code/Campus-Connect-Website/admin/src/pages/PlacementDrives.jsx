import { useEffect, useState } from "react";
import {
  createDrive,
  deleteDrive as deleteDriveRequest,
  getDrives,
  updateDrive,
} from "../api/drives";

const getDriveId = (drive) => drive?._id ?? drive?.id;

const typeStyle = {
  "Full-Time": { bg: "#dbeafe", text: "#1d4ed8" },
  Internship: { bg: "#fef3c7", text: "#b45309" },
  PPO: { bg: "#ede9fe", text: "#7c3aed" },
};

const statusStyle = {
  Active: { bg: "#d1fae5", text: "#059669" },
  Closed: { bg: "#f1f5f9", text: "#64748b" },
};

const EMPTY = {
  company: "",
  role: "",
  type: "Full-Time",
  ctc: "",
  ctcRange: "",
  location: "",
  mode: "On-Campus",
  openings: "",
  cgpa: "",
  backlog: false,
  deadline: "",
  status: "Active",
  branches: ["CSE"],
  description: "",
};

function formatDeadline(value) {
  if (!value) return "-";
  const datePart = String(value).slice(0, 10);
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) return value;

  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Avatar({ name, size = 36 }) {
  const initials = name ? name.slice(0, 2).toUpperCase() : "??";
  const colors = [
    "#4f7ef7",
    "#6c63ff",
    "#10b981",
    "#f59e0b",
    "#ec4899",
    "#ef4444",
    "#14b8a6",
  ];
  const color = name ? colors[name.charCodeAt(0) % colors.length] : "#4f7ef7";
  return (
    <div
      className="flex items-center justify-center rounded-xl text-white text-sm font-bold shrink-0"
      style={{ width: size, height: size, background: color }}
    >
      {initials}
    </div>
  );
}

function Modal({ title, onClose, error, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ maxWidth: 620 }}
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
            className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
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
        <div className="px-6 py-5">
          {error && (
            <div
              className="mb-4 rounded-xl px-4 py-3 text-sm"
              style={{ backgroundColor: "#fee2e2", color: "#b91c1c" }}
              role="alert"
            >
              {error}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

function DriveForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({ ...initial });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleBranch = (b) =>
    set(
      "branches",
      form.branches.includes(b)
        ? form.branches.filter((x) => x !== b)
        : [...form.branches, b],
    );
  const allBranches = ["CSE", "ECE", "IT", "EEE", "ME", "CE"];

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
        className="w-full rounded-xl px-3.5 py-2.5 text-sm border outline-none transition-all"
        style={{ borderColor: "#e2e8f0", color: "#0f172a" }}
        onFocus={(e) => (e.target.style.borderColor = "#4f7ef7")}
        onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {field("Company Name", "company", "text", "e.g. Google")}
        {field("Job Role", "role", "text", "e.g. Software Engineer")}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label
            className="block text-xs font-semibold mb-1.5"
            style={{ color: "#475569" }}
          >
            Drive Type
          </label>
          <select
            value={form.type}
            onChange={(e) => set("type", e.target.value)}
            className="w-full rounded-xl px-3.5 py-2.5 text-sm border outline-none"
            style={{ borderColor: "#e2e8f0", color: "#0f172a" }}
          >
            <option>Full-Time</option>
            <option>Internship</option>
            <option>PPO</option>
          </select>
        </div>
        <div>
          <label
            className="block text-xs font-semibold mb-1.5"
            style={{ color: "#475569" }}
          >
            Status
          </label>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            className="w-full rounded-xl px-3.5 py-2.5 text-sm border outline-none"
            style={{ borderColor: "#e2e8f0", color: "#0f172a" }}
          >
            <option>Active</option>
            <option>Closed</option>
          </select>
        </div>
        <div>
          <label
            className="block text-xs font-semibold mb-1.5"
            style={{ color: "#475569" }}
          >
            Mode
          </label>
          <select
            value={form.mode}
            onChange={(e) => set("mode", e.target.value)}
            className="w-full rounded-xl px-3.5 py-2.5 text-sm border outline-none"
            style={{ borderColor: "#e2e8f0", color: "#0f172a" }}
          >
            <option>On-Campus</option>
            <option>Off-Campus</option>
            <option>Virtual</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {field("CTC (LPA)", "ctc", "number", "e.g. 32")}
        {field("CTC Range", "ctcRange", "text", "e.g. 32-42")}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {field("Location", "location", "text", "e.g. Bangalore")}
        {field("Openings", "openings", "number", "e.g. 12")}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {field("Min CGPA", "cgpa", "number", "e.g. 7.5")}
        {field("Application Deadline", "deadline", "date")}
      </div>
      <div>
        <label
          className="block text-xs font-semibold mb-2"
          style={{ color: "#475569" }}
        >
          Eligible Branches
        </label>
        <div className="flex flex-wrap gap-2">
          {allBranches.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => toggleBranch(b)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                backgroundColor: form.branches.includes(b)
                  ? "#4f7ef7"
                  : "#f1f5f9",
                color: form.branches.includes(b) ? "#fff" : "#64748b",
              }}
            >
              {b}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!form.backlog}
            onChange={(e) => set("backlog", !e.target.checked)}
            className="rounded"
          />
          <span className="text-xs font-semibold" style={{ color: "#475569" }}>
            No Active Backlog Required
          </span>
        </label>
      </div>
      <div>
        <label
          className="block text-xs font-semibold mb-1.5"
          style={{ color: "#475569" }}
        >
          Job Description
        </label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Describe the role..."
          className="w-full rounded-xl px-3.5 py-2.5 text-sm border outline-none resize-none"
          style={{ borderColor: "#e2e8f0", color: "#0f172a" }}
          onFocus={(e) => (e.target.style.borderColor = "#4f7ef7")}
          onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
        />
      </div>
      <div className="flex gap-3 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 rounded-xl py-2.5 text-sm font-semibold border transition-all"
          style={{ borderColor: "#e2e8f0", color: "#64748b" }}
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(form)}
          className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-all"
          style={{ backgroundColor: "#4f7ef7" }}
        >
          Save Drive
        </button>
      </div>
    </div>
  );
}

function DeleteConfirm({ drive, onConfirm, onCancel }) {
  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div
        className="rounded-full flex items-center justify-center"
        style={{ width: 56, height: 56, backgroundColor: "#fee2e2" }}
      >
        <svg
          width="24"
          height="24"
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
          <path d="M9 6V4h6v2" />
        </svg>
      </div>
      <div className="text-center">
        <div className="font-semibold" style={{ color: "#0f172a" }}>
          Delete Placement Drive
        </div>
        <div className="text-sm mt-1" style={{ color: "#64748b" }}>
          Are you sure you want to delete{" "}
          <strong>
            {drive.company} — {drive.role}
          </strong>
          ? This action cannot be undone.
        </div>
      </div>
      <div className="flex gap-3 w-full pt-1">
        <button
          onClick={onCancel}
          className="flex-1 rounded-xl py-2.5 text-sm font-semibold border"
          style={{ borderColor: "#e2e8f0", color: "#64748b" }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: "#ef4444" }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function PlacementDrives() {
  const [drives, setDrives] = useState([]);
  const [pageError, setPageError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [modal, setModal] = useState(null); // { type: "add"|"edit"|"delete"|"view", drive }
  useEffect(() => {
    getDrives()
      .then(setDrives)
      .catch((error) => setPageError(error.message));
  }, []);

  const closeModal = () => {
    setModal(null);
    setSaveError("");
  };

  const filtered = drives.filter((d) => {
    const query = search.trim().toLowerCase();
    const matchSearch =
      !query ||
      [d.company, d.role, d.location, d.type, d.status, d.ctc]
        .filter((value) => value !== null && value !== undefined)
        .some((value) => String(value).toLowerCase().includes(query));
    const matchesFilter =
      activeFilter === "All" ||
      d.type === activeFilter ||
      d.status === activeFilter;
    return matchSearch && matchesFilter;
  });

  const handleSave = async (form) => {
    if (!modal) return;
    setSaveError("");

    const normalizedCompany = String(form.company || "").trim().toLowerCase();
    const editingDriveId = modal.type === "edit" ? getDriveId(modal.drive) : null;
    const duplicateCompany = drives.some(
      (drive) =>
        getDriveId(drive) !== editingDriveId &&
        String(drive.company || "").trim().toLowerCase() === normalizedCompany,
    );
    if (duplicateCompany) {
      setSaveError("A placement drive for this company already exists.");
      return;
    }

    const requiredFields = [
      ["company", "Company name"],
      ["role", "Job role"],
      ["location", "Location"],
      ["ctc", "CTC"],
      ["deadline", "Application deadline"],
    ];
    const missingField = requiredFields.find(
      ([key]) => !String(form[key] ?? "").trim(),
    );

    if (missingField) {
      setSaveError(`${missingField[1]} is required.`);
      return;
    }

    const payload = {
      ...form,
      openings: form.openings === "" ? 1 : Number(form.openings),
      cgpa: form.cgpa === "" ? 0 : Number(form.cgpa),
      branches: form.branches.filter(Boolean),
    };

    if (
      !Number.isFinite(payload.openings) ||
      payload.openings < 1 ||
      !Number.isFinite(payload.cgpa) ||
      payload.cgpa < 0 ||
      payload.cgpa > 10
    ) {
      setSaveError("Openings must be at least 1 and CGPA must be between 0 and 10.");
      return;
    }

    try {
      if (modal.type === "add") {
        const response = await createDrive({ ...payload, applied: 0 });
        setDrives((prev) => [...prev, response.drive]);
      } else {
        const driveId = getDriveId(modal.drive);
        const response = await updateDrive(
          driveId,
          payload,
        );
        setDrives((prev) =>
          prev.map((d) =>
            getDriveId(d) === driveId
              ? response.drive
              : d,
          ),
        );
      }
      closeModal();
    } catch (error) {
      setSaveError(error.message);
    }
  };

  const handleDelete = async () => {
    if (!modal?.drive) return;
    const driveId = getDriveId(modal.drive);
    try {
      await deleteDriveRequest(driveId);
      setDrives((prev) => prev.filter((d) => getDriveId(d) !== driveId));
      closeModal();
    } catch (error) {
      setSaveError(error.message);
    }
  };

  const stats = [
    { label: "Total Drives", value: drives.length, color: "#4f7ef7" },
    {
      label: "Active",
      value: drives.filter((d) => d.status === "Active").length,
      color: "#10b981",
    },
    {
      label: "Closed",
      value: drives.filter((d) => d.status === "Closed").length,
      color: "#64748b",
    },
    {
      label: "Total Applied",
      value: drives.reduce((s, d) => s + d.applied, 0).toLocaleString(),
      color: "#6c63ff",
    },
  ];

  return (
    <div
      className="flex min-h-full flex-col gap-5 overflow-y-auto p-3 sm:gap-5 sm:p-6"
      style={{ backgroundColor: "#f0f4fb" }}
    >
      {/* Header */}
      {pageError && !modal && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{ backgroundColor: "#fee2e2", color: "#b91c1c" }}
        >
          {pageError}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>
            Placement Drives
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
            Manage and track all placement drives
          </p>
        </div>
        <button
          onClick={() => {
            setSaveError("");
            setModal({ type: "add", drive: EMPTY });
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ backgroundColor: "#4f7ef7" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Drive
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl px-5 py-4 flex items-center gap-4"
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
        className="bg-white rounded-2xl px-3 py-3 sm:px-5 sm:py-4 flex items-center gap-3"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
      >
        <div
          className="flex min-w-0 items-center gap-2 flex-1 rounded-xl px-3 py-2.5 border"
          style={{ borderColor: "#e2e8f0" }}
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company, role, location..."
            className="min-w-0 flex-1 text-sm outline-none bg-transparent"
            style={{ color: "#0f172a" }}
          />
        </div>
        <div className="hidden gap-2 lg:flex">
          {["All", "Full-Time", "Internship", "PPO", "Active", "Closed"].map(
            (filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  backgroundColor:
                    activeFilter === filter ? "#4f7ef7" : "#f1f5f9",
                  color: activeFilter === filter ? "#fff" : "#64748b",
                }}
              >
                {filter}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Table */}
      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
      >
        <div className="px-5 py-3 border-b" style={{ borderColor: "#f1f5f9" }}>
          <span className="text-sm font-medium" style={{ color: "#64748b" }}>
            {filtered.length} drives found
          </span>
        </div>
        <div className="grid gap-3 p-3 lg:hidden">
          {filtered.map((d) => (
            <article
              key={d.id}
              className="rounded-xl border border-slate-200 bg-white p-3"
            >
              <div className="flex items-start gap-3">
                <Avatar name={d.company} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-900">
                    {d.company}
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {d.role}
                  </div>
                  <div className="text-xs text-slate-400">
                    {d.location} · {d.mode}
                  </div>
                </div>
                <span
                  className="shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold"
                  style={{
                    backgroundColor: statusStyle[d.status].bg,
                    color: statusStyle[d.status].text,
                  }}
                >
                  {d.status}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-slate-50 p-2">
                  <div className="text-slate-400">Type</div>
                  <div className="mt-0.5 font-semibold text-slate-700">
                    {d.type}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <div className="text-slate-400">CTC</div>
                  <div className="mt-0.5 font-semibold text-blue-600">
                    ₹{d.ctc} LPA
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <div className="text-slate-400">Deadline</div>
                  <div className="mt-0.5 font-semibold text-slate-700">
                    {formatDeadline(d.deadline)}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <div className="text-slate-400">Applied</div>
                  <div className="mt-0.5 font-semibold text-slate-700">
                    {d.applied}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                <button
                  onClick={() => setModal({ type: "view", drive: d })}
                  className="flex-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600"
                >
                  View
                </button>
                <button
                  onClick={() => setModal({ type: "edit", drive: d })}
                  className="flex-1 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => setModal({ type: "delete", drive: d })}
                  className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-slate-400">
              No drives found matching your filters.
            </div>
          )}
        </div>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                {[
                  "Company",
                  "Role",
                  "Type",
                  "CTC",
                  "Openings",
                  "CGPA",
                  "Deadline",
                  "Applied",
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
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={d.company} size={32} />
                      <div>
                        <div
                          className="text-sm font-semibold"
                          style={{ color: "#0f172a" }}
                        >
                          {d.company}
                        </div>
                        <div className="text-xs" style={{ color: "#94a3b8" }}>
                          {d.location}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm" style={{ color: "#334155" }}>
                      {d.role}
                    </div>
                    <div className="text-xs" style={{ color: "#94a3b8" }}>
                      {d.mode}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: (
                          typeStyle[d.type] || typeStyle["Full-Time"]
                        ).bg,
                        color: (typeStyle[d.type] || typeStyle["Full-Time"])
                          .text,
                      }}
                    >
                      {d.type}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 text-sm font-semibold"
                    style={{ color: "#4f7ef7" }}
                  >
                    ₹{d.ctc} LPA
                  </td>
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: "#334155" }}
                  >
                    {d.openings} seats
                  </td>
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: "#334155" }}
                  >
                    ≥ {d.cgpa}
                  </td>
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: "#334155" }}
                  >
                    {formatDeadline(d.deadline)}
                  </td>
                  <td
                    className="px-4 py-3 text-sm font-medium"
                    style={{ color: "#334155" }}
                  >
                    {d.applied}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: statusStyle[d.status].bg,
                        color: statusStyle[d.status].text,
                      }}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setModal({ type: "view", drive: d })}
                        title="View"
                        className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                        style={{ color: "#4f7ef7" }}
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setModal({ type: "edit", drive: d })}
                        title="Edit"
                        className="p-1.5 rounded-lg hover:bg-yellow-50 transition-colors"
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
                        onClick={() => setModal({ type: "delete", drive: d })}
                        title="Delete"
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
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
                    colSpan={10}
                    className="px-4 py-16 text-center text-sm"
                    style={{ color: "#94a3b8" }}
                  >
                    No drives found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {modal?.type === "add" && (
        <Modal
          title="Add New Placement Drive"
          error={saveError}
          onClose={closeModal}
        >
          <DriveForm
            initial={EMPTY}
            onSave={handleSave}
            onCancel={closeModal}
          />
        </Modal>
      )}
      {modal?.type === "edit" && modal.drive && (
        <Modal
          title="Edit Placement Drive"
          error={saveError}
          onClose={closeModal}
        >
          <DriveForm
            initial={modal.drive}
            onSave={handleSave}
            onCancel={closeModal}
          />
        </Modal>
      )}
      {modal?.type === "delete" && modal.drive && (
        <Modal
          title="Confirm Delete"
          error={saveError}
          onClose={closeModal}
        >
          <DeleteConfirm
            drive={modal.drive}
            onConfirm={handleDelete}
            onCancel={closeModal}
          />
        </Modal>
      )}
      {modal?.type === "view" && modal.drive && (
        <Modal title="Drive Details" onClose={closeModal}>
          <div className="flex flex-col gap-4">
            <div
              className="flex items-start gap-4 pb-4 border-b"
              style={{ borderColor: "#f1f5f9" }}
            >
              <Avatar name={modal.drive.company} size={48} />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="font-bold text-lg"
                    style={{ color: "#0f172a" }}
                  >
                    {modal.drive.company}
                  </span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: (
                        typeStyle[modal.drive.type] || typeStyle["Full-Time"]
                      ).bg,
                      color: (
                        typeStyle[modal.drive.type] || typeStyle["Full-Time"]
                      ).text,
                    }}
                  >
                    {modal.drive.type}
                  </span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: statusStyle[modal.drive.status].bg,
                      color: statusStyle[modal.drive.status].text,
                    }}
                  >
                    {modal.drive.status}
                  </span>
                </div>
                <div className="text-sm mt-0.5" style={{ color: "#334155" }}>
                  {modal.drive.role}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                  {modal.drive.location} • {modal.drive.mode}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold" style={{ color: "#4f7ef7" }}>
                  ₹{modal.drive.ctc} LPA
                </div>
                <div className="text-xs" style={{ color: "#94a3b8" }}>
                  Range: ₹{modal.drive.ctcRange} LPA
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { label: "Openings", value: `${modal.drive.openings} seats` },
                { label: "Applications", value: modal.drive.applied },
                { label: "Min CGPA", value: `≥ ${modal.drive.cgpa}` },
                {
                  label: "Active Backlog",
                  value: modal.drive.backlog ? "Allowed" : "Not Allowed",
                },
                {
                  label: "Deadline",
                  value: formatDeadline(modal.drive.deadline),
                },
                {
                  label: "Eligible Branches",
                  value: modal.drive.branches?.join(", ") || "—",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl p-3"
                  style={{ backgroundColor: "#f8fafc" }}
                >
                  <div className="text-xs" style={{ color: "#94a3b8" }}>
                    {item.label}
                  </div>
                  <div
                    className="text-sm font-semibold mt-0.5"
                    style={{ color: "#0f172a" }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
            {modal.drive.description && (
              <div>
                <div
                  className="text-xs font-semibold mb-1.5"
                  style={{ color: "#475569" }}
                >
                  Job Description
                </div>
                <div
                  className="text-sm leading-relaxed"
                  style={{ color: "#334155" }}
                >
                  {modal.drive.description}
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setModal({ type: "edit", drive: modal.drive })}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white"
                style={{ backgroundColor: "#4f7ef7" }}
              >
                Edit Drive
              </button>
              <button
                onClick={closeModal}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold border"
                style={{ borderColor: "#e2e8f0", color: "#64748b" }}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
