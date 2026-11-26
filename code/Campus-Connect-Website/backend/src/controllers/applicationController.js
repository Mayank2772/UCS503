const Application = require("../models/Application");
const jwt = require("jsonwebtoken");

const Student = require("../models/Student");

const Drive = require("../models/Drive");

const checkEligibility = require("../services/eligibilityService");

const escapeExcelCell = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const escapeExcelUrl = (value) => String(value ?? "").replace(/["<>]/g, "");

const applyToDrive = async (req, res) => {
  try {
    console.log("Apply request received for driveId:", req.params.driveId);
    console.log("User ID:", req.user?.id);

    const student = await Student.findOne({
      userId: req.user.id,
    });

    const drive = await Drive.findById(req.params.driveId);

    if (!student || !drive) {
      return res.status(404).json({
        message: "Student or drive not found",
      });
    }

    // Validate that student and drive have valid ObjectIds
    if (!student._id || !drive._id) {
      return res.status(400).json({
        message: "Invalid student or drive reference",
      });
    }

    const requiredFields = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      rollNumber: req.body.rollNumber,
      linkedin: req.body.linkedin,
      github: req.body.github,
      branch: req.body.branch,
      semester: req.body.semester,
      cgpa: req.body.cgpa,
      tenthPercent: req.body.tenthPercent,
      twelfthPercent: req.body.twelfthPercent,
      backlogs: req.body.backlogs,
      coverLetter: req.body.coverLetter,
    };
    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) => !String(value ?? "").trim())
      .map(([field]) => field);

    if (!student.resume && !req.body.resume) {
      missingFields.push("resume");
    }

    if (!req.body.declaration) {
      missingFields.push("declaration");
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Please complete all required application fields",
        missingFields,
      });
    }

    // Check eligibility
    const eligibility = checkEligibility(student, drive, {
      cgpa: req.body.cgpa,
      backlogs: req.body.backlogs,
      branch: req.body.branch,
    });

    if (!eligibility.eligible) {
      return res.status(400).json({
        message: "You are not eligible",
        reason: eligibility.reason,
      });
    }

    await Student.findByIdAndUpdate(student._id, {
      $set: {
        phone: req.body.phone.trim(),
        linkedin: req.body.linkedin.trim(),
        github: req.body.github.trim(),
        academicDetails: {
          ...student.academicDetails?.toObject?.(),
          graduation: {
            ...student.academicDetails?.graduation?.toObject?.(),
            branch: req.body.branch.trim(),
            cgpa: Number(req.body.cgpa),
          },
          class10: {
            ...student.academicDetails?.class10?.toObject?.(),
            percentage: Number(req.body.tenthPercent),
          },
          class12: {
            ...student.academicDetails?.class12?.toObject?.(),
            percentage: Number(req.body.twelfthPercent),
          },
        },
        activeBacklogs: Number(req.body.backlogs),
      },
    });

    // Check duplicate application
    const existing = await Application.findOne({
      student: student._id,
      drive: drive._id,
    });

    if (existing) {
      return res.status(400).json({
        message: "Already applied to this drive",
      });
    }

    const application = await Application.create({
      student: student._id,
      drive: drive._id,
      coverLetter: req.body.coverLetter || "",
      resume: student.resume || req.body.resume || "",
      phone: req.body.phone || "",
      rollNumber: req.body.rollNumber || student.rollNumber || "",
      branch: req.body.branch || "",
      semester: req.body.semester || "",
      cgpa: req.body.cgpa || "",
      tenthPercent: req.body.tenthPercent || "",
      twelfthPercent: req.body.twelfthPercent || "",
      backlogs: req.body.backlogs || "",
      referral: req.body.referral || "",
      linkedin: req.body.linkedin || "",
      github: req.body.github || "",
      portfolio: req.body.portfolio || "",
      declaration: Boolean(req.body.declaration),
    });

    await Drive.findByIdAndUpdate(drive._id, {
      $inc: { applied: 1 },
    });

    res.status(201).json({
      message: "Application submitted successfully",

      application,
    });
  } catch (error) {
    console.error("Error in applyToDrive:", error);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error stack:", error.stack);

    // Handle E11000 duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already applied to this drive",
      });
    }

    // Handle validation errors
    if (error.code === "VALIDATION_ERROR") {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Unable to submit application",
    });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const student = await Student.findOne({
      userId: req.user.id,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const applications = await Application.find({
      student: student._id,
    })
      .populate("drive")
      .sort({
        createdAt: -1,
      });

    res.json(applications);
  } catch (error) {
    console.error("Get my applications error:", error);
    res.status(500).json({
      message: "Unable to load applications",
    });
  }
};

