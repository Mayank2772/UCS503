import { API_BASE_URL } from "./config";
const API_URL = `${API_BASE_URL}/drives`;
import { request as apiRequest } from "./request";

function normalizeDrive(drive) {
  const deadlineDate = new Date(drive.deadline);
  const palette = ["#2563eb", "#7c3aed", "#0891b2", "#059669", "#d97706"];
  const logoColor =
    palette[(drive.company?.charCodeAt(0) || 0) % palette.length];

  return {
    ...drive,
    id: drive._id,
    logo: drive.company?.slice(0, 1).toUpperCase() || "D",
    logoColor,
    package: `₹${drive.ctc} LPA`,
    packageRange: drive.ctcRange
      ? `₹${drive.ctcRange} LPA`
      : `₹${drive.ctc} LPA`,
    deadlineDate,
    deadline: deadlineDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    eligible: true,
    tag: drive.type,
    tagColor:
      drive.type === "Internship"
        ? "#b45309"
        : drive.type === "PPO"
          ? "#7c3aed"
          : "#1d4ed8",
    type: drive.type || drive.jobType || "Full-Time",
    cgpaCutoff: drive.cgpa,
    backlogAllowed: drive.backlog,
    branches: drive.branches || [],
    registeredCount: drive.applied || 0,
    skills: drive.skills || [],
    bond: drive.bond || "No Bond",
    process: drive.process?.length
      ? drive.process
      : ["Application Review", "Technical Interview", "HR Round"],
    aboutCompany:
      drive.aboutCompany ||
      `${drive.company} is hiring talented students for this placement opportunity.`,
  };
}

export async function getDrives() {
  const { response, data } = await apiRequest(API_URL);
  if (!response.ok) throw new Error(data.message || "Failed to fetch drives");
  return data.map(normalizeDrive);
}
