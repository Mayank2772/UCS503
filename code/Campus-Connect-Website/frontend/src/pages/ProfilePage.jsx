import { useRef, useState } from "react";
import Topbar from "../components/Topbar";
import { useNavigate } from "react-router-dom";
import {
  calculateProfileCompletion,
  getCompletionItems,
} from "../utils/profileCompletion";
import { deleteResume, uploadResume } from "../api/student";
export default function ProfilePage({ onNav, user: initialUser }) {
  const [user, setUser] = useState(() => {
    return initialUser || null;
  });
  const [resumeUploaded, setResumeUploaded] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const parsed = storedUser ? JSON.parse(storedUser) : null;
      return Boolean(parsed?.resume);
    } catch (error) {
      console.error("Invalid user data:", error);
      return false;
    }
  });
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const resumeInputRef = useRef(null);
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f0f6ff]">
        <p className="text-slate-500">Loading profile...</p>
      </div>
    );
  }

  const initials =
    `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() ||
    "S";

  const skills = user.skills || [];

  const academic = user.academicDetails || {};
  const graduation = academic.graduation || {};
  const class12 = academic.class12 || {};
  const class10 = academic.class10 || {};

  const projects = user.projects || [];

  // Academic values
  const cgpa = graduation.cgpa || 0;
  const tenthPercentage = class10.percentage || 0;
  const twelfthPercentage = class12.percentage || 0;

  const activeBacklogs = Number(user.activeBacklogs) || 0;

  const completionItems = getCompletionItems(user);
  const doneCount = completionItems.filter((item) => item.done).length;
  const pct = calculateProfileCompletion(user);
  const saveUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setResumeError("");
    setResumeUploading(true);

    try {
      const response = await uploadResume(file);
      saveUser({
        ...user,
        resume: response.resume.id,
        resumeName: response.resume.fileName,
      });
      setResumeUploaded(true);
    } catch (error) {
      setResumeError(error.message || "Failed to upload resume.");
    } finally {
      setResumeUploading(false);
    }
  };

  const handleResumeDelete = async () => {
    setResumeError("");

    try {
      await deleteResume();
      setResumeUploaded(false);
      saveUser({ ...user, resume: "", resumeName: "" });
    } catch (error) {
      setResumeError(error.message || "Failed to remove resume.");
    }
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#f0f6ff" }}
    >
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title="My Profile" onNav={onNav} />

        <main className="min-w-0 flex-1 overflow-y-auto px-3 py-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Profile hero card */}
            <div
              className="bg-white rounded-2xl overflow-hidden mb-6"
              style={{ border: "1px solid #e2e8f0" }}
            >
              <div
                className="h-28 relative"
                style={{
                  background:
                    "linear-gradient(135deg, #0f2a5e 0%, #1d4ed8 60%, #60a5fa 100%)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 20%, white 0%, transparent 40%)",
                  }}
                />

                <button
                  onClick={() => navigate("/settings")}
                  className="absolute top-3 cursor-pointer right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-white/30"
                  style={{
                    background: "rgba(255,255,255,0.18)",
                    color: "white",
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 0 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  Edit in Settings
                </button>
              </div>

              <div className="px-6 pb-6">
                <div className="flex items-end justify-between -mt-10 mb-4">
                  <div className="relative">
                    <div
                      className="w-20 h-20 rounded-2xl border-4 border-white flex items-center justify-center text-white text-2xl font-bold"
                      style={{
                        background: "linear-gradient(135deg, #1d4ed8, #60a5fa)",
                      }}
                    >
                      {initials}
                    </div>

                    <div
                      className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center"
                      style={{ background: "#10b981" }}
                    >
                      <svg
                        width="8"
                        height="8"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-2 px-3 py-1 rounded-xl text-sm font-medium"
                    style={{
                      background: "#eff6ff",
                      color: "#2563eb",
                      border: "1px solid #bfdbfe",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z" />
                    </svg>

                    <span>{user.phone || "Contact No."}</span>
                  </div>
                </div>

                <h2
                  className="text-xl font-bold text-slate-900"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {user.firstName} {user.lastName}
                </h2>

                <p className="text-slate-500 text-sm mt-0.5">
                  {graduation.degree || "B.Tech"}{" "}
                  {graduation.branch || "Computer Science & Engineering"}
                  {graduation.college ? ` • ${graduation.college}` : ""}
                </p>

                {user.bio && (
                  <p className="text-slate-500 text-sm mt-2 max-w-lg leading-relaxed">
                    {user.bio}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mt-3">
                  {/* CGPA */}
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{
                      background: "#eff6ff",
                      color: "#2563eb",
                    }}
                  >
                    CGPA: {cgpa > 0 ? cgpa : "Not added"}
                  </span>

                  {/* 10th Percentage */}
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{
                      background: "#ecfeff",
                      color: "#0891b2",
                    }}
                  >
                    10th:{" "}
                    {tenthPercentage > 0 ? `${tenthPercentage}%` : "Not added"}
                  </span>

                  {/* 12th Percentage */}
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{
                      background: "#f5f3ff",
                      color: "#7c3aed",
                    }}
                  >
                    12th:{" "}
                    {twelfthPercentage > 0
                      ? `${twelfthPercentage}%`
                      : "Not added"}
                  </span>

                  {/* Backlog */}
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{
                      background: activeBacklogs === 0 ? "#ecfdf5" : "#fef2f2",
                      color: activeBacklogs === 0 ? "#059669" : "#dc2626",
                    }}
                  >
                    {activeBacklogs === 0
                      ? "No Active Backlog"
                      : `${activeBacklogs} Active Backlog${
                          activeBacklogs > 1 ? "s" : ""
                        }`}
                  </span>
                </div>

                {(user.linkedin || user.github || user.portfolio) && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {user.linkedin && (
                      <a
                        href={
                          user.linkedin.startsWith("http")
                            ? user.linkedin
                            : `https://${user.linkedin}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        LinkedIn
                      </a>
                    )}

                    {user.github && (
                      <a
                        href={
                          user.github.startsWith("http")
                            ? user.github
                            : `https://${user.github}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-medium text-slate-600 hover:underline"
                      >
                        GitHub
                      </a>
                    )}

                    {user.portfolio && (
                      <a
                        href={
                          user.portfolio.startsWith("http")
                            ? user.portfolio
                            : `https://${user.portfolio}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-medium text-slate-600 hover:underline"
                      >
                        Portfolio
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* LEFT */}
              <div className="space-y-5">
                {/* Completion */}
                <div
                  className="bg-white rounded-2xl p-5"
                  style={{ border: "1px solid #e2e8f0" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3
                      className="text-sm font-semibold text-slate-800"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Profile Completion
                    </h3>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-2xl font-bold text-blue-600"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {pct}%
                    </span>

                    <span className="text-xs text-slate-400">
                      {doneCount}/{completionItems.length} done
                    </span>
                  </div>

                  <div
                    className="h-2 rounded-full mb-4"
                    style={{ background: "#e2e8f0" }}
                  >
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: "linear-gradient(90deg, #1d4ed8, #60a5fa)",
                      }}
                    />
                  </div>

                  <ul className="space-y-1.5">
                    {completionItems.map((item) => (
                      <li
                        key={item.label}
                        className="flex items-center gap-2 text-xs"
                      >
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background: item.done ? "#dcfce7" : "#f1f5f9",
                          }}
                        >
                          {item.done ? (
                            <svg
                              width="8"
                              height="8"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#16a34a"
                              strokeWidth="3"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          )}
                        </div>

                        <span
                          className={
                            item.done ? "text-slate-600" : "text-slate-400"
                          }
                        >
                          {item.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Skills */}
                <div
                  className="bg-white rounded-2xl p-5"
                  style={{ border: "1px solid #e2e8f0" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3
                      className="text-sm font-semibold text-slate-800"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Technical Skills
                    </h3>
                  </div>

                  {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs font-medium px-2.5 py-1 rounded-lg"
                          style={{
                            background: "#eff6ff",
                            color: "#1d4ed8",
                            border: "1px solid #bfdbfe",
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">
                      No skills added yet.{" "}
                      <button
                        onClick={() => navigate("/settings")}
                        className="text-blue-600 hover:underline"
                      >
                        Add skills
                      </button>
                    </p>
                  )}
                </div>
                {/* Social Profiles */}
                <div className="space-y-3">
                  {/* LinkedIn */}
                  <div
                    className="bg-white rounded-2xl p-4"
                    style={{ border: "1px solid #e2e8f0" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "#eff6ff",
                          color: "#2563eb",
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
                          <rect x="2" y="9" width="4" height="12" />
                          <circle cx="4" cy="4" r="2" />
                        </svg>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">
                          LinkedIn
                        </p>

                        {user.linkedin ? (
                          <a
                            href={
                              user.linkedin.startsWith("http")
                                ? user.linkedin
                                : `https://${user.linkedin}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-600 hover:underline truncate block"
                          >
                            {user.linkedin}
                          </a>
                        ) : (
                          <p className="text-xs text-slate-400">Not added</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* GitHub */}
                  <div
                    className="bg-white rounded-2xl p-4"
                    style={{ border: "1px solid #e2e8f0" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "#f1f5f9",
                          color: "#334155",
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-1.5 6-6a4.6 4.6 0 0 0-1-3.5 4.2 4.2 0 0 0-.1-3.5s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.4 0C6.6 2.2 5.5 2.5 5.5 2.5a4.2 4.2 0 0 0-.1 3.5 4.6 4.6 0 0 0-1 3.5c0 4.5 3 6 6 6a4.8 4.8 0 0 0-1 3.5v4" />
                          <path d="M9 18c-4.5 2-5-2-7-2" />
                        </svg>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">
                          GitHub
                        </p>

                        {user.github ? (
                          <a
                            href={
                              user.github.startsWith("http")
                                ? user.github
                                : `https://${user.github}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-slate-600 hover:text-blue-600 hover:underline truncate block"
                          >
                            {user.github}
                          </a>
                        ) : (
                          <p className="text-xs text-slate-400">Not added</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Portfolio */}
                  <div
                    className="bg-white rounded-2xl p-4"
                    style={{ border: "1px solid #e2e8f0" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "#f5f3ff",
                          color: "#7c3aed",
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="9" />
                          <path d="M3 12h18" />
                          <path d="M12 3a14 14 0 0 1 0 18" />
                          <path d="M12 3a14 14 0 0 0 0 18" />
                        </svg>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">
                          Portfolio
                        </p>

                        {user.portfolio ? (
                          <a
                            href={
                              user.portfolio.startsWith("http")
                                ? user.portfolio
                                : `https://${user.portfolio}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-purple-600 hover:underline truncate block"
                          >
                            {user.portfolio}
                          </a>
                        ) : (
                          <p className="text-xs text-slate-400">Not added</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="lg:col-span-2 space-y-5">
                {/* Academic */}
                <div
                  className="bg-white rounded-2xl p-5"
                  style={{ border: "1px solid #e2e8f0" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className="text-sm font-semibold text-slate-800"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Academic Details
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {/* Graduation */}
                    <div
                      className="flex items-center justify-between p-3.5 rounded-xl"
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #f1f5f9",
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                          style={{ background: "#1d4ed8" }}
                        >
                          B
                        </div>

                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-800 truncate">
                            {graduation.degree || "B.Tech"}
                          </div>

                          <div className="text-xs text-slate-500 truncate">
                            {graduation.branch || "Branch not added"}
                          </div>

                          {graduation.college && (
                            <div className="text-xs text-slate-400 truncate mt-0.5">
                              {graduation.college}
                            </div>
                          )}

                          {graduation.university && (
                            <div className="text-xs text-slate-400 truncate">
                              {graduation.university}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right ml-4 flex-shrink-0">
                        {graduation.cgpa > 0 ? (
                          <div className="text-sm font-bold text-slate-900">
                            CGPA: {graduation.cgpa} / 10
                          </div>
                        ) : (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-400">
                            CGPA not added
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Class XII */}
                    <div
                      className="flex items-center justify-between p-3.5 rounded-xl"
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #f1f5f9",
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                          style={{ background: "#0891b2" }}
                        >
                          12
                        </div>

                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-800">
                            Class XII
                            {class12.board ? ` (${class12.board})` : ""}
                          </div>

                          <div className="text-xs text-slate-500 truncate">
                            {class12.school || "School not added"}
                          </div>
                        </div>
                      </div>

                      <div className="text-right ml-4 flex-shrink-0">
                        {class12.percentage > 0 ? (
                          <div className="text-sm font-bold text-slate-900">
                            {class12.percentage}%
                          </div>
                        ) : (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-400">
                            Percentage not added
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Class X */}
                    <div
                      className="flex items-center justify-between p-3.5 rounded-xl"
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #f1f5f9",
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                          style={{ background: "#7c3aed" }}
                        >
                          10
                        </div>

                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-800">
                            Class X{class10.board ? ` (${class10.board})` : ""}
                          </div>

                          <div className="text-xs text-slate-500 truncate">
                            {class10.school || "School not added"}
                          </div>
                        </div>
                      </div>

                      <div className="text-right ml-4 flex-shrink-0">
                        {class10.percentage > 0 ? (
                          <div className="text-sm font-bold text-slate-900">
                            {class10.percentage}%
                          </div>
                        ) : (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-400">
                            Percentage not added
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Projects */}
                <div
                  className="bg-white rounded-2xl p-5"
                  style={{ border: "1px solid #e2e8f0" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className="text-sm font-semibold text-slate-800"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Projects
                    </h3>
                  </div>

                  {projects.length > 0 ? (
                    <div className="space-y-3">
                      {projects.map((project, index) => (
                        <div
                          key={project._id || index}
                          className="p-4 rounded-xl transition-all hover:shadow-sm"
                          style={{
                            background: "#f8fafc",
                            border: "1px solid #f1f5f9",
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-semibold text-slate-800">
                              {project.name}
                            </h4>

                            {project.link && (
                              <a
                                href={
                                  project.link.startsWith("http")
                                    ? project.link
                                    : `https://${project.link}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                View
                              </a>
                            )}
                          </div>

                          {project.description && (
                            <p className="text-xs text-slate-500 mt-1">
                              {project.description}
                            </p>
                          )}

                          {project.tech?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {project.tech.map((tech) => (
                                <span
                                  key={tech}
                                  className="text-[10px] font-medium px-2 py-0.5 rounded"
                                  style={{
                                    background: "#e0e7ff",
                                    color: "#4338ca",
                                  }}
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">
                      No projects added yet.
                    </p>
                  )}
                </div>

                {/* Resume */}
                <div
                  className="rounded-2xl p-5"
                  style={{
                    background: resumeUploaded ? "#f0fdf4" : "#f8fafc",
                    border: `1px dashed ${
                      resumeUploaded ? "#86efac" : "#cbd5e1"
                    }`,
                  }}
                >
                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                  {resumeUploaded ? (
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "#dcfce7" }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#16a34a"
                          strokeWidth="2"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>

                      <div className="flex-1">
                        <div className="text-sm font-semibold text-green-800">
                          {user.resumeName ||
                            `${user.firstName}_${user.lastName}_Resume.pdf`}
                        </div>

                        <div className="text-xs text-green-600">
                          Uploaded successfully
                        </div>
                      </div>

                      <button
                        onClick={handleResumeDelete}
                        className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <svg
                        className="mx-auto mb-2"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="1.5"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>

                      <p className="text-sm font-medium text-slate-600 mb-1">
                        Upload Resume
                      </p>

                      <p className="text-xs text-slate-400 mb-3">
                        PDF or DOCX, max 5MB
                      </p>

                      <button
                        onClick={() => resumeInputRef.current?.click()}
                        disabled={resumeUploading}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
                        style={{
                          background:
                            "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                        }}
                      >
                        {resumeUploading ? "Uploading..." : "Browse Files"}
                      </button>
                      {resumeError && (
                        <p className="text-xs text-red-600 mt-3">
                          {resumeError}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