const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("student")
      .populate("drive")
      .populate({
        path: "student",
        populate: { path: "userId", select: "name email" },
      })
      .sort({ createdAt: -1 });

    const validApplications = applications.filter(
      (application) => application.student && application.drive,
    );

    if (validApplications.length !== applications.length) {
      console.warn(
        `Ignored ${
          applications.length - validApplications.length
        } application(s) with missing student or drive references`,
      );
    }

    res.json(validApplications);
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({ message: "Unable to load applications" });
  }
};

const exportApplications = async (req, res) => {
  try {
    const filter = {};
    if (req.query.driveId) {
      filter.drive = req.query.driveId;
    }

    const applications = await Application.find(filter)
      .populate("student")
      .populate("drive")
      .populate({
        path: "student",
        populate: { path: "userId", select: "name email" },
      })
      .sort({ createdAt: -1 });

    const rows = applications
      .filter((application) => application.student && application.drive)
      .map((application) => {
        const student = application.student;
        const drive = application.drive;
        const graduation = student.academicDetails?.graduation || {};
        const resumeUrl = student.resume
          ? `${req.protocol}://${req.get("host")}/api/students/resume-download/${encodeURIComponent(
              jwt.sign(
                {
                  studentId: String(student._id),
                  role: "admin",
                  purpose: "resume-download",
                },
                process.env.JWT_SECRET,
                { expiresIn: "24h" },
              ),
            )}`
          : "";

        return [
          `${student.firstName || ""} ${student.lastName || ""}`.trim(),
          student.userId?.email,
          student.phone || application.phone,
          student.rollNumber || application.rollNumber,
          graduation.degree,
          graduation.branch || application.branch,
          application.cgpa || graduation.cgpa,
          drive.company,
          drive.role,
          application.status,
          new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }).format(new Date(application.appliedAt || application.createdAt)),
          resumeUrl
            ? `<a href="${escapeExcelUrl(resumeUrl)}">Download resume</a>`
            : "No resume uploaded",
        ];
      });

    const headers = [
      "Student name",
      "Email",
      "Phone",
      "Roll number",
      "Degree",
      "Branch",
      "CGPA",
      "Company",
      "Role",
      "Application status",
      "Applied on",
      "Resume",
    ];
    const tableRows = [headers, ...rows]
      .map((row, rowIndex) => {
        const cellTag = rowIndex === 0 ? "th" : "td";
        const cellStyle =
          rowIndex === 0
            ? "border:1px solid #cbd5e1;background-color:#eaf0fb;padding:6px;"
            : "border:1px solid #cbd5e1;padding:6px;";

        return `<tr>${row
          .map((cell) => {
            const content =
              typeof cell === "string" && cell.startsWith("<a ")
                ? cell
                : escapeExcelCell(cell);
            return `<${cellTag} style="${cellStyle}">${content}</${cellTag}>`;
          })
          .join("")}</tr>`;
      })
      .join("");
    const workbook = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;border:1px solid #cbd5e1;">${tableRows}</table></body></html>`;
    const suffix = req.query.driveId ? `-${req.query.driveId}` : "";

    res.set({
      "Content-Type": "application/vnd.ms-excel; charset=utf-8",
      "Content-Disposition": `attachment; filename="campus-connect-applications${suffix}.xls"`,
    });
    return res.send(workbook);
  } catch (error) {
    console.error("Export applications error:", error);
    return res.status(500).json({ message: "Failed to export applications" });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true },
    )
      .populate("student")
      .populate("drive");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(application);
  } catch (error) {
    console.error("Update application status error:", error);
    res.status(500).json({ message: "Unable to update application status" });
  }
};

module.exports = {
  applyToDrive,
  getMyApplications,
  getAllApplications,
  exportApplications,
  updateApplicationStatus,
};
