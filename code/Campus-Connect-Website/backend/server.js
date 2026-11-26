const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./src/config/database");

const errorHandler = require("./src/middleware/errorMiddleware");

dotenv.config();

const app = express();

// Connect database
connectDB();

// Middleware
app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

// Routes
app.use("/api/auth", require("./src/routes/authRoutes"));

app.use("/api/students", require("./src/routes/studentRoutes"));

app.use("/api/drives", require("./src/routes/driveRoutes"));

app.use("/api/applications", require("./src/routes/applicationRoutes"));

app.use("/api/notifications", require("./src/routes/notificationRoutes"));

app.use("/api/resources", require("./src/routes/resourceRoutes"));

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "CampusConnect API is running",
  });
});

app.use((req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
