const Drive = require("../models/Drive");
const Student = require("../models/Student");
const Application = require("../models/Application");

const checkEligibility = require("../services/eligibilityService");
const { notifyStudentsAboutDrive } = require("../services/notificationService");

async function findDuplicateCompany(company, excludedId) {
  const normalizedCompany = String(company || "").trim();
  if (!normalizedCompany) return null;

  const query = {
    company: { $regex: `^${normalizedCompany.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
  };
  if (excludedId) query._id = { $ne: excludedId };

  return Drive.findOne(query);
}

const createDrive = async (req, res) => {
  try {
    const duplicate = await findDuplicateCompany(req.body.company);
    if (duplicate) {
      return res.status(409).json({
        message: "A placement drive for this company already exists",
      });
    }

    const driveType = req.body.type || req.body.jobType || "Full-Time";
    const drive = await Drive.create({
      ...req.body,
      type: driveType,
      jobType: driveType,
      createdBy: req.user.id,
    });

    await notifyStudentsAboutDrive(drive);

    res.status(201).json({
      message: "Placement drive created",
      drive,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid placement drive data",
        errors:
          error.name === "ValidationError"
            ? Object.values(error.errors).map((validationError) => ({
                field: validationError.path,
                message: validationError.message,
              }))
            : [{ field: error.path, message: error.message }],
      });
    }

    console.error("Create drive error:", error);
    res.status(500).json({
      message: "Unable to create placement drive",
    });
  }
};

const getDrives = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { status: "Active" };
    const drives = await Drive.find(filter).sort({
      deadline: 1,
    });

    res.json(drives);
  } catch (error) {
    console.error("Get drives error:", error);
    res.status(500).json({
      message: "Unable to load placement drives",
    });
  }
};

const getDriveById = async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id);

    if (!drive) {
      return res.status(404).json({
        message: "Drive not found",
      });
    }

    res.json(drive);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid drive ID" });
    }

    console.error("Get drive error:", error);
    res.status(500).json({
      message: "Unable to load placement drive",
    });
  }
};

const checkStudentEligibility = async (req, res) => {
  try {
    const student = await Student.findOne({
      userId: req.user.id,
    });

    const drive = await Drive.findById(req.params.id);

    if (!student || !drive) {
      return res.status(404).json({
        message: "Student or drive not found",
      });
    }

    const result = checkEligibility(student, drive);

    res.json(result);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid drive ID" });
    }

    console.error("Check drive eligibility error:", error);
    res.status(500).json({
      message: "Unable to check drive eligibility",
    });
  }
};

const updateDrive = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.company) {
      const duplicate = await findDuplicateCompany(
        updateData.company,
        req.params.id,
      );
      if (duplicate) {
        return res.status(409).json({
          message: "A placement drive for this company already exists",
        });
      }
    }

    if (updateData.type || updateData.jobType) {
      const driveType = updateData.type || updateData.jobType;
      updateData.type = driveType;
      updateData.jobType = driveType;
    }

    const drive = await Drive.findByIdAndUpdate(
      req.params.id,

      updateData,

      {
        new: true,
        runValidators: true,
      },
    );

    if (!drive) {
      return res.status(404).json({
        message: "Drive not found",
      });
    }

    res.json({
      message: "Drive updated",
      drive,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid placement drive data",
        errors:
          error.name === "ValidationError"
            ? Object.values(error.errors).map((validationError) => ({
                field: validationError.path,
                message: validationError.message,
              }))
            : [{ field: error.path, message: error.message }],
      });
    }

    console.error("Update drive error:", error);
    res.status(500).json({
      message: "Unable to update placement drive",
    });
  }
};

const deleteDrive = async (req, res) => {
  try {
    const drive = await Drive.findByIdAndDelete(req.params.id);

    if (!drive) {
      return res.status(404).json({
        message: "Drive not found",
      });
    }

    await Application.deleteMany({ drive: drive._id });

    res.json({
      message: "Drive deleted",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid drive ID" });
    }

    console.error("Delete drive error:", error);
    res.status(500).json({
      message: "Unable to delete placement drive",
    });
  }
};

module.exports = {
  createDrive,
  getDrives,
  getDriveById,
  checkStudentEligibility,
  updateDrive,
  deleteDrive,
};
