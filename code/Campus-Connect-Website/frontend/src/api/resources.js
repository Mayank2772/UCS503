import { API_BASE_URL } from "./config";
const API_URL = `${API_BASE_URL}/resources`;
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
    throw new Error(data.message || "Resource request failed");
  }
  return data;
}

export function getResources() {
  return request();
}

export async function fetchResourceFile(id, download = false) {
  const { response } = await apiRequest(
    `${API_URL}/${id}/file${download ? "?download=1" : ""}`,
    {},
    "Unable to access resource file",
    false,
  );
  if (!response.ok) throw new Error("Unable to access resource file");
  return response.blob();
}
