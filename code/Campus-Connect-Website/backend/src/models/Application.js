const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      unique: true,
      sparse: true,
      default: () =>
        `CC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Drive",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Applied",
        "Shortlisted",
        "Interview",
        "Offer",
        "Rejected",
        "On Hold",
      ],
      default: "Applied",
    },

    coverLetter: {
      type: String,
      default: "",
    },

    resume: {
      type: String,
      default: "",
    },

    phone: { type: String, default: "" },
    rollNumber: { type: String, default: "" },
    branch: { type: String, default: "" },
    semester: { type: String, default: "" },
    cgpa: { type: String, default: "" },
    tenthPercent: { type: String, default: "" },
    twelfthPercent: { type: String, default: "" },
    backlogs: { type: String, default: "" },
    referral: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
    portfolio: { type: String, default: "" },
    declaration: { type: Boolean, default: false },

    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

applicationSchema.index(
  {
    student: 1,
    drive: 1,
  },
  {
    unique: true,
  },
);

module.exports = mongoose.model("Application", applicationSchema);
