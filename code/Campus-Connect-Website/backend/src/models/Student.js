const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // =========================
    // BASIC INFORMATION
    // =========================

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
    },

    rollNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    // =========================
    // ACADEMIC DETAILS
    // =========================
    academicDetails: {
      graduation: {
        degree: {
          type: String,
          default: "B.Tech",
        },

        branch: {
          type: String,
          default: "Computer Science & Engineering",
        },

        college: {
          type: String,
          default: "",
        },

        university: {
          type: String,
          default: "",
        },

        startYear: {
          type: Number,
          default: 0,
        },

        endYear: {
          type: Number,
          default: 0,
        },

        cgpa: {
          type: Number,
          default: 0,
        },
      },

      class12: {
        school: {
          type: String,
          default: "",
        },

        board: {
          type: String,
          default: "",
        },

        year: {
          type: Number,
          default: 0,
        },

        percentage: {
          type: Number,
          default: 0,
        },
      },

      class10: {
        school: {
          type: String,
          default: "",
        },

        board: {
          type: String,
          default: "",
        },

        year: {
          type: Number,
          default: 0,
        },

        percentage: {
          type: Number,
          default: 0,
        },
      },
    },

    // =========================
    // BACKLOGS
    // =========================

    activeBacklogs: {
      type: Number,
      default: 0,
    },

    // =========================
    // OTHER PROFILE INFORMATION
    // =========================

    linkedin: {
      type: String,
      default: "",
    },

    github: {
      type: String,
      default: "",
    },

    portfolio: {
      type: String,
      default: "",
    },

    // =========================
    // SKILLS
    // =========================

    skills: {
      type: [String],
      default: [],
    },

    // =========================
    // PROJECTS
    // =========================

    projects: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },

        tech: {
          type: [String],
          default: [],
        },

        description: {
          type: String,
          default: "",
        },

        link: {
          type: String,
          default: "",
        },
      },
    ],
    // =========================
    // RESUME
    // =========================

    resume: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Student", studentSchema);
