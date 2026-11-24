import { API_BASE_URL } from "./config";
const API_URL = `${API_BASE_URL}/drives`;
import { request as apiRequest } from "./request";

async function request(path = "", options = {}) {
  const { response, data } = await apiRequest(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!response.ok) {
    const details = Array.isArray(data.errors)
      ? `: ${data.errors.map((error) => error.message).join(", ")}`
      : "";
    throw new Error(`${data.message || "Drive request failed"}${details}`);
  }
  return data;
}

export async function getDrives() {
  return request();
}

export async function createDrive(drive) {
  return request("/", { method: "POST", body: JSON.stringify(drive) });
}

export async function updateDrive(id, drive) {
  return request(`/${id}`, { method: "PUT", body: JSON.stringify(drive) });
}

export async function deleteDrive(id) {
  return request(`/${id}`, { method: "DELETE" });
}
