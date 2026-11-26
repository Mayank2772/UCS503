import { API_BASE_URL } from "./config";
import { request as apiRequest } from "./request";
const API_URL = `${API_BASE_URL}/auth`;

async function post(path, payload, fallbackMessage) {
  const { response, data } = await apiRequest(
    `${API_URL}${path}`,
    {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
      body: JSON.stringify(payload),
    },
    fallbackMessage,
    true,
    false,
  );
  if (!response.ok) throw new Error(data.message || fallbackMessage);
  return data;
}

export function register(data) {
  return post("/register", data, "Registration failed");
}

export function requestRegistrationOtp(data) {
  return post(
    "/register/request-otp",
    data,
    "Unable to send verification code",
  );
}

export function login(data) {
  return post("/login", data, "Login failed");
}

export function requestPasswordResetOtp(data) {
  return post(
    "/forgot-password/request-otp",
    data,
    "Unable to send reset code",
  );
}

export function resetPassword(data) {
  return post("/forgot-password/reset", data, "Unable to reset password");
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
