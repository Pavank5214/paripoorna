const express = require("express");
const app = express();
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

dotenv.config();

const PORT = process.env.PORT || 8080;

// ✅ Allowed Origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5177",
  "https://buildtrack.pavankumar.site",
  "https://paripoorna-s299.vercel.app", // frontend
];

app.use(express.json());

// ✅ Updated CORS setup
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow any origin for mobile/preview access
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Express v5 fix: handle preflight properly
app.options(/.*/, cors());

// ----- ROUTES -----

const materialRoutes = require("./routes/materialRoutes");
const taskRoutes = require("./routes/taskRoutes");
const workerRoutes = require("./routes/workerRoutes");
const issueRoutes = require("./routes/issueRoutes");
const logsRoutes = require("./routes/logsRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const costsRoutes = require("./routes/costsRoutes");
const projectRoutes = require("./routes/projectRoutes");
const userRoutes = require("./routes/userRoutes");
const aiRoutes = require("./routes/aiRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

app.get("/", (req, res) => {
  res.send("Backend server running ✅");
});

connectDB();


// ✅ API routes
app.use("/api/materials", materialRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/costs", costsRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/user", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notifications", notificationRoutes);

// Export the Express API
module.exports = app;

// Start server only if run directly (Vercel handles it otherwise)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}
