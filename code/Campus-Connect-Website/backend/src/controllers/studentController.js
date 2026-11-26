const Student = require("../models/Student");
const Document = require("../models/Document");
const User = require("../models/User");
const Application = require("../models/Application");
const Notification = require("../models/Notification");
const jwt = require("jsonwebtoken");

const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(students);
  } catch (error) {
    console.error("Get students error:", error);

    return res.status(500).json({
      message: "Failed to fetch students",
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const student = await Student.findOne({
      userId: req.user.id,
    }).populate("userId", "name email role");

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    return res.status(200).json(student);
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      message: "Failed to fetch student profile",
    });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    await Promise.all([
      Application.deleteMany({ student: student._id }),
      Document.deleteMany({ studentId: student._id }),
      Notification.deleteMany({ userId: student.userId }),
      Student.deleteOne({ _id: student._id }),
      User.deleteOne({ _id: student.userId, role: "student" }),
    ]);

    return res.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Delete student error:", error);
    return res.status(500).json({ message: "Failed to delete student" });
  }
};

const updateStudentByAdmin = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      rollNumber,
      academicDetails,
      activeBacklogs,
    } = req.body;
    const updateData = {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(phone !== undefined && { phone }),
      ...(rollNumber !== undefined && { rollNumber }),
      ...(activeBacklogs !== undefined && { activeBacklogs }),
    };

    if (academicDetails?.graduation) {
      Object.entries(academicDetails.graduation).forEach(([key, value]) => {
        updateData[`academicDetails.graduation.${key}`] = value;
      });
    }

    if (academicDetails?.class10) {
      Object.entries(academicDetails.class10).forEach(([key, value]) => {
        updateData[`academicDetails.class10.${key}`] = value;
      });
    }

    if (academicDetails?.class12) {
      Object.entries(academicDetails.class12).forEach(([key, value]) => {
        updateData[`academicDetails.class12.${key}`] = value;
      });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true },
    ).populate("userId", "name email");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (firstName !== undefined || lastName !== undefined) {
      await User.findByIdAndUpdate(student.userId._id, {
        name: `${student.firstName} ${student.lastName}`.trim(),
      });
    }

    return res.json({ message: "Student updated successfully", student });
  } catch (error) {
    console.error("Admin update student error:", error);
    if (error.code === 11000) {
      return res.status(409).json({ message: "Roll number already exists" });
    }
    return res.status(400).json({ message: "Invalid student data" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      firstName,
      lastName,
      phone,
      rollNumber,
      academicDetails,
      activeBacklogs,
      linkedin,
      github,
      portfolio,
      skills,
      projects,
      resume,
    } = req.body;
    const updateData = {};
    if (firstName !== undefined) {
      updateData.firstName = firstName;
    }

    if (lastName !== undefined) {
      updateData.lastName = lastName;
    }

    if (phone !== undefined) {
      updateData.phone = phone;
    }

    if (rollNumber !== undefined) {
      updateData.rollNumber = rollNumber;
    }

    if (academicDetails !== undefined) {
      updateData.academicDetails = academicDetails;
    }

    if (activeBacklogs !== undefined) {
      updateData.activeBacklogs = activeBacklogs;
    }

    if (linkedin !== undefined) {
      updateData.linkedin = linkedin;
    }

    if (github !== undefined) {
      updateData.github = github;
    }

    if (portfolio !== undefined) {
      updateData.portfolio = portfolio;
    }

    if (skills !== undefined) {
      updateData.skills = skills;
    }

    if (projects !== undefined) {
      updateData.projects = projects;
    }

    if (resume !== undefined) {
      updateData.resume = resume;
    }

    /*
     * Find the student's document using the authenticated
     * user's ID and update it.
     */
    const student = await Student.findOneAndUpdate(
      {
        userId: userId,
      },
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      student,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    /*
     * Duplicate roll number
     */
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Roll number already exists",
      });
    }

    /*
     * Mongoose validation error
     */
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid profile data",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    return res.status(500).json({
      message: "Failed to update student profile",
    });
  }
};

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "A PDF or DOCX resume is required",
      });
    }

    const student = await Student.findOne({ userId: req.user.id });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const document = await Document.findOneAndUpdate(
      {
        studentId: student._id,
        documentType: "resume",
      },
      {
        $set: {
          fileName: req.file.originalname,
          mimeType: req.file.mimetype,
          fileSize: req.file.size,
          data: req.file.buffer,
          filePath: "database",
          verificationStatus: "pending",
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    student.resume = document._id.toString();
    await student.save();

    return res.status(200).json({
      message: "Resume uploaded successfully",
      resume: {
        id: document._id,
        fileName: document.fileName,
        fileSize: document.fileSize,
        mimeType: document.mimeType,
      },
    });
  } catch (error) {
    console.error("Resume upload error:", error);

    return res.status(500).json({
      message: "Failed to upload resume",
    });
  }
};

const deleteResume = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    await Document.deleteOne({
      studentId: student._id,
      documentType: "resume",
    });

    student.resume = "";
    await student.save();

    return res.status(200).json({ message: "Resume removed successfully" });
  } catch (error) {
    console.error("Resume delete error:", error);
    return res.status(500).json({ message: "Failed to remove resume" });
  }
};

const viewStudentResume = async (req, res) => {
  try {
    const document = await Document.findOne({
      studentId: req.params.id,
      documentType: "resume",
    }).select("fileName mimeType data");

    if (!document) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.set({
      "Content-Type": document.mimeType,
      "Content-Disposition": `inline; filename="${document.fileName.replace(/["\\]/g, "")}"`,
      "Content-Length": document.data.length,
      "Cache-Control": "private, no-store",
    });
    return res.send(document.data);
  } catch (error) {
    console.error("View student resume error:", error);
    return res.status(500).json({ message: "Failed to load resume" });
  }
};

const downloadResumeByToken = async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    if (decoded.role !== "admin" || decoded.purpose !== "resume-download") {
      return res.status(401).json({ message: "Invalid resume download link" });
    }

    const document = await Document.findOne({
      studentId: decoded.studentId,
      documentType: "resume",
    }).select("fileName mimeType data");

    if (!document) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.set({
      "Content-Type": document.mimeType,
      "Content-Disposition": `attachment; filename="${document.fileName.replace(/["\\]/g, "")}"`,
      "Content-Length": document.data.length,
      "Cache-Control": "private, no-store",
    });
    return res.send(document.data);
  } catch (error) {
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid or expired resume link" });
    }

    console.error("Token resume download error:", error);
    return res.status(500).json({ message: "Failed to download resume" });
  }
};

module.exports = {
  getAllStudents,
  deleteStudent,
  updateStudentByAdmin,
  getProfile,
  updateProfile,
  uploadResume,
  deleteResume,
  viewStudentResume,
  downloadResumeByToken,
};
