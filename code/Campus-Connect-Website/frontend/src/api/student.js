import { API_BASE_URL } from "./config";
const API_URL = `${API_BASE_URL}/students`;
import { request as apiRequest } from "./request";

export async function getStudentProfile() {
  const { response, data } = await apiRequest(`${API_URL}/profile`, {
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const error = new Error(data.message || "Failed to fetch profile");
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function updateStudentProfile(profileData) {
  const { response, data } = await apiRequest(`${API_URL}/profile`, {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(profileData),
  });


  if (!response.ok) {
    throw new Error(data.message || "Failed to update profile");
  }

  return data;
}

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append("resume", file);

  const { response, data } = await apiRequest(`${API_URL}/resume`, {
    method: "POST",
    headers: {
    },
    body: formData,
  });


  if (!response.ok) {
    throw new Error(data.message || "Failed to upload resume");
  }

  return data;
}

export async function deleteResume() {
  const { response, data } = await apiRequest(`${API_URL}/resume`, {
    method: "DELETE",
    headers: {
    },
  });


  if (!response.ok) {
    throw new Error(data.message || "Failed to remove resume");
  }

  return data;
}
