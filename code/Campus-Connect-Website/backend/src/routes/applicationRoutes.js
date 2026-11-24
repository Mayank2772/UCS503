const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const authorize = require("../middleware/roleMiddleware");

const {
  applyToDrive,
  getMyApplications,
  getAllApplications,
  exportApplications,
  updateApplicationStatus,
} = require("../controllers/applicationController");

router.post("/apply/:driveId", protect, authorize("student"), applyToDrive);

router.get("/my", protect, authorize("student"), getMyApplications);

router.get("/", protect, authorize("admin"), getAllApplications);

router.get("/export", protect, authorize("admin"), exportApplications);

router.patch(
  "/:id/status",
  protect,
  authorize("admin"),
  updateApplicationStatus,
);

module.exports = router;
