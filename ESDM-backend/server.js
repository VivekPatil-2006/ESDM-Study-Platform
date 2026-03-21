import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./src/config/db.js";

// ROUTES
import noteroutes from "./src/routes/noteroutes.js"
import authRoutes from "./src/routes/authroutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import quizRoutes from "./src/routes/quizRoutes.js";
import studentRoutes from "./src/routes/studentRoutes.js";
import assignmentRoutes from "./src/routes/assignmentRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import videoRoutes from "./src/routes/videoRoutes.js";
import diagramRoutes from "./src/routes/diagramRoutes.js";

dotenv.config();

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json({ limit: "50mb" })); // ⬅ for base64 images + file attachments

// ================= DB =================
connectDB();

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/notes",noteroutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/diagrams", diagramRoutes);

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
