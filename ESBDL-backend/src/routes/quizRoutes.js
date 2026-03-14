import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import quizUpload from "../middleware/quizUpload.js";
import {
  createQuiz,
  downloadQuizTemplate,
  getStudentActiveQuizzes,
  getStudentQuizForAttempt,
  getStudentQuizResults,
  getTeacherQuizById,
  getTeacherQuizzes,
  submitStudentQuiz,
  updateQuizStatus,
} from "../controllers/quizController.js";

const router = express.Router();

router.get("/template", downloadQuizTemplate);
router.post("/", authMiddleware, quizUpload.single("file"), createQuiz);
router.get("/student/active", authMiddleware, getStudentActiveQuizzes);
router.get("/student/results", authMiddleware, getStudentQuizResults);
router.get("/student/:id", authMiddleware, getStudentQuizForAttempt);
router.post("/student/:id/submit", authMiddleware, submitStudentQuiz);
router.get("/", authMiddleware, getTeacherQuizzes);
router.get("/:id", authMiddleware, getTeacherQuizById);
router.patch("/:id/status", authMiddleware, updateQuizStatus);

export default router;