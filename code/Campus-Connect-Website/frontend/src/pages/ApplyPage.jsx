import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import { uploadResume } from "../api/student";

const STEPS = [
  "Personal Info",
  "Academic Details",
  "Documents",
  "Review & Submit",
];

export default function ApplyPage({ drives, onApply, user }) {
  const { driveId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [confirmationId, setConfirmationId] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [resumeUploaded, setResumeUploaded] = useState(Boolean(user?.resume));
  const [resumeName, setResumeName] = useState(
    user?.resumeName || "Resume from your profile",
  );
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const resumeInputRef = useRef(null);
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || user?.userId?.email || "",
    phone: user?.phone || "",
    rollNumber: user?.rollNumber || "",
    branch: user?.academicDetails?.graduation?.branch || "",
    semester: user?.semester || "",
    cgpa: String(user?.academicDetails?.graduation?.cgpa || ""),
    tenthPercent: String(user?.academicDetails?.class10?.percentage || ""),
    twelfthPercent: String(user?.academicDetails?.class12?.percentage || ""),
    backlogs: String(user?.activeBacklogs ?? ""),
    coverLetter: "",
    referral: "",
    linkedin: user?.linkedin || "",
    github: user?.github || "",
    portfolio: user?.portfolio || "",
    declaration: false,
  });

  const sourceDrive = drives.find((dr) => String(dr.id || dr._id) === driveId);
  const d = sourceDrive
    ? {
        ...sourceDrive,
        id: sourceDrive.id || sourceDrive._id,
        logo:
          sourceDrive.logo || sourceDrive.company?.slice(0, 2).toUpperCase(),
        logoColor: sourceDrive.logoColor || "#2563eb",
        tag: sourceDrive.tag || sourceDrive.type || "Placement",
        tagColor: sourceDrive.tagColor || "#2563eb",
        deadlineDate: new Date(
          sourceDrive.deadlineDate || sourceDrive.deadline,
        ),
      }
    : null;
  if (!d) return null;

  const set = (key, value) => {
    setValidationError("");
    setSubmitError("");
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const normalizeBranch = (branch) => {
    const normalized = String(branch || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const aliases = {
      cse: "computerscienceengineering",
      cs: "computerscienceengineering",
      ece: "electronicscommunication",
      it: "informationtechnology",
      ee: "electricalengineering",
      me: "mechanicalengineering",
      ce: "civilengineering",
    };
    return aliases[normalized] || normalized;
  };

  const validateEligibility = () => {
    const minimumCGPA = Number(
      d.minimumCGPA ?? d.cgpaCutoff ?? d.cgpa ?? 0,
    );
    const maximumBacklogs = Number(
      d.maximumBacklogs ?? (d.backlogAllowed ? 1 : 0),
    );
    const eligibleBranches =
      d.eligibleBranches?.length
        ? d.eligibleBranches
        : d.allowedBranches?.length
          ? d.allowedBranches
          : d.branches || [];

    if (Number(form.cgpa) < minimumCGPA) {
      return `You are not eligible: minimum CGPA required is ${minimumCGPA}`;
    }

    if (Number(form.backlogs) > maximumBacklogs) {
      return `You are not eligible: maximum allowed backlogs are ${maximumBacklogs}`;
    }

    if (
      eligibleBranches.length > 0 &&
      !eligibleBranches
        .map(normalizeBranch)
        .includes(normalizeBranch(form.branch))
    ) {
      return "You are not eligible for this drive because your branch is not eligible.";
    }

    return "";
  };

  const validateStep = (stepToValidate) => {
    const requiredByStep = [
      [
        "firstName",
        "lastName",
        "email",
        "phone",
        "rollNumber",
        "linkedin",
        "github",
      ],
      ["branch", "semester", "cgpa", "tenthPercent", "twelfthPercent", "backlogs"],
      ["coverLetter"],
      ["declaration"],
    ];
    const missing = requiredByStep[stepToValidate].filter((field) => {
      if (field === "declaration") return !form.declaration;
      return !String(form[field] ?? "").trim();
    });

    if (stepToValidate === 2 && !resumeUploaded) {
      missing.push("resume");
    }

    if (missing.length > 0) {
      setValidationError(
        stepToValidate === 2 && !resumeUploaded
          ? "Please upload your resume and complete all required fields."
          : "Please complete all required fields before continuing.",
      );
      return false;
    }

    if (stepToValidate === 1) {
      const eligibilityError = validateEligibility();
      if (eligibilityError) {
        setValidationError(eligibilityError);
        return false;
      }
    }

    setValidationError("");
    return true;
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setResumeError("");
    setResumeUploading(true);

    try {
      const response = await uploadResume(file);
      const updatedUser = {
        ...user,
        resume: response.resume.id,
        resumeName: response.resume.fileName,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setResumeName(response.resume.fileName);
      setResumeUploaded(true);
    } catch (error) {
      setResumeError(error.message || "Failed to upload resume.");
    } finally {
      setResumeUploading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitError("");
    if (![0, 1, 2, 3].every((stepToValidate) => validateStep(stepToValidate))) {
      return;
    }
    const payload = {
      driveId,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      rollNumber: form.rollNumber,
      branch: form.branch,
      semester: form.semester,
      cgpa: form.cgpa,
      tenthPercent: form.tenthPercent,
      twelfthPercent: form.twelfthPercent,
      backlogs: form.backlogs,
      coverLetter: form.coverLetter,
      referral: form.referral,
      linkedin: form.linkedin,
      github: form.github,
      portfolio: form.portfolio,
      declaration: form.declaration,
    };
    try {
      const response = await onApply(driveId, payload);
      setConfirmationId(response.application.applicationId);
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error.message);
    }
  };

  if (submitted) {
    return (
      <div
        className="flex h-screen overflow-hidden"
        style={{ background: "#f0f6ff" }}
      >
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar title="Apply Now" />
          <main className="min-w-0 flex-1 overflow-y-auto px-3 py-4 sm:p-6 flex items-center justify-center">
            <div className="max-w-md w-full text-center">
              {/* Success animation */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
                  }}
                >
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div
                  className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: "#2563eb" }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07" />
                    <path d="M2 2l20 20" />
                  </svg>
                </div>
              </div>

              <h2
                className="text-2xl font-bold text-slate-900 mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Application Submitted!
              </h2>
              <p className="text-slate-500 text-sm mb-1">
                Your application for{" "}
                <span className="font-semibold text-slate-700">{d.role}</span>{" "}
                at
              </p>
              <div className="flex items-center justify-center gap-2 mb-6">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: d.logoColor }}
                >
                  {d.logo}
                </div>
                <span
                  className="font-bold text-slate-800"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {d.company}
                </span>
              </div>

              {/* Confirmation card */}
              <div
                className="bg-white rounded-2xl p-5 mb-6 text-left"
                style={{ border: "1px solid #e2e8f0" }}
              >
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Application Summary
                </p>
                <div className="space-y-2">
                  {[
                    {
                      label: "Application ID",
                      value: confirmationId,
                    },
                    {
                      label: "Submitted On",
                      value: new Date().toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }),
                    },
                    { label: "Role", value: d.role },
                    { label: "Company", value: d.company },
                    { label: "Status", value: "Under Review" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between"
                    >
                      <span className="text-xs text-slate-500">
                        {item.label}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="bg-blue-50 rounded-2xl p-4 mb-6 text-left"
                style={{ border: "1px solid #bfdbfe" }}
              >
                <p className="text-xs font-semibold text-blue-800 mb-1">
                  What happens next?
                </p>
                <ul className="space-y-1">
                  {[
                    "The placement cell will review your application",
                    `Shortlisting results will be announced by ${d.deadline}`,
                    "Check your registered email for updates",
                    "Track real-time status in My Applications",
                  ].map((s, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-blue-700"
                    >
                      <svg
                        className="flex-shrink-0 mt-0.5"
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/applications")}
                  className="flex-1 h-11 rounded-xl text-sm font-semibold transition-all hover:opacity-90 text-white"
                  style={{
                    background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Track Application
                </button>
                <button
                  onClick={() => navigate("/drives")}
                  className="flex-1 h-11 rounded-xl text-sm font-semibold transition-all hover:bg-slate-100"
                  style={{
                    background: "white",
                    color: "#475569",
                    border: "1px solid #e2e8f0",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  More Drives
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#f0f6ff" }}
    >
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title="Apply Now" />

        <main className="min-w-0 flex-1 overflow-y-auto px-3 py-4 sm:p-6">
          {submitError && (
            <div
              className="max-w-4xl mx-auto mb-4 rounded-xl px-4 py-3 text-sm"
              style={{ background: "#fee2e2", color: "#b91c1c" }}
            >
              {submitError}
            </div>
          )}
          {/* Back button */}
          <button
            onClick={() => navigate(`/drives/${driveId}`)}
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
            Back to Drive Details
          </button>

          <div className="max-w-3xl mx-auto">
            {/* Drive summary chip */}
            <div
              className="bg-white rounded-2xl p-4 mb-6 flex items-center justify-between gap-4 flex-wrap"
              style={{ border: "1px solid #e2e8f0" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
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
                  <div className="text-xs text-slate-500">
                    {d.role} • {d.location}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div
                    className="text-base font-bold"
                    style={{
                      color: "#1d4ed8",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {d.package}
                  </div>
                  <div className="text-xs text-slate-400">CTC</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-700">
                    {d.deadline}
                  </div>
                  <div className="text-xs text-slate-400">Deadline</div>
                </div>
              </div>
            </div>

            {/* Stepper */}
            <div className="flex items-center mb-8">
              {STEPS.map((s, i) => {
                const done = i < step;
                const active = i === step;
                return (
                  <div
                    key={s}
                    className="flex items-center flex-1 last:flex-initial"
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                        style={{
                          background: done
                            ? "#1d4ed8"
                            : active
                              ? "white"
                              : "#f1f5f9",
                          color: done
                            ? "white"
                            : active
                              ? "#1d4ed8"
                              : "#94a3b8",
                          border: active
                            ? "2px solid #1d4ed8"
                            : done
                              ? "none"
                              : "2px solid #e2e8f0",
                        }}
                      >
                        {done ? (
                          <svg
                            width="12"
                            height="12"
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
                        className="text-[10px] mt-1 font-medium whitespace-nowrap hidden sm:block"
                        style={{
                          color: active
                            ? "#1d4ed8"
                            : done
                              ? "#64748b"
                              : "#94a3b8",
                        }}
                      >
                        {s}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        className="h-0.5 flex-1 mx-2 mb-3 sm:mb-4"
                        style={{ background: done ? "#1d4ed8" : "#e2e8f0" }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Step content */}
            <div
              className="bg-white rounded-2xl p-6"
              style={{ border: "1px solid #e2e8f0" }}
            >
              {/* Step 0: Personal Info */}
              {step === 0 && (
                <div>
                  <h3
                    className="text-base font-bold text-slate-900 mb-1"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Personal Information
                  </h3>
                  <p className="text-xs text-slate-400 mb-6">
                    Pre-filled from your profile. Edit if needed.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="First Name *"
                      value={form.firstName}
                      onChange={(v) => set("firstName", v)}
                      required
                    />
                    <Field
                      label="Last Name *"
                      value={form.lastName}
                      onChange={(v) => set("lastName", v)}
                      required
                    />
                    <Field
                      label="Email Address *"
                      value={form.email}
                      onChange={(v) => set("email", v)}
                      type="email"
                      required
                    />
                    <Field
                      label="Phone Number *"
                      value={form.phone}
                      onChange={(v) => set("phone", v)}
                      type="tel"
                      required
                    />
                    <Field
                      label="Roll Number *"
                      value={form.rollNumber}
                      onChange={(v) => set("rollNumber", v)}
                      required
                    />
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Gender
                      </label>
                      <select
                        className="w-full h-10 px-3 rounded-xl text-sm outline-none"
                        style={{
                          border: "1px solid #e2e8f0",
                          fontFamily: "var(--font-body)",
                          color: "#334155",
                          background: "white",
                        }}
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Prefer not to say</option>
                      </select>
                    </div>
                    <Field
                      label="LinkedIn Profile *"
                      value={form.linkedin}
                      onChange={(v) => set("linkedin", v)}
                      placeholder="linkedin.com/in/username"
                      required
                    />
                    <Field
                      label="GitHub Profile *"
                      value={form.github}
                      onChange={(v) => set("github", v)}
                      placeholder="github.com/username"
                      required
                    />
                    <div className="sm:col-span-2">
                      <Field
                        label="Portfolio / Personal Website"
                        value={form.portfolio}
                        onChange={(v) => set("portfolio", v)}
                        placeholder="yourwebsite.com (optional)"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Field
                        label="Referral Code (if any)"
                        value={form.referral}
                        onChange={(v) => set("referral", v)}
                        placeholder="Leave blank if none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Academic */}
              {step === 1 && (
                <div>
                  <h3
                    className="text-base font-bold text-slate-900 mb-1"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Academic Details
                  </h3>
                  <p className="text-xs text-slate-400 mb-6">
                    Verify that your academic information is accurate.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Branch / Department *
                      </label>
                      <select
                        className="w-full h-10 px-3 rounded-xl text-sm outline-none"
                        style={{
                          border: "1px solid #e2e8f0",
                          fontFamily: "var(--font-body)",
                          color: "#334155",
                          background: "white",
                        }}
                        value={form.branch}
                        onChange={(e) => set("branch", e.target.value)}
                        required
                      >
                        <option value="" disabled>
                          Select branch
                        </option>
                        {[
                          "Computer Science & Engineering",
                          "Electronics & Communication",
                          "Information Technology",
                          "Electrical Engineering",
                          "Mechanical Engineering",
                        ].map((b) => (
                          <option key={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Current Semester *
                      </label>
                      <select
                        className="w-full h-10 px-3 rounded-xl text-sm outline-none"
                        style={{
                          border: "1px solid #e2e8f0",
                          fontFamily: "var(--font-body)",
                          color: "#334155",
                          background: "white",
                        }}
                        value={form.semester}
                        onChange={(e) => set("semester", e.target.value)}
                        required
                      >
                        <option value="" disabled>
                          Select semester
                        </option>
                        {["6th Semester", "7th Semester", "8th Semester"].map(
                          (s) => (
                            <option key={s}>{s}</option>
                          ),
                        )}
                      </select>
                    </div>
                    <Field
                      label="Current CGPA *"
                      value={form.cgpa}
                      onChange={(v) => set("cgpa", v)}
                      placeholder="e.g. 8.4"
                      required
                    />
                    <Field
                      label="Active Backlogs *"
                      value={form.backlogs}
                      onChange={(v) => set("backlogs", v)}
                      placeholder="0"
                      required
                    />
                    <Field
                      label="10th Percentage (%) *"
                      value={form.tenthPercent}
                      onChange={(v) => set("tenthPercent", v)}
                      placeholder="e.g. 92.4"
                      required
                    />
                    <Field
                      label="12th Percentage (%) *"
                      value={form.twelfthPercent}
                      onChange={(v) => set("twelfthPercent", v)}
                      placeholder="e.g. 88.6"
                      required
                    />
                  </div>

                  {/* Eligibility check summary */}
                  <div
                    className="rounded-xl p-4"
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #f1f5f9",
                    }}
                  >
                    <p className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">
                      Eligibility Check
                    </p>
                    <div className="space-y-2">
                      {[
                        {
                          label: "CGPA Requirement",
                          required: `≥ ${d.minimumCGPA ?? d.cgpaCutoff ?? d.cgpa}`,
                          yours: form.cgpa,
                          pass:
                            parseFloat(form.cgpa) >=
                            Number(d.minimumCGPA ?? d.cgpaCutoff ?? d.cgpa ?? 0),
                        },
                        {
                          label: "Active Backlogs",
                          required: d.backlogAllowed ? "Allowed" : "None",
                          yours: form.backlogs === "0" ? "None" : form.backlogs,
                          pass: d.backlogAllowed || form.backlogs === "0",
                        },
                        {
                          label: "Branch",
                          required: d.branches.join(", "),
                          yours: "CSE",
                          pass: true,
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-slate-500">{item.label}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400">
                              Required:{" "}
                              <span className="text-slate-600 font-medium">
                                {item.required}
                              </span>
                            </span>
                            <span className="text-slate-400">
                              Yours:{" "}
                              <span
                                className="font-semibold"
                                style={{
                                  color: item.pass ? "#059669" : "#dc2626",
                                }}
                              >
                                {item.yours}
                              </span>
                            </span>
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{
                                background: item.pass ? "#dcfce7" : "#fee2e2",
                              }}
                            >
                              {item.pass ? (
                                <svg
                                  width="9"
                                  height="9"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#16a34a"
                                  strokeWidth="3"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              ) : (
                                <svg
                                  width="9"
                                  height="9"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#dc2626"
                                  strokeWidth="3"
                                >
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Documents */}
              {step === 2 && (
                <div>
                  <h3
                    className="text-base font-bold text-slate-900 mb-1"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Documents & Cover Letter
                  </h3>
                  <p className="text-xs text-slate-400 mb-6">
                    Upload your resume and write a cover letter for this
                    specific role.
                  </p>

                  {/* Resume upload */}
                  <div className="mb-5">
                    <label className="block text-xs font-semibold text-slate-600 mb-2">
                      Resume *
                    </label>
                    <input
                      ref={resumeInputRef}
                      type="file"
                      accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                    {resumeUploaded ? (
                      <div
                        className="flex items-center gap-3 p-4 rounded-xl"
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
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#16a34a"
                            strokeWidth="2"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-green-800">
                            {resumeName}
                          </p>
                          <p className="text-xs text-green-600">
                            {resumeUploading
                              ? "Uploading..."
                              : "Stored securely in your profile"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => resumeInputRef.current?.click()}
                          disabled={resumeUploading}
                          className="text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                        >
                          {resumeUploading ? "Uploading..." : "Replace"}
                        </button>
                      </div>
                    ) : (
                      <div
                        className="rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
                        style={{
                          border: "2px dashed #cbd5e1",
                          background: "#f8fafc",
                        }}
                        onClick={() => resumeInputRef.current?.click()}
                      >
                        <svg
                          className="mx-auto mb-3"
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#94a3b8"
                          strokeWidth="1.5"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <p className="text-sm font-medium text-slate-600">
                          Click to upload resume
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          PDF or DOCX, max 5 MB
                        </p>
                      </div>
                    )}
                    {resumeError && (
                      <p className="text-xs text-red-600 mt-2">{resumeError}</p>
                    )}
                  </div>

                  {/* Cover letter */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-600">
                        Cover Letter / Why {d.company}? *
                      </label>
                      <span className="text-[10px] text-slate-400">
                        {form.coverLetter.length}/1000
                      </span>
                    </div>
                    <textarea
                      rows={6}
                      maxLength={1000}
                      value={form.coverLetter}
                      onChange={(e) => set("coverLetter", e.target.value)}
                      required
                      placeholder={`Tell ${d.company} why you're excited about the ${d.role} role and what makes you a great fit. Mention relevant projects, skills, or experiences...`}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
                      style={{
                        border: "1px solid #e2e8f0",
                        fontFamily: "var(--font-body)",
                        color: "#334155",
                        lineHeight: "1.6",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                      onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                    />
                    {form.coverLetter.length === 0 && (
                      <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        A strong cover letter significantly improves
                        shortlisting chances.
                      </p>
                    )}
                  </div>

                  {/* Optional: additional info */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Any Additional Information{" "}
                      <span className="text-slate-400 font-normal">
                        (Optional)
                      </span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Internship experience, competitive programming ratings, open-source contributions, awards..."
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
                      style={{
                        border: "1px solid #e2e8f0",
                        fontFamily: "var(--font-body)",
                        color: "#334155",
                        lineHeight: "1.6",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                      onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <div>
                  <h3
                    className="text-base font-bold text-slate-900 mb-1"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Review & Submit
                  </h3>
                  <p className="text-xs text-slate-400 mb-6">
                    Please review your application before final submission.
                  </p>

                  <div className="space-y-4">
                    {/* Personal */}
                    <ReviewSection
                      title="Personal Information"
                      onEdit={() => setStep(0)}
                    >
                      <ReviewGrid
                        items={[
                          {
                            label: "Full Name",
                            value: `${form.firstName} ${form.lastName}`,
                          },
                          { label: "Email", value: form.email },
                          { label: "Phone", value: form.phone },
                          { label: "Roll Number", value: form.rollNumber },
                          { label: "LinkedIn", value: form.linkedin || "—" },
                          { label: "GitHub", value: form.github || "—" },
                        ]}
                      />
                    </ReviewSection>

                    {/* Academic */}
                    <ReviewSection
                      title="Academic Details"
                      onEdit={() => setStep(1)}
                    >
                      <ReviewGrid
                        items={[
                          { label: "Branch", value: form.branch },
                          { label: "Semester", value: form.semester },
                          { label: "CGPA", value: form.cgpa },
                          { label: "10th %", value: `${form.tenthPercent}%` },
                          { label: "12th %", value: `${form.twelfthPercent}%` },
                          {
                            label: "Active Backlogs",
                            value: form.backlogs || "0",
                          },
                        ]}
                      />
                    </ReviewSection>

                    {/* Documents */}
                    <ReviewSection title="Documents" onEdit={() => setStep(2)}>
                      <div className="flex items-center gap-2 text-xs">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{
                            background: resumeUploaded ? "#dcfce7" : "#fef2f2",
                          }}
                        >
                          {resumeUploaded ? (
                            <svg
                              width="9"
                              height="9"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#16a34a"
                              strokeWidth="3"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <svg
                              width="9"
                              height="9"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#dc2626"
                              strokeWidth="3"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          )}
                        </div>
                        <span className="font-medium text-slate-700">
                          {resumeUploaded
                            ? "Mayank_Verma_Resume.pdf"
                            : "No resume uploaded"}
                        </span>
                      </div>
                      {form.coverLetter && (
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                          {form.coverLetter}
                        </p>
                      )}
                      {!form.coverLetter && (
                        <p className="text-xs text-amber-600 mt-2">
                          No cover letter written — consider adding one.
                        </p>
                      )}
                    </ReviewSection>

                    {/* Drive */}
                    <div
                      className="rounded-xl p-4"
                      style={{
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe",
                      }}
                    >
                      <p className="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide">
                        Applying For
                      </p>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                          style={{ background: d.logoColor }}
                        >
                          {d.logo}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {d.role}
                          </p>
                          <p className="text-xs text-slate-500">
                            {d.company} • {d.package} • {d.location}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Declaration */}
                    <div
                      className="rounded-xl p-4"
                      style={{
                        background: "#fffbeb",
                        border: "1px solid #fde68a",
                      }}
                    >
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.declaration}
                          onChange={(e) => set("declaration", e.target.checked)}
                          className="mt-0.5 flex-shrink-0"
                          style={{
                            accentColor: "#1d4ed8",
                            width: "15px",
                            height: "15px",
                          }}
                        />
                        <span className="text-xs text-slate-700 leading-relaxed">
                          I hereby declare that all the information provided
                          above is true and accurate to the best of my
                          knowledge. I understand that any false information may
                          lead to disqualification.
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-5">
              <button
                onClick={() =>
                  step === 0
                    ? navigate(`/drives/${driveId}`)
                    : setStep(step - 1)
                }
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-slate-200"
                style={{
                  background: "#f1f5f9",
                  color: "#475569",
                  fontFamily: "var(--font-display)",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                {step === 0 ? "Cancel" : "Previous"}
              </button>

              <div className="flex items-center gap-2">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full transition-all"
                    style={{
                      background:
                        i === step
                          ? "#1d4ed8"
                          : i < step
                            ? "#93c5fd"
                            : "#e2e8f0",
                      width: i === step ? "20px" : "8px",
                    }}
                  />
                ))}
              </div>

              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => {
                    if (validateStep(step)) setStep(step + 1);
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Next
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
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!form.declaration || !resumeUploaded}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, #059669, #10b981)",
                    fontFamily: "var(--font-display)",
                  }}
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
                  Submit Application
                </button>
              )}
            </div>
            {(validationError || submitError) && (
              <p className="text-sm text-red-600 text-right mt-3">
                {validationError || submitError}
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full h-10 px-3 rounded-xl text-sm outline-none transition-all"
        style={{
          border: "1px solid #e2e8f0",
          fontFamily: "var(--font-body)",
          color: "#334155",
          background: "white",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
        onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
      />
    </div>
  );
}

function ReviewSection({ title, onEdit, children }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid #f1f5f9" }}
    >
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ background: "#f8fafc" }}
      >
        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
          {title}
        </span>
        <button
          onClick={onEdit}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit
        </button>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

function ReviewGrid({ items }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
      {items.map((item) => (
        <div key={item.label}>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">
            {item.label}
          </p>
          <p className="text-xs font-semibold text-slate-800 truncate">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
