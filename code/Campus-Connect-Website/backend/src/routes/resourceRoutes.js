const express = require("express");
const multer = require("multer");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const {
  getResources,
  createResource,
  downloadResource,
  deleteResource,
} = require("../controllers/resourceController");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

router.get("/", protect, getResources);
router.get("/:id/file", protect, downloadResource);
router.post(
  "/",
  protect,
  authorize("admin"),
  (req, res, next) => {
    upload.single("file")(req, res, (error) => {
      if (error) return res.status(400).json({ message: error.message });
      next();
    });
  },
  createResource,
);
router.delete("/:id", protect, authorize("admin"), deleteResource);

module.exports = router;
