const express = require("express");

const router = express.Router();

const protect =
    require("../middleware/authMiddleware");

const authorize =
    require("../middleware/roleMiddleware");

const {
    createDrive,
    getDrives,
    getDriveById,
    checkStudentEligibility,
    updateDrive,
    deleteDrive
} =
    require("../controllers/driveController");


router.get(
    "/",
    protect,
    getDrives
);


router.get(
    "/:id",
    protect,
    getDriveById
);


router.get(
    "/:id/eligibility",
    protect,
    authorize("student"),
    checkStudentEligibility
);


router.post(
    "/",
    protect,
    authorize("admin"),
    createDrive
);


router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateDrive
);


router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteDrive
);


module.exports = router;