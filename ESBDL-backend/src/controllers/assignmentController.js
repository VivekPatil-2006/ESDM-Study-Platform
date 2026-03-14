import Assignment from "../models/Assignment.js";

const normalizeToSY = (value) => {
  const raw = String(value || "").trim().toUpperCase();
  if (!raw) return null;
  if (raw.startsWith("SE")) return `SY${raw.slice(2)}`;
  return raw;
};

const getStudentClasses = (user) => {
  const directClass = user?.class ? [normalizeToSY(user.class)] : [];
  const assigned = Array.isArray(user?.classAssigned)
    ? user.classAssigned.map(normalizeToSY)
    : [];
  return [...new Set([...directClass, ...assigned].filter(Boolean))];
};

/* ─────────────────────────────────────────
   Create Assignment  (Teacher)
───────────────────────────────────────── */
export const createAssignment = async (req, res) => {
  try {
    const {
      unitTitle,
      assignmentTitle,
      description,
      dueDate,
      totalMarks,
      classes,
      attachments,
    } = req.body;

    if (!unitTitle || !assignmentTitle || !dueDate || !totalMarks || !classes?.length) {
      return res.status(400).json({
        success: false,
        message: "unitTitle, assignmentTitle, dueDate, totalMarks and classes are required",
      });
    }

    const assignment = await Assignment.create({
      unitTitle,
      assignmentTitle,
      description: description || "",
      dueDate: new Date(dueDate),
      totalMarks: Number(totalMarks),
      classes: Array.isArray(classes) ? classes : [classes],
      attachments: attachments || [],
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────
   Get All Assignments  (Teacher – own only)
   Query params: ?search=
───────────────────────────────────────── */
export const getAssignments = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { createdBy: req.user._id };

    if (search?.trim()) {
      filter.$or = [
        { assignmentTitle: { $regex: search.trim(), $options: "i" } },
        { unitTitle:       { $regex: search.trim(), $options: "i" } },
      ];
    }

    // Exclude heavy base64 attachment data from list view
    const assignments = await Assignment
      .find(filter)
      .select("-attachments")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────
   Get Single Assignment by ID
   (includes attachments + populated submissions)
───────────────────────────────────────── */
export const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment
      .findById(req.params.id)
      .populate("submissions.student", "name rollNo email class photo");

    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    res.json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────
   Get Assignments for Student (class-wise)
───────────────────────────────────────── */
export const getStudentAssignments = async (req, res) => {
  try {
    const allowedClasses = getStudentClasses(req.user);
    if (!allowedClasses.length) {
      return res.json({ success: true, data: [] });
    }

    const assignments = await Assignment.find({
      classes: { $in: allowedClasses },
    })
      .select("assignmentTitle unitTitle description dueDate totalMarks classes createdAt submissions")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─────────────────────────────────────────
   Get Single Assignment for Student
───────────────────────────────────────── */
export const getStudentAssignmentById = async (req, res) => {
  try {
    const allowedClasses = getStudentClasses(req.user);
    if (!allowedClasses.length) {
      return res.status(403).json({ success: false, message: "You are not assigned to any class" });
    }

    const assignment = await Assignment.findOne({
      _id: req.params.id,
      classes: { $in: allowedClasses },
    })
      .select("assignmentTitle unitTitle description dueDate totalMarks classes attachments createdAt");

    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    res.json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
