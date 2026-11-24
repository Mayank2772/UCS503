import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { requestRegistrationOtp } from "../api/auth";
export default function Signup() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    rollNumber: "",
    branch: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!form.email.trim().toLowerCase().endsWith("@thapar.edu")) {
      setError("Please use your @thapar.edu email address.");
      return;
    }

    try {
      setLoading(true);

      const registrationData = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        rollNumber: form.rollNumber,
        branch: form.branch,
        password: form.password,
      };

      await requestRegistrationOtp(registrationData);
      sessionStorage.setItem(
        "pending-registration-email",
        form.email.trim().toLowerCase(),
      );
      navigate("/verify-email");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[46%] p-12 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, #0f2a5e 0%, #1d4ed8 60%, #3b82f6 100%)",
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #ffffff 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 -left-16 w-72 h-72 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #60a5fa 0%, transparent 70%)",
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" />
              <path
                d="M2 17l10 5 10-5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12l10 5 10-5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span
            className="text-white text-xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            CampusConnect
          </span>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <h1
            className="text-white text-4xl font-bold leading-tight mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Join the
            <br />
            Community
          </h1>
          <p className="text-blue-200 text-base leading-relaxed max-w-xs">
            Create your account and get access to hundreds of placement drives,
            real-time notifications, and application tracking.
          </p>

          {/* Stats row */}
          <div className="mt-10 flex gap-8">
            {[
              { value: "200+", label: "Companies" },
              { value: "94%", label: "Placement Rate" },
              { value: "18 LPA", label: "Avg Package" },
            ].map((s) => (
              <div key={s.label}>
                <div
                  className="text-white text-2xl font-bold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {s.value}
                </div>
                <div className="text-blue-300 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 border-t border-white/20 pt-6">
          <p className="text-blue-200 text-sm italic">
            "Got placed at Microsoft through CampusConnect — the process was
            seamless."
          </p>
          <p className="text-white/70 text-xs mt-2">
            — Priya Sharma, CSE Batch 2024
          </p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center bg-white p-8 overflow-y-auto">
        <div className="w-full max-w-sm py-6">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" />
                <path
                  d="M2 12l10 5 10-5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span
              className="text-slate-900 text-lg font-bold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              CampusConnect
            </span>
          </div>

          <h2
            className="text-2xl font-bold text-slate-900 mb-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Create your account
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Register to access placement drives
          </p>

          {/* Error banner */}
          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
              <svg
                className="flex-shrink-0 mt-0.5"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  First Name
                </label>
                <input
                  required
                  placeholder="Mayank"
                  value={form.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border text-sm outline-none transition-all"
                  style={{
                    borderColor: "#e2e8f0",
                    fontFamily: "var(--font-body)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Last Name
                </label>
                <input
                  required
                  placeholder="Verma"
                  value={form.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border text-sm outline-none transition-all"
                  style={{
                    borderColor: "#e2e8f0",
                    fontFamily: "var(--font-body)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                College Email
              </label>
              <input
                required
                type="email"
                placeholder="yourname@thapar.edu"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className="w-full h-11 px-4 rounded-xl border text-sm outline-none transition-all"
                style={{
                  borderColor: "#e2e8f0",
                  fontFamily: "var(--font-body)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
              <p className="text-xs text-slate-400 mt-1.5">
                Use your Thapar University email address.
              </p>
            </div>

            {/* Roll + Branch row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Roll Number
                </label>
                <input
                  required
                  placeholder="21CSE045"
                  value={form.rollNumber}
                  onChange={(e) => set("rollNumber", e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border text-sm outline-none transition-all"
                  style={{
                    borderColor: "#e2e8f0",
                    fontFamily: "var(--font-body)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Branch
                </label>
                <select
                  required
                  value={form.branch}
                  onChange={(e) => set("branch", e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border text-sm outline-none transition-all"
                  style={{
                    borderColor: "#e2e8f0",
                    fontFamily: "var(--font-body)",
                    color: form.branch ? "#0f172a" : "#94a3b8",
                    background: "white",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                >
                  <option value="" disabled>
                    Select branch
                  </option>
                  <option>Computer Science &amp; Engineering</option>
                  <option>Electronics &amp; Communication</option>
                  <option>Information Technology</option>
                  <option>Electrical Engineering</option>
                  <option>Mechanical Engineering</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <input
                required
                type="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                className="w-full h-11 px-4 rounded-xl border text-sm outline-none transition-all"
                style={{
                  borderColor: "#e2e8f0",
                  fontFamily: "var(--font-body)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <input
                required
                type="password"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)}
                className="w-full h-11 px-4 rounded-xl border text-sm outline-none transition-all"
                style={{
                  borderColor: "#e2e8f0",
                  fontFamily: "var(--font-body)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{
                background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                fontFamily: "var(--font-display)",
              }}
            >
              {loading ? "Sending code…" : "Send Verification Code"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>

          <p className="text-center text-xs text-slate-400 mt-4">
            Having trouble? Contact{" "}
            <span className="text-blue-600 cursor-pointer hover:underline">
              placement@college.edu
            </span>
          </p>

          <div className="mt-8 border-t border-slate-100 pt-6 text-center">
            <Link to="/team" className="text-sm font-semibold text-blue-600 hover:underline">
              Built for better beginnings
            </Link>
            <p className="mt-1 text-xs text-slate-400">Your placement journey, connected.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
