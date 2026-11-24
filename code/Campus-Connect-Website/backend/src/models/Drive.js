const mongoose = require("mongoose");

const driveSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["Full-Time", "Internship", "PPO"],
      default: "Full-Time",
    },

    ctc: {
      type: String,
      required: true,
    },

    ctcRange: {
      type: String,
      default: "",
    },

    mode: {
      type: String,
      enum: ["On-Campus", "Off-Campus", "Virtual"],
      default: "On-Campus",
    },

    cgpa: {
      type: Number,
      default: 0,
    },

    backlog: {
      type: Boolean,
      default: false,
    },

    branches: {
      type: [String],
      default: [],
    },

    applied: {
      type: Number,
      default: 0,
    },

    package: {
      type: String,
      default: "",
    },

    jobType: {
      type: String,
      enum: ["Full-Time", "Internship", "PPO"],
      default: "Full-Time",
    },

    deadline: {
      type: Date,
      required: true,
    },

    openings: {
      type: Number,
      default: 1,
    },

    minimumCGPA: {
      type: Number,
      default: 0,
    },

    allowedBranches: {
      type: [String],
      default: [],
    },

    maximumBacklogs: {
      type: Number,
      default: 0,
    },

    tenthPercentage: {
      type: Number,
      default: 0,
    },

    twelfthPercentage: {
      type: Number,
      default: 0,
    },

    description: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["Active", "Closed"],
      default: "Active",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Drive", driveSchema);
