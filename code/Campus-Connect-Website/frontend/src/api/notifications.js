import { API_BASE_URL } from "./config";
const API_URL = `${API_BASE_URL}/notifications`;
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
    throw new Error(data.message || "Notification request failed");
  return data;
}

export function getNotifications() {
  return request();
}

export function markNotificationRead(id) {
  return request(`/${id}/read`, { method: "PATCH" });
}

export function markAllNotificationsRead() {
  return request("/read-all", { method: "PATCH" });
}

export function deleteNotification(id) {
  return request(`/${id}`, { method: "DELETE" });
}
