import { API_BASE_URL } from "./config";
const API_URL = `${API_BASE_URL}/auth`;

export async function login(data) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Login failed");
  return result;
}
