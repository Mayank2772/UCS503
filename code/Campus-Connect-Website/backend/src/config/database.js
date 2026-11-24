const mongoose = require("mongoose");
const Drive = require("../models/Drive");

const normalizeDriveType = (value) => {
  const normalized = String(value || "").toLowerCase();
  if (normalized.includes("ppo")) return "PPO";
  if (normalized.includes("intern")) return "Internship";
  return "Full-Time";
};

const migrateDriveTypes = async () => {
  const drives = await Drive.find({}).select("type jobType");
  const operations = drives
    .map((drive) => {
      const normalizedType = normalizeDriveType(drive.type || drive.jobType);
      if (drive.type === normalizedType && drive.jobType === normalizedType) {
        return null;
      }
      return {
        updateOne: {
          filter: { _id: drive._id },
          update: { $set: { type: normalizedType, jobType: normalizedType } },
        },
      };
    })
    .filter(Boolean);

  if (operations.length > 0) await Drive.bulkWrite(operations);
  console.log(
    `Drive type migration complete: ${operations.length} record(s) updated`,
  );
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await migrateDriveTypes();

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error.message);

    process.exit(1);
  }
};

module.exports = connectDB;
