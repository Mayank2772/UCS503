import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  requestPasswordResetOtp,
  resetPassword,
} from "../api/auth";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!otpSent && !email.trim().toLowerCase().endsWith("@thapar.edu")) {
      setError("Please use your @thapar.edu email address.");
      return;
    }

    if (otpSent && newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      if (!otpSent) {
        await requestPasswordResetOtp({
          email: email.trim().toLowerCase(),
        });
        setOtpSent(true);
        return;
      }

      await resetPassword({
        email: email.trim().toLowerCase(),
        otp,
        newPassword,
      });
      navigate("/login", {
        state: { message: "Password reset successfully. Please sign in." },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          {otpSent ? "Reset your password" : "Forgot password?"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {otpSent
            ? `Enter the code sent to ${email}, then choose a new password.`
            : "Enter your Thapar email and we will send you a reset code."}
        </p>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {!otpSent ? (
            <input
              required
              type="email"
              placeholder="yourname@thapar.edu"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-600"
            />
          ) : (
            <>
              <input
                required
                autoFocus
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="Enter 6-digit reset code"
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, ""))
                }
                className="w-full h-12 rounded-xl border border-slate-200 px-4 text-center text-lg tracking-[0.4em] outline-none focus:border-blue-600"
              />
              <input
                required
                type="password"
                minLength={6}
                placeholder="New password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-600"
              />
              <input
                required
                type="password"
                minLength={6}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-600"
              />
            </>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-blue-600 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? otpSent
                ? "Resetting…"
                : "Sending code…"
              : otpSent
                ? "Reset Password"
                : "Send Reset Code"}
          </button>
        </form>

        <Link
          to="/login"
          className="mt-6 block text-center text-sm font-medium text-blue-600 hover:underline"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
