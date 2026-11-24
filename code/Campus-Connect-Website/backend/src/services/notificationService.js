const User = require("../models/User");
const Notification = require("../models/Notification");

const notifyStudentsAboutDrive = async (drive) => {
  const students = await User.find({ role: "student" }).select("_id");

  if (students.length === 0) return;

  await Notification.insertMany(
    students.map((student) => ({
      userId: student._id,
      type: "drive",
      message: `${drive.company} posted a new ${drive.type} placement drive for ${drive.role}.`,
    })),
  );
};

module.exports = { notifyStudentsAboutDrive };
