import express from "express";
import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  getStudentAssignments,
  getStudentAssignmentById,
} from "../controllers/assignmentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/student", getStudentAssignments);
router.get("/student/:id", getStudentAssignmentById);

router.post("/",    createAssignment);
router.get("/",    getAssignments);
router.get("/:id", getAssignmentById);

export default router;
