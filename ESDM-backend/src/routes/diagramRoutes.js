import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import {
  createDiagram,
  getStudentDiagrams,
  getTeacherDiagramById,
  getTeacherDiagrams,
} from "../controllers/diagramController.js";

const router = express.Router();

router.post("/", authMiddleware, createDiagram);
router.get("/teacher", authMiddleware, getTeacherDiagrams);
router.get("/teacher/:id", authMiddleware, getTeacherDiagramById);
router.get("/student", authMiddleware, getStudentDiagrams);

export default router;
