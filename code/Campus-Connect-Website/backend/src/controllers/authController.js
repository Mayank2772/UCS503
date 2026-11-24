const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Student = require("../models/Student");
const RegistrationOtp = require("../models/RegistrationOtp");
const PasswordResetOtp = require("../models/PasswordResetOtp");

const generateToken = require("../utils/jwt");
const {
  sendWelcomeEmail,
  sendRegistrationOtpEmail,
  sendPasswordResetOtpEmail,
} = require("../services/emailService");
const { isThaparEmail } = require("../utils/validators");

const OTP_EXPIRY_MINUTES = 10;

const requestPasswordResetOtp = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();

    if (!email || !isThaparEmail(email)) {
      return res.status(400).json({
        message: "Please enter a valid @thapar.edu email address",
      });
    }

    const user = await User.findOne({ email, role: "student" });

    if (!user) {
      return res.status(404).json({
        message: "No student account was found for this email address",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = await bcrypt.hash(otp, 10);

    await PasswordResetOtp.findOneAndUpdate(
      { email },
      {
        email,
        otpHash,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    try {
      await sendPasswordResetOtpEmail({ email, otp });
    } catch (error) {
      await PasswordResetOtp.deleteOne({ email });
      console.error("Password reset OTP email error:", error);
      return res.status(503).json({
        message: "Unable to send reset code. Please try again later.",
      });
    }

    return res.json({
      message: "Password reset code sent to your email",
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    });
  } catch (error) {
    console.error("Request password reset OTP error:", error);
    return res.status(500).json({ message: "Unable to send reset code" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    if (
      !normalizedEmail ||
      !/^\d{6}$/.test(String(otp)) ||
      !newPassword ||
      newPassword.length < 6
    ) {
      return res.status(400).json({
        message: "Email, a valid 6-digit code and a password of at least 6 characters are required",
      });
    }

    const pendingReset = await PasswordResetOtp.findOne({
      email: normalizedEmail,
    });

    if (!pendingReset || pendingReset.expiresAt <= new Date()) {
      if (pendingReset) {
        await PasswordResetOtp.deleteOne({ _id: pendingReset._id });
      }
      return res.status(400).json({
        message: "Reset code expired or not requested",
      });
    }

    const validOtp = await bcrypt.compare(String(otp), pendingReset.otpHash);

    if (!validOtp) {
      return res.status(400).json({ message: "Invalid reset code" });
    }

    const user = await User.findOne({ email: normalizedEmail, role: "student" });

    if (!user) {
      return res.status(404).json({ message: "Student account not found" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    await PasswordResetOtp.deleteOne({ _id: pendingReset._id });

    return res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Unable to reset password" });
  }
};

const validateRegistrationData = ({
  firstName,
  lastName,
  email,
  password,
  rollNumber,
  branch,
}) => {
  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !rollNumber ||
    !branch
  ) {
    return "First name, last name, email, password, roll number and branch are required";
  }

  if (password.length < 6) {
    return "Password must contain at least 6 characters";
  }

  if (!isThaparEmail(email)) {
    return "Registration is only available with a @thapar.edu email address";
  }

  return null;
};

const requestRegistrationOtp = async (req, res) => {
  try {
    const registrationData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      rollNumber: req.body.rollNumber,
      branch: req.body.branch,
    };
    const validationError = validateRegistrationData(registrationData);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const normalizedEmail = registrationData.email.toLowerCase().trim();
    const normalizedRollNumber = registrationData.rollNumber.trim();

    const [existingUser, existingStudent] = await Promise.all([
      User.findOne({ email: normalizedEmail }),
      Student.findOne({ rollNumber: normalizedRollNumber }),
    ]);

    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    if (existingStudent) {
      return res.status(409).json({ message: "Roll number already registered" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = await bcrypt.hash(otp, 10);
    const passwordHash = await bcrypt.hash(registrationData.password, 10);

    await RegistrationOtp.findOneAndUpdate(
      { email: normalizedEmail },
      {
        email: normalizedEmail,
        registrationData: {
          ...registrationData,
          email: normalizedEmail,
          rollNumber: normalizedRollNumber,
          password: passwordHash,
        },
        otpHash,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    try {
      await sendRegistrationOtpEmail({ email: normalizedEmail, otp });
    } catch (error) {
      await RegistrationOtp.deleteOne({ email: normalizedEmail });
      console.error("Registration OTP email error:", error);
      return res.status(503).json({
        message: "Unable to send verification email. Please try again later.",
      });
    }

    return res.json({
      message: "Verification code sent to your email",
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    });
  } catch (error) {
    console.error("Request registration OTP error:", error);
    return res.status(500).json({ message: "Unable to send verification code" });
  }
};

const register = async (req, res) => {
  const session = await User.startSession();

  try {
    const { email, otp } = req.body;

    if (!email || !otp || !/^\d{6}$/.test(String(otp))) {
      return res.status(400).json({
        message: "A valid 6-digit verification code is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const pendingRegistration = await RegistrationOtp.findOne({
      email: normalizedEmail,
    });

    if (!pendingRegistration) {
      return res.status(400).json({
        message: "Verification code expired or not requested",
      });
    }

    if (pendingRegistration.expiresAt <= new Date()) {
      await RegistrationOtp.deleteOne({ _id: pendingRegistration._id });
      return res.status(400).json({
        message: "Verification code expired. Please request a new code.",
      });
    }

    const validOtp = await bcrypt.compare(
      String(otp),
      pendingRegistration.otpHash,
    );

    if (!validOtp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    const { firstName, lastName, password, rollNumber, branch } =
      pendingRegistration.registrationData;
    const normalizedRollNumber = rollNumber.trim();

    // =========================
    // CHECK EXISTING USER
    // =========================

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // =========================
    // CHECK EXISTING STUDENT
    // =========================

    const existingStudent = await Student.findOne({
      rollNumber: normalizedRollNumber,
    });

    if (existingStudent) {
      return res.status(409).json({
        message: "Roll number already registered",
      });
    }

    // =========================
    // The password was hashed before the pending registration was stored.
    // =========================

    const hashedPassword = password;

    // =========================
    // START TRANSACTION
    // =========================

    session.startTransaction();

    // =========================
    // CREATE USER
    // =========================

    const user = await User.create(
      [
        {
          name: `${firstName.trim()} ${lastName.trim()}`,
          email: normalizedEmail,
          password: hashedPassword,
          role: "student",
        },
      ],
      { session },
    );

    const createdUser = user[0];

    // =========================
    // CREATE STUDENT PROFILE
    // =========================

    const student = await Student.create(
      [
        {
          userId: createdUser._id,

          firstName: firstName.trim(),

          lastName: lastName.trim(),

          rollNumber: normalizedRollNumber,

          academicDetails: {
            graduation: {
              branch: branch.trim(),
            },
          },
        },
      ],
      { session },
    );

    const createdStudent = student[0];

    // =========================
    // COMMIT TRANSACTION
    // =========================

    await session.commitTransaction();
    await RegistrationOtp.deleteOne({ _id: pendingRegistration._id });

    try {
      await sendWelcomeEmail({
        email: normalizedEmail,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
    } catch (emailError) {
      console.error("Welcome email error:", emailError.message);
    }

    // =========================
    // GENERATE JWT
    // =========================

    const token = generateToken(createdUser);

    return res.status(201).json({
      message: "Registration successful",

      token,

      user: {
        id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
      },

      student: {
        id: createdStudent._id,
        firstName: createdStudent.firstName,
        lastName: createdStudent.lastName,
        rollNumber: createdStudent.rollNumber,
        academicDetails: createdStudent.academicDetails,
      },
    });
  } catch (error) {
    await session.abortTransaction();

    console.error("Registration error:", error);

    // Duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email or roll number already registered",
      });
    }

    return res.status(500).json({
      message: "Registration failed",
    });
  } finally {
    session.endSession();
  }
};

// =====================================================
// LOGIN
// =====================================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    let student = null;

    if (user.role === "student") {
      student = await Student.findOne({
        userId: user._id,
      });
    }

    return res.json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },

      student,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Login failed",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must contain at least 8 characters",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);

    if (!validPassword) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      message: "Failed to update password",
    });
  }
};

module.exports = {
  requestRegistrationOtp,
  requestPasswordResetOtp,
  register,
  login,
  resetPassword,
  changePassword,
};
