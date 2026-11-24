import { useState } from "react";
import { login } from "../api/auth";

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(form);
      if (result.user?.role !== "admin") {
        throw new Error("This account does not have admin access.");
      }
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      onLogin();
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "Inter, sans-serif" }}>
      <section
        className="hidden lg:flex flex-col justify-between w-[46%] p-12 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, #111b38 0%, #1d315d 58%, #315aa4 100%)",
        }}
      >
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #8fb5ff 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 -left-16 w-72 h-72 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #6ee7d8 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.16)" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" />
              <path
                d="M2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div className="text-white text-xl font-bold tracking-tight">
              CampusConnect
            </div>
            <div className="text-blue-200 text-xs mt-0.5 tracking-wide">
              ADMIN OPERATIONS
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-teal-200 text-xs font-semibold tracking-widest uppercase mb-4">
            Placement command center
          </p>
          <h1 className="text-white text-4xl font-bold leading-tight mb-4">
            Shape the next
            <br />
            career story.
          </h1>
          <p className="text-blue-200 text-base leading-relaxed max-w-sm">
            Keep drives moving, support students, and turn campus talent into
            meaningful opportunities.
          </p>

          <div className="mt-10 flex gap-8">
            {[
              { value: "48", label: "Active Drives" },
              { value: "1.2k", label: "Applications" },
              { value: "94%", label: "Placement Rate" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-white text-2xl font-bold">
                  {stat.value}
                </div>
                <div className="text-blue-300 text-xs mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 border-t border-white/20 pt-6">
          <p className="text-blue-200 text-sm italic">
            “Every well-run drive is a student’s next chapter taking shape.”
          </p>
          <p className="text-white/70 text-xs mt-2">
            CampusConnect Placement Operations
          </p>
        </div>
      </section>

      <section className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm">
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #1d315d, #315aa4)" }}
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
            <div>
              <div className="text-slate-900 text-lg font-bold">
                CampusConnect
              </div>
              <div className="text-slate-400 text-[10px] tracking-widest">
                ADMIN OPERATIONS
              </div>
            </div>
          </div>

          <p className="text-blue-700 text-xs font-semibold tracking-widest uppercase mb-3">
            Secure administrator access
          </p>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            Welcome back
          </h2>
          <p className="text-slate-500 text-sm mb-8">
            Sign in to manage your placement ecosystem.
          </p>

          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Work email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="name@college.edu"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                className="w-full h-11 px-4 rounded-xl border text-sm outline-none transition-all"
                style={{ borderColor: "#e2e8f0" }}
                onFocus={(event) => (event.target.style.borderColor = "#315aa4")}
                onBlur={(event) => (event.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
                className="w-full h-11 px-4 rounded-xl border text-sm outline-none transition-all"
                style={{ borderColor: "#e2e8f0" }}
                onFocus={(event) => (event.target.style.borderColor = "#315aa4")}
                onBlur={(event) => (event.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            <div className="flex justify-end mb-6">
              <button
                type="button"
                className="text-xs text-blue-700 hover:text-blue-800 font-medium"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #1d315d, #315aa4)",
              }}
            >
              {loading ? "Signing in..." : "Sign in to admin portal"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Admin access is managed by your institution’s placement office.
          </p>

          <div className="mt-10 border-t border-slate-100 pt-6 text-center">
            <a href="/team" className="text-sm font-semibold text-blue-600 hover:underline">
              Built for better beginnings
            </a>
            <p className="mt-1 text-xs text-slate-400">Your placement journey, connected.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
