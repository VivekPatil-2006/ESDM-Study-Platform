import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import {
  createVideoLink,
  getTeacherVideoById,
  getStudentVideoLinks,
  getTeacherVideoLinks,
} from "../controllers/videoController.js";

const router = express.Router();

router.post("/", authMiddleware, createVideoLink);
router.get("/teacher", authMiddleware, getTeacherVideoLinks);
router.get("/teacher/:id", authMiddleware, getTeacherVideoById);
router.get("/student", authMiddleware, getStudentVideoLinks);

export default router;
