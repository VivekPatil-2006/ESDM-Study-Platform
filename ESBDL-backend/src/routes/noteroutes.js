import express from "express";
import { noteController } from "../controllers/noteController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import { getRecentNotes } from "../controllers/noteController.js";

const router = express.Router();

router.post(
  "/add",
  authMiddleware,
  upload.array("files"),
  noteController
);

router.get(
  "/recent",
  authMiddleware,
  getRecentNotes
);

export default router;
