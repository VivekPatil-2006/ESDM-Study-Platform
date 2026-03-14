import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
	getStudentDashboardAnalytics,
	getTeacherDashboardAnalytics,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/teacher", authMiddleware, getTeacherDashboardAnalytics);
router.get("/student", authMiddleware, getStudentDashboardAnalytics);

export default router;
