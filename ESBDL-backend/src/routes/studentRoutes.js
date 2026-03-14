import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import { getStudentAnalytics, getStudentById, getStudents } from "../controllers/studentController.js";

const router = express.Router();

router.get("/", authMiddleware, getStudents);
router.get("/:id/analytics", authMiddleware, getStudentAnalytics);
router.get("/:id", authMiddleware, getStudentById);

export default router;