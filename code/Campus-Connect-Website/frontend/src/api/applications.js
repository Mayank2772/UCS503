import { API_BASE_URL } from "./config";
const API_URL = `${API_BASE_URL}/applications`;
import { request as apiRequest } from "./request";

export async function applyToDrive(driveId, payload = {}) {
  const { response, data } = await apiRequest(`${API_URL}/apply/${driveId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(
      data.reason ? `${data.message}: ${data.reason}` : data.message || "Application failed",
    );
  }
  return data;
}

export async function getMyApplications() {
  const { response, data } = await apiRequest(`${API_URL}/my`);

  if (!response.ok) {
    throw new Error(data.message || "Failed to load applications");
  }

  return data;
}
