import { API_BASE_URL } from "./config";
import { request as apiRequest } from "./request";
const API_URL = `${API_BASE_URL}/auth`;

export async function login(payload) {
  const { response, data } = await apiRequest(
    `${API_URL}/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "Login failed",
  );
  if (!response.ok) throw new Error(data.message || "Login failed");
  return data;
}
