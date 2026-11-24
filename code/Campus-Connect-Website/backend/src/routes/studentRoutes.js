const express = require("express");
const multer = require("multer");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const authorize = require("../middleware/roleMiddleware");

const {
  getAllStudents,
  deleteStudent,
  updateStudentByAdmin,
  getProfile,
  updateProfile,
  uploadResume,
  deleteResume,
  viewStudentResume,
  downloadResumeByToken,
} = require("../controllers/studentController");

router.get("/", protect, authorize("admin"), getAllStudents);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return callback(new Error("Only PDF and DOCX files are allowed"));
    }

    callback(null, true);
  },
});

const handleResumeUpload = (req, res, next) => {
  upload.single("resume")(req, res, (error) => {
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    next();
  });
};

router.get("/profile", protect, authorize("student"), getProfile);

router.put("/profile", protect, authorize("student"), updateProfile);

router.post(
  "/resume",
  protect,
  authorize("student"),
  handleResumeUpload,
  uploadResume,
);

router.delete("/resume", protect, authorize("student"), deleteResume);

router.get("/resume-download/:token", downloadResumeByToken);

router.get("/:id/resume", protect, authorize("admin"), viewStudentResume);

router.put("/:id", protect, authorize("admin"), updateStudentByAdmin);

router.delete("/:id", protect, authorize("admin"), deleteStudent);

module.exports = router;
