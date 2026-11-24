import { useState } from "react";
import { Link } from "react-router-dom";
import { login } from "../api/auth";
import { useNavigate } from "react-router-dom";
export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      setLoading(true);

      const response = await login({
        email: email,
        password: password,
      });

      localStorage.setItem("token", response.token);

      const userData = {
        ...response.user,
        ...response.student,
      };

      localStorage.setItem("user", JSON.stringify(userData));

      onLogin();
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* Left panel */}
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
            Your Career
            <br />
            Starts Here
          </h1>
          <p className="text-blue-200 text-base leading-relaxed max-w-xs">
            Connect with top companies, track your applications, and land your
            placement opportunities — all in one place.
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

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm">
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
            Welcome back
          </h2>
          <p className="text-slate-500 text-sm mb-8">
            Sign in to your student account
          </p>
          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Student ID / Email
              </label>
              <input
                type="text"
                placeholder="Enter your College Email Id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border text-sm outline-none transition-all"
                style={{
                  borderColor: "#e2e8f0",
                  fontFamily: "var(--font-body)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border text-sm outline-none transition-all"
                style={{
                  borderColor: "#e2e8f0",
                  fontFamily: "var(--font-body)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            <div className="flex justify-end mb-6">
              <button
                type="button"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                fontFamily: "var(--font-display)",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-600 font-medium hover:underline"
            >
              Create account
            </Link>
          </p>

          <p className="text-center text-xs text-slate-400 mt-4">
            Having trouble? Contact{" "}
            <a
              href="mailto:placements@thapar.edu"
              className="text-blue-600 cursor-pointer hover:underline"
            >
              placements@thapar.edu
            </a>
          </p>

          <div className="mt-10 border-t border-slate-100 pt-6 text-center">
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
