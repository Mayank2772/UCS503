import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { register } from "../api/auth";

export default function VerifyEmail({ onRegistered }) {
  const location = useLocation();
  const navigate = useNavigate();
  const email =
    location.state?.email ||
    sessionStorage.getItem("pending-registration-email") ||
    "";
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    try {
      setLoading(true);
      const response = await register({ email, otp });
      localStorage.setItem("token", response.token);
      localStorage.setItem(
        "user",
        JSON.stringify({ ...response.user, ...response.student }),
      );
      sessionStorage.removeItem("pending-registration-email");
      onRegistered();
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1
          className="text-2xl font-bold text-slate-900"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Verify your email
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          We sent a 6-digit code to <strong>{email || "your email"}</strong>.
          Enter it below to finish creating your account.
        </p>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            required
            autoFocus
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="Enter verification code"
            value={otp}
            onChange={(event) =>
              setOtp(event.target.value.replace(/\D/g, ""))
            }
            className="w-full h-12 rounded-xl border border-slate-200 px-4 text-center text-lg tracking-[0.4em] outline-none focus:border-blue-600"
          />
          <button
            type="submit"
            disabled={loading || !email}
            className="w-full h-12 rounded-xl bg-blue-600 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Verifying…" : "Verify & Create Account"}
          </button>
        </form>

        <Link
          to="/signup"
          className="mt-6 block text-center text-sm font-medium text-blue-600 hover:underline"
        >
          Back to signup
        </Link>
      </div>
    </div>
  );
}
