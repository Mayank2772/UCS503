import { API_BASE_URL } from "./config";
const API_URL = `${API_BASE_URL}/applications`;
import { request as apiRequest } from "./request";

async function request(path = "", options = {}) {
  const { response, data } = await apiRequest(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!response.ok)
    throw new Error(data.message || "Application request failed");
  return data;
}

export function getApplications() {
  return request();
}

export async function downloadApplicationsExport(driveId) {
  const query = driveId ? `?driveId=${encodeURIComponent(driveId)}` : "";
  const { response, data } = await apiRequest(
    `${API_URL}/export${query}`,
    {},
    "Failed to export applications",
    false,
  );

  if (!response.ok) {
    throw new Error(data.message || "Failed to export applications");
  }

  return response.blob();
}

export function updateApplicationStatus(id, status) {
  return request(`/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
