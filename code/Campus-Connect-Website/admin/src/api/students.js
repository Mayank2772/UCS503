import { API_BASE_URL } from "./config";
const API_URL = `${API_BASE_URL}/students`;
import { request as apiRequest } from "./request";

async function request(path = "") {
  const { response, data } = await apiRequest(`${API_URL}${path}`);
  if (!response.ok) throw new Error(data.message || "Student request failed");
  return data;
}

export function getStudents() {
  return request();
}

export async function updateStudent(id, student) {
  const { response, data } = await apiRequest(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(student),
  });
  if (!response.ok) {
    throw new Error(data.message || "Failed to update student");
  }
  return data;
}

export async function deleteStudent(id) {
  const { response, data } = await apiRequest(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete student");
  }
  return data;
}

export async function fetchStudentResume(id) {
  const { response, data } = await apiRequest(
    `${API_URL}/${id}/resume`,
    {},
    "Failed to load resume",
    false,
  );

  if (!response.ok) {
    throw new Error(data.message || "Failed to load resume");
  }

  return response.blob();
}
