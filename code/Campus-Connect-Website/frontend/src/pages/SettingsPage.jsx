import { useRef, useState } from "react";
import Topbar from "../components/Topbar";
import { changePassword } from "../api/auth";
import { deleteResume, uploadResume } from "../api/student";

const tabs = [
  {
    id: "personal",
    label: "Personal Info",
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    id: "academic",
    label: "Academic",
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    id: "social",
    label: "Links & Skills",
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    id: "projects",
    label: "Projects",
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M8 4V2h8v2" />
        <path d="M8 12h8" />
        <path d="M8 16h5" />
      </svg>
    ),
  },
  {
    id: "resume",
    label: "Resume",
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="16" y2="17" />
      </svg>
    ),
  },
  {
    id: "security",
    label: "Security",
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
];

export default function SettingsPage({ onNav, user, onSave }) {
  const [activeTab, setActiveTab] = useState("personal");

  const [draft, setDraft] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",

    rollNumber: user?.rollNumber || "",
    activeBacklogs: user?.activeBacklogs ?? 0,

    academicDetails: {
      graduation: {
        degree: user?.academicDetails?.graduation?.degree || "B.Tech",
        branch:
          user?.academicDetails?.graduation?.branch ||
          "Computer Science & Engineering",
        college: user?.academicDetails?.graduation?.college || "",
        startYear: user?.academicDetails?.graduation?.startYear || 0,
        endYear: user?.academicDetails?.graduation?.endYear || 0,
        cgpa: user?.academicDetails?.graduation?.cgpa || 0,
      },

      class12: {
        school: user?.academicDetails?.class12?.school || "",
        board: user?.academicDetails?.class12?.board || "",
        year: user?.academicDetails?.class12?.year || 0,
        percentage: user?.academicDetails?.class12?.percentage || 0,
      },

      class10: {
        school: user?.academicDetails?.class10?.school || "",
        board: user?.academicDetails?.class10?.board || "",
        year: user?.academicDetails?.class10?.year || 0,
        percentage: user?.academicDetails?.class10?.percentage || 0,
      },
    },

    linkedin: user?.linkedin || "",
    github: user?.github || "",
    portfolio: user?.portfolio || "",

    skills: user?.skills || [],

    projects: user?.projects || [],

    resume: user?.resume || "",
  });

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [newSkill, setNewSkill] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeMsg, setResumeMsg] = useState("");
  const resumeInputRef = useRef(null);

  const [newProject, setNewProject] = useState({
    name: "",
    tech: "",
    description: "",
    link: "",
  });
  const set = (key, value) => {
    setDraft((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const setAcademic = (section, key, value) => {
    setDraft((prev) => ({
      ...prev,
      academicDetails: {
        ...prev.academicDetails,
        [section]: {
          ...prev.academicDetails[section],
          [key]: value,
        },
      },
    }));
  };
  const handleSave = async () => {
    if (!onSave || saving) return;

    try {
      setSaving(true);
      setSaveError("");
      setSaved(false);
      const updatedUser = await onSave(draft);
      setSaved(true);
      if (updatedUser) {
        setDraft({
          firstName: updatedUser.firstName || "",
          lastName: updatedUser.lastName || "",
          phone: updatedUser.phone || "",

          rollNumber: updatedUser.rollNumber || "",

          activeBacklogs: updatedUser.activeBacklogs ?? 0,

          academicDetails: {
            graduation: {
              degree:
                updatedUser.academicDetails?.graduation?.degree || "B.Tech",

              branch:
                updatedUser.academicDetails?.graduation?.branch ||
                "Computer Science & Engineering",

              college: updatedUser.academicDetails?.graduation?.college || "",

              startYear:
                updatedUser.academicDetails?.graduation?.startYear || 0,

              endYear: updatedUser.academicDetails?.graduation?.endYear || 0,

              cgpa: updatedUser.academicDetails?.graduation?.cgpa || 0,
            },

            class12: {
              school: updatedUser.academicDetails?.class12?.school || "",

              board: updatedUser.academicDetails?.class12?.board || "",

              year: updatedUser.academicDetails?.class12?.year || 0,

              percentage: updatedUser.academicDetails?.class12?.percentage || 0,
            },

            class10: {
              school: updatedUser.academicDetails?.class10?.school || "",

              board: updatedUser.academicDetails?.class10?.board || "",

              year: updatedUser.academicDetails?.class10?.year || 0,

              percentage: updatedUser.academicDetails?.class10?.percentage || 0,
            },
          },

          linkedin: updatedUser.linkedin || "",

          github: updatedUser.github || "",

          portfolio: updatedUser.portfolio || "",

          skills: updatedUser.skills || [],

          projects: updatedUser.projects || [],

          resume: updatedUser.resume || "",
        });
      }
      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to save profile:", error);

      setSaveError(
        error.message || "Failed to save profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     SKILLS
  ========================= */

  const addSkill = () => {
    const skill = newSkill.trim();

    if (!skill) return;

    const skills = draft.skills || [];

    if (!skills.includes(skill)) {
      set("skills", [...skills, skill]);
    }

    setNewSkill("");
  };

  const removeSkill = (skillToRemove) => {
    set(
      "skills",
      (draft.skills || []).filter((skill) => skill !== skillToRemove),
    );
  };

  /* =========================
     PROJECTS
  ========================= */

  const handleProjectChange = (key, value) => {
    setNewProject((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const addProject = () => {
    if (!newProject.name.trim()) return;

    const project = {
      name: newProject.name.trim(),
      tech: newProject.tech
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      description: newProject.description.trim(),
      link: newProject.link.trim(),
    };

    set("projects", [...(draft.projects || []), project]);

    setNewProject({
      name: "",
      tech: "",
      description: "",
      link: "",
    });
  };

  const removeProject = (index) => {
    setDraft((prev) => ({
      ...prev,
      projects: (prev.projects || []).filter(
        (_, projectIndex) => projectIndex !== index,
      ),
    }));
  };

  const handlePasswordChange = async () => {
    if (passwordSaving) return;

    if (!oldPassword) {
      setPasswordMsg({
        text: "Enter your current password.",
        ok: false,
      });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMsg({
        text: "New password must be at least 8 characters.",
        ok: false,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({
        text: "Passwords do not match.",
        ok: false,
      });
      return;
    }

    try {
      setPasswordSaving(true);
      await changePassword({
        currentPassword: oldPassword,
        newPassword,
      });

      setPasswordMsg({
        text: "Password updated successfully.",
        ok: true,
      });

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordMsg({
        text: error.message || "Failed to update password.",
        ok: false,
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setResumeMsg("");
    setResumeUploading(true);

    try {
      const response = await uploadResume(file);
      const updatedDraft = { ...draft, resume: response.resume.id };
      set("resume", response.resume.id);
      if (onSave) await onSave(updatedDraft);
      setResumeMsg("Resume uploaded successfully.");
    } catch (error) {
      setResumeMsg(error.message || "Failed to upload resume.");
    } finally {
      setResumeUploading(false);
    }
  };

  const handleResumeDelete = async () => {
    setResumeMsg("");

    try {
      await deleteResume();
      set("resume", "");
      if (onSave) await onSave({ ...draft, resume: "" });
      setResumeMsg("Resume removed successfully.");
    } catch (error) {
      setResumeMsg(error.message || "Failed to remove resume.");
    }
  };

  /* =========================
     CHANGE DETECTION
  ========================= */

  const hasChanges =
    JSON.stringify(draft) !==
    JSON.stringify({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",

      rollNumber: user?.rollNumber || "",
      activeBacklogs: user?.activeBacklogs ?? 0,

      academicDetails: {
        graduation: {
          degree: user?.academicDetails?.graduation?.degree || "B.Tech",

          branch:
            user?.academicDetails?.graduation?.branch ||
            "Computer Science & Engineering",

          college: user?.academicDetails?.graduation?.college || "",

          startYear: user?.academicDetails?.graduation?.startYear || 0,

          endYear: user?.academicDetails?.graduation?.endYear || 0,

          cgpa: user?.academicDetails?.graduation?.cgpa || 0,
        },

        class12: {
          school: user?.academicDetails?.class12?.school || "",

          board: user?.academicDetails?.class12?.board || "",

          year: user?.academicDetails?.class12?.year || 0,

          percentage: user?.academicDetails?.class12?.percentage || 0,
        },

        class10: {
          school: user?.academicDetails?.class10?.school || "",

          board: user?.academicDetails?.class10?.board || "",

          year: user?.academicDetails?.class10?.year || 0,

          percentage: user?.academicDetails?.class10?.percentage || 0,
        },
      },

      linkedin: user?.linkedin || "",
      github: user?.github || "",
      portfolio: user?.portfolio || "",

      skills: user?.skills || [],
      projects: user?.projects || [],
      resume: user?.resume || "",
    });

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#f0f6ff" }}
    >
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title="Settings" onNav={onNav} />

        <main className="min-w-0 flex-1 overflow-y-auto px-3 py-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            {/* =========================
                SAVED MESSAGE
            ========================= */}

            {saved && (
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 text-sm font-medium"
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #86efac",
                  color: "#15803d",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Profile updated successfully!
              </div>
            )}
            {saveError && (
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 text-sm font-medium"
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#dc2626",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>

                {saveError}
              </div>
            )}

            {/* =========================
                TAB BAR
            ========================= */}

            <div
              className="flex gap-1 p-1 mb-6 rounded-xl overflow-x-auto"
              style={{
                background: "white",
                border: "1px solid #e2e8f0",
              }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-1 min-w-max flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background:
                      activeTab === tab.id ? "#1d4ed8" : "transparent",

                    color: activeTab === tab.id ? "white" : "#64748b",

                    fontFamily: "var(--font-display)",
                  }}
                >
                  {tab.icon}

                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* =========================
                CONTENT
            ========================= */}

            <div
              className="bg-white rounded-2xl p-6"
              style={{
                border: "1px solid #e2e8f0",
              }}
            >
              {/* =====================================================
                  PERSONAL
              ===================================================== */}

              {activeTab === "personal" && (
                <div>
                  <SectionHeader
                    title="Personal Information"
                    subtitle="Update your basic personal details."
                  />

                  {/* Avatar */}
                  <div
                    className="flex items-center gap-4 mb-6 pb-6"
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                      style={{
                        background: "linear-gradient(135deg, #1d4ed8, #60a5fa)",
                      }}
                    >
                      {draft.firstName?.[0] || ""}
                      {draft.lastName?.[0] || ""}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {draft.firstName} {draft.lastName}
                      </p>

                      <p className="text-xs text-slate-500 mt-0.5">
                        Student Profile
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="First Name"
                      value={draft.firstName}
                      onChange={(value) => set("firstName", value)}
                    />

                    <Field
                      label="Last Name"
                      value={draft.lastName}
                      onChange={(value) => set("lastName", value)}
                    />

                    <Field
                      label="Phone Number"
                      value={draft.phone}
                      onChange={(value) => set("phone", value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              )}

              {/* =====================================================
                  ACADEMIC
              ===================================================== */}

              {activeTab === "academic" && (
                <div>
                  <SectionHeader
                    title="Academic Details"
                    subtitle="Keep your academic information up to date."
                  />

                  {/* Basic */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Roll Number"
                      value={draft.rollNumber}
                      onChange={(value) => set("rollNumber", value)}
                      placeholder="Enter roll number"
                    />

                    <Field
                      label="Active Backlogs"
                      type="number"
                      value={draft.activeBacklogs}
                      onChange={(value) =>
                        set("activeBacklogs", Number(value) || 0)
                      }
                      placeholder="0"
                    />
                  </div>

                  {/* Graduation */}
                  <div
                    className="mt-7 pt-5"
                    style={{
                      borderTop: "1px solid #f1f5f9",
                    }}
                  >
                    <h4 className="text-sm font-semibold text-slate-800 mb-4">
                      Graduation
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field
                        label="Degree"
                        value={draft.academicDetails.graduation.degree}
                        onChange={(value) =>
                          setAcademic("graduation", "degree", value)
                        }
                      />

                      <SelectField
                        label="Branch / Department"
                        value={draft.academicDetails.graduation.branch}
                        onChange={(value) =>
                          setAcademic("graduation", "branch", value)
                        }
                        options={[
                          "Computer Science & Engineering",
                          "Electronics & Communication",
                          "Information Technology",
                          "Electrical Engineering",
                          "Mechanical Engineering",
                          "Civil Engineering",
                        ]}
                      />

                      <Field
                        label="College"
                        value={draft.academicDetails.graduation.college}
                        onChange={(value) =>
                          setAcademic("graduation", "college", value)
                        }
                        placeholder="Enter college name"
                      />

                      <Field
                        label="Start Year"
                        type="number"
                        value={draft.academicDetails.graduation.startYear || ""}
                        onChange={(value) =>
                          setAcademic(
                            "graduation",
                            "startYear",
                            Number(value) || 0,
                          )
                        }
                        placeholder="e.g. 2022"
                      />

                      <Field
                        label="End Year"
                        type="number"
                        value={draft.academicDetails.graduation.endYear || ""}
                        onChange={(value) =>
                          setAcademic(
                            "graduation",
                            "endYear",
                            Number(value) || 0,
                          )
                        }
                        placeholder="e.g. 2026"
                      />

                      <Field
                        label="CGPA"
                        type="number"
                        value={draft.academicDetails.graduation.cgpa || ""}
                        onChange={(value) =>
                          setAcademic("graduation", "cgpa", Number(value) || 0)
                        }
                        placeholder="e.g. 8.5"
                      />
                    </div>
                  </div>

                  {/* Class XII */}
                  <div
                    className="mt-7 pt-5"
                    style={{
                      borderTop: "1px solid #f1f5f9",
                    }}
                  >
                    <h4 className="text-sm font-semibold text-slate-800 mb-4">
                      Class XII
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field
                        label="School"
                        value={draft.academicDetails.class12.school}
                        onChange={(value) =>
                          setAcademic("class12", "school", value)
                        }
                        placeholder="Enter school name"
                      />

                      <Field
                        label="Board"
                        value={draft.academicDetails.class12.board}
                        onChange={(value) =>
                          setAcademic("class12", "board", value)
                        }
                        placeholder="e.g. CBSE"
                      />

                      <Field
                        label="Year"
                        type="number"
                        value={draft.academicDetails.class12.year || ""}
                        onChange={(value) =>
                          setAcademic("class12", "year", Number(value) || 0)
                        }
                        placeholder="e.g. 2022"
                      />

                      <Field
                        label="Percentage"
                        type="number"
                        value={draft.academicDetails.class12.percentage || ""}
                        onChange={(value) =>
                          setAcademic(
                            "class12",
                            "percentage",
                            Number(value) || 0,
                          )
                        }
                        placeholder="e.g. 92.5"
                      />
                    </div>
                  </div>

                  {/* Class X */}
                  <div
                    className="mt-7 pt-5"
                    style={{
                      borderTop: "1px solid #f1f5f9",
                    }}
                  >
                    <h4 className="text-sm font-semibold text-slate-800 mb-4">
                      Class X
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field
                        label="School"
                        value={draft.academicDetails.class10.school}
                        onChange={(value) =>
                          setAcademic("class10", "school", value)
                        }
                        placeholder="Enter school name"
                      />

                      <Field
                        label="Board"
                        value={draft.academicDetails.class10.board}
                        onChange={(value) =>
                          setAcademic("class10", "board", value)
                        }
                        placeholder="e.g. CBSE"
                      />

                      <Field
                        label="Year"
                        type="number"
                        value={draft.academicDetails.class10.year || ""}
                        onChange={(value) =>
                          setAcademic("class10", "year", Number(value) || 0)
                        }
                        placeholder="e.g. 2020"
                      />

                      <Field
                        label="Percentage"
                        type="number"
                        value={draft.academicDetails.class10.percentage || ""}
                        onChange={(value) =>
                          setAcademic(
                            "class10",
                            "percentage",
                            Number(value) || 0,
                          )
                        }
                        placeholder="e.g. 94"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* =====================================================
                  LINKS & SKILLS
              ===================================================== */}

              {activeTab === "social" && (
                <div>
                  <SectionHeader
                    title="Links & Skills"
                    subtitle="Add your online profiles and technical skills."
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <Field
                      label="LinkedIn Profile"
                      value={draft.linkedin}
                      onChange={(value) => set("linkedin", value)}
                      placeholder="https://linkedin.com/in/username"
                      icon="in"
                    />

                    <Field
                      label="GitHub Profile"
                      value={draft.github}
                      onChange={(value) => set("github", value)}
                      placeholder="https://github.com/username"
                      icon="gh"
                    />

                    <div className="sm:col-span-2">
                      <Field
                        label="Portfolio / Personal Website"
                        value={draft.portfolio}
                        onChange={(value) => set("portfolio", value)}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>

                  {/* Skills */}
                  <div
                    className="pt-5"
                    style={{
                      borderTop: "1px solid #f1f5f9",
                    }}
                  >
                    <label className="block text-xs font-semibold text-slate-600 mb-3">
                      Technical Skills
                    </label>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {(draft.skills || []).map((skill) => (
                        <span
                          key={skill}
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
                          style={{
                            background: "#eff6ff",
                            color: "#1d4ed8",
                            border: "1px solid #bfdbfe",
                          }}
                        >
                          {skill}

                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="hover:text-red-500 transition-colors"
                          >
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                        placeholder="Type a skill and press Enter"
                        className="flex-1 h-10 px-3 rounded-xl text-sm outline-none"
                        style={{
                          border: "1px solid #e2e8f0",
                          color: "#334155",
                        }}
                      />

                      <button
                        type="button"
                        onClick={addSkill}
                        className="px-5 h-10 rounded-xl text-xs font-semibold text-white"
                        style={{
                          background:
                            "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* =====================================================
                  PROJECTS
              ===================================================== */}

              {activeTab === "projects" && (
                <div>
                  <SectionHeader
                    title="Projects"
                    subtitle="Add projects that showcase your skills and experience."
                  />

                  {/* Existing projects */}
                  <div className="space-y-3 mb-6">
                    {(draft.projects || []).length > 0 ? (
                      draft.projects.map((project, index) => (
                        <div
                          key={project._id || index}
                          className="p-4 rounded-xl"
                          style={{
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-semibold text-slate-800">
                                {project.name}
                              </h4>

                              {project.description && (
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                  {project.description}
                                </p>
                              )}

                              {project.tech?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                  {project.tech.map((tech) => (
                                    <span
                                      key={tech}
                                      className="text-[10px] font-medium px-2 py-1 rounded-md"
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

                              {project.link && (
                                <a
                                  href={
                                    project.link.startsWith("http")
                                      ? project.link
                                      : `https://${project.link}`
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-block mt-3 text-xs text-blue-600 hover:underline"
                                >
                                  View Project →
                                </a>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => removeProject(index)}
                              className="text-xs text-slate-400 hover:text-red-500"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400">
                        No projects added yet.
                      </p>
                    )}
                  </div>

                  {/* Add project */}
                  <div
                    className="pt-5"
                    style={{
                      borderTop: "1px solid #f1f5f9",
                    }}
                  >
                    <h4 className="text-sm font-semibold text-slate-800 mb-4">
                      Add New Project
                    </h4>

                    <div className="space-y-4">
                      <Field
                        label="Project Name"
                        value={newProject.name}
                        onChange={(value) => handleProjectChange("name", value)}
                        placeholder="e.g. Placement Portal"
                      />

                      <Field
                        label="Technologies"
                        value={newProject.tech}
                        onChange={(value) => handleProjectChange("tech", value)}
                        placeholder="React, Node.js, MongoDB"
                      />

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Description
                        </label>

                        <textarea
                          rows={3}
                          value={newProject.description}
                          onChange={(e) =>
                            handleProjectChange("description", e.target.value)
                          }
                          placeholder="Describe your project..."
                          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                          style={{
                            border: "1px solid #e2e8f0",
                            color: "#334155",
                          }}
                        />
                      </div>

                      <Field
                        label="Project Link"
                        value={newProject.link}
                        onChange={(value) => handleProjectChange("link", value)}
                        placeholder="https://github.com/username/project"
                      />

                      <button
                        type="button"
                        onClick={addProject}
                        disabled={!newProject.name.trim()}
                        className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white disabled:opacity-40"
                        style={{
                          background:
                            "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                        }}
                      >
                        Add Project
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* =====================================================
                  RESUME
              ===================================================== */}

              {activeTab === "resume" && (
                <div>
                  <SectionHeader
                    title="Resume"
                    subtitle="Add or update your resume."
                  />

                  {draft.resume ? (
                    <div
                      className="rounded-2xl p-5"
                      style={{
                        background: "#f0fdf4",
                        border: "1px solid #86efac",
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{
                            background: "#dcfce7",
                          }}
                        >
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#16a34a"
                            strokeWidth="2"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-green-800">
                            Resume uploaded
                          </p>

                          <p className="text-xs text-green-600 truncate">
                            {user?.resumeName || "Resume stored securely"}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleResumeDelete}
                          className="text-xs text-slate-400 hover:text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="rounded-2xl p-8 text-center"
                      style={{
                        background: "#f8fafc",
                        border: "1px dashed #cbd5e1",
                      }}
                    >
                      <svg
                        className="mx-auto mb-3"
                        width="30"
                        height="30"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="1.5"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>

                      <p className="text-sm font-semibold text-slate-700">
                        No resume uploaded
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        Upload a PDF or DOCX file, up to 5MB.
                      </p>

                      <input
                        ref={resumeInputRef}
                        type="file"
                        accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
                        onChange={handleResumeUpload}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => resumeInputRef.current?.click()}
                        disabled={resumeUploading}
                        className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-50"
                        style={{
                          background:
                            "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                        }}
                      >
                        {resumeUploading ? "Uploading..." : "Choose Resume"}
                      </button>
                    </div>
                  )}

                  {resumeMsg && (
                    <p className="text-xs text-slate-500 mt-4">{resumeMsg}</p>
                  )}
                </div>
              )}

              {/* =====================================================
                  SECURITY
              ===================================================== */}

              {activeTab === "security" && (
                <div>
                  <SectionHeader
                    title="Security"
                    subtitle="Manage your password and account security."
                  />

                  <div className="space-y-4 max-w-md">
                    {/* Current Password */}
                    <Field
                      label="Current Password"
                      type="password"
                      value={oldPassword}
                      onChange={setOldPassword}
                      placeholder="Enter current password"
                    />

                    {/* New Password */}
                    <div>
                      <Field
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={setNewPassword}
                        placeholder="At least 8 characters"
                      />

                      {newPassword && (
                        <div className="flex gap-1 mt-1.5">
                          {[...Array(4)].map((_, index) => (
                            <div
                              key={index}
                              className="flex-1 h-1 rounded-full transition-all"
                              style={{
                                background:
                                  newPassword.length > index * 2 + 2
                                    ? newPassword.length >= 12
                                      ? "#10b981"
                                      : newPassword.length >= 8
                                        ? "#f59e0b"
                                        : "#ef4444"
                                    : "#e2e8f0",
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Confirm */}
                    <Field
                      label="Confirm New Password"
                      type="password"
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      placeholder="Re-enter new password"
                    />

                    {/* Message */}
                    {passwordMsg && (
                      <div
                        className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg"
                        style={{
                          background: passwordMsg.ok ? "#f0fdf4" : "#fef2f2",

                          color: passwordMsg.ok ? "#15803d" : "#dc2626",
                        }}
                      >
                        {passwordMsg.ok ? (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                        )}

                        {passwordMsg.text}
                      </div>
                    )}

                    <button
                      onClick={handlePasswordChange}
                      disabled={passwordSaving}
                      className="w-full h-10 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                      style={{
                        background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {passwordSaving ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* =========================
                SAVE BAR
            ========================= */}

            {activeTab !== "security" && (
              <div className="flex items-center justify-between mt-5 px-1 gap-4">
                {hasChanges ? (
                  <p className="text-xs text-amber-600 flex items-center gap-1.5">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    You have unsaved changes
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">All changes saved</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setDraft({
                        firstName: user?.firstName || "",
                        lastName: user?.lastName || "",
                        phone: user?.phone || "",

                        rollNumber: user?.rollNumber || "",

                        activeBacklogs: user?.activeBacklogs ?? 0,

                        academicDetails: {
                          graduation: {
                            degree:
                              user?.academicDetails?.graduation?.degree ||
                              "B.Tech",

                            branch:
                              user?.academicDetails?.graduation?.branch ||
                              "Computer Science & Engineering",

                            college:
                              user?.academicDetails?.graduation?.college || "",

                            startYear:
                              user?.academicDetails?.graduation?.startYear || 0,

                            endYear:
                              user?.academicDetails?.graduation?.endYear || 0,

                            cgpa: user?.academicDetails?.graduation?.cgpa || 0,
                          },

                          class12: {
                            school:
                              user?.academicDetails?.class12?.school || "",

                            board: user?.academicDetails?.class12?.board || "",

                            year: user?.academicDetails?.class12?.year || 0,

                            percentage:
                              user?.academicDetails?.class12?.percentage || 0,
                          },

                          class10: {
                            school:
                              user?.academicDetails?.class10?.school || "",

                            board: user?.academicDetails?.class10?.board || "",

                            year: user?.academicDetails?.class10?.year || 0,

                            percentage:
                              user?.academicDetails?.class10?.percentage || 0,
                          },
                        },

                        linkedin: user?.linkedin || "",

                        github: user?.github || "",

                        portfolio: user?.portfolio || "",

                        skills: user?.skills || [],

                        projects: user?.projects || [],

                        resume: user?.resume || "",
                      });
                    }}
                    disabled={!hasChanges}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: "#f1f5f9",
                      color: "#475569",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{
                      background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" />
                      <polyline points="7 3 7 8 15 8" />
                    </svg>

                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({ title, subtitle }) {
  return (
    <div
      className="mb-5 pb-4"
      style={{
        borderBottom: "1px solid #f1f5f9",
      }}
    >
      <h3
        className="text-base font-bold text-slate-900"
        style={{
          fontFamily: "var(--font-display)",
        }}
      >
        {title}
      </h3>

      <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
    </div>
  );
}

/* =========================================================
   INPUT FIELD
========================================================= */

function Field({ label, value, onChange, type = "text", placeholder, icon }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label}
      </label>

      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
            {icon === "in" ? "Li" : "GH"}
          </span>
        )}

        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-10 px-3 rounded-xl text-sm outline-none transition-all"
          style={{
            border: "1px solid #e2e8f0",
            fontFamily: "var(--font-body)",
            color: "#334155",
            paddingLeft: icon ? "44px" : undefined,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#2563eb";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#e2e8f0";
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   SELECT FIELD
========================================================= */

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label}
      </label>

      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded-xl text-sm outline-none transition-all"
        style={{
          border: "1px solid #e2e8f0",
          fontFamily: "var(--font-body)",
          color: "#334155",
          background: "white",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#2563eb";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#e2e8f0";
        }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
