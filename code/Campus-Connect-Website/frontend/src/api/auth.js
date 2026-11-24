import { API_BASE_URL } from "./config";
import { request as apiRequest } from "./request";
const API_URL = `${API_BASE_URL}/auth`;

export async function register(data) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Registration failed");
  }

  return result;
}

export async function requestRegistrationOtp(data) {
  const response = await fetch(`${API_URL}/register/request-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Unable to send verification code");
  }

  return result;
}

export async function login(data) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Login failed");
  }

  return result;
}

export async function requestPasswordResetOtp(data) {
  const response = await fetch(`${API_URL}/forgot-password/request-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Unable to send reset code");
  }

  return result;
}

export async function resetPassword(data) {
  const response = await fetch(`${API_URL}/forgot-password/reset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Unable to reset password");
  }

  return result;
}

export async function changePassword(data) {
  const { response, data: result } = await apiRequest(`${API_URL}/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(result.message || "Failed to update password");
  }

  return result;
}
