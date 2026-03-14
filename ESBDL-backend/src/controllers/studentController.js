import User from "../models/User.js";
import Assignment from "../models/Assignment.js";
import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";

const teacherRoles = ["teacher", "admin"];

const ensureTeacherAccess = (req, res) => {
  if (!teacherRoles.includes(req.user?.role)) {
    res.status(403).json({
      success: false,
      message: "Teacher access required",
    });
    return false;
  }

  return true;
};

const normalizeBatchToUserValue = (batch) => {
  const rawValue = String(batch || "").trim().toUpperCase();

  if (rawValue === "ALL" || rawValue === "") {
    return "ALL";
  }

  return rawValue;
};

const normalizeBatchToLegacyValue = (batch) => {
  const rawValue = String(batch || "").trim().toUpperCase();

  if (rawValue === "ALL" || rawValue === "") {
    return "ALL";
  }

  if (rawValue.startsWith("SY")) {
    return `SE${rawValue.slice(2)}`;
  }

  return rawValue;
};

const normalizeToSYClass = (value) => {
  const rawValue = String(value || "").trim().toUpperCase();
  if (!rawValue) {
    return null;
  }
  if (rawValue.startsWith("SE")) {
    return `SY${rawValue.slice(2)}`;
  }
  return rawValue;
};

const getStudentAllowedClasses = (student) => {
  const classFromProfile = student?.class ? [normalizeToSYClass(student.class)] : [];
  const classFromAssigned = Array.isArray(student?.classAssigned)
    ? student.classAssigned.map(normalizeToSYClass)
    : [];

  return [...new Set([...classFromProfile, ...classFromAssigned].filter(Boolean))];
};

export const getStudents = async (req, res) => {
  try {
    if (!ensureTeacherAccess(req, res)) {
      return;
    }

    const search = String(req.query.search || "").trim();
    const batch = normalizeBatchToUserValue(req.query.batch || "ALL");
    const legacyBatch = normalizeBatchToLegacyValue(req.query.batch || "ALL");

    const filters = {
      role: "student",
    };

    if (batch !== "ALL") {
      filters.$and = [
        {
          $or: [
            { class: batch },
            { classAssigned: legacyBatch },
          ],
        },
      ];
    }

    if (search) {
      const searchFilter = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { rollNo: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };

      if (filters.$and) {
        filters.$and.push(searchFilter);
      } else {
        Object.assign(filters, searchFilter);
      }
    }

    const students = await User.find(filters)
      .select("rollNo name email photo class classAssigned department phone address year isActive createdAt")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getStudentById = async (req, res) => {
  try {
    if (!ensureTeacherAccess(req, res)) {
      return;
    }

    const student = await User.findOne({
      _id: req.params.id,
      role: "student",
    }).select("-password");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getStudentAnalytics = async (req, res) => {
  try {
    if (!ensureTeacherAccess(req, res)) {
      return;
    }

    const student = await User.findOne({
      _id: req.params.id,
      role: "student",
    }).select("_id class classAssigned");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const allowedClasses = getStudentAllowedClasses(student);

    const assignmentFilter = allowedClasses.length
      ? { classes: { $in: allowedClasses } }
      : { _id: null };

    const [assignments, availableQuizzes, quizAttemptsRaw] = await Promise.all([
      Assignment.find(assignmentFilter).select("dueDate submissions"),
      Quiz.countDocuments({ targetBatch: { $in: [...allowedClasses, "All"] } }),
      QuizAttempt.find({ student: student._id }).populate("quiz", "targetBatch"),
    ]);

    const totalAssignments = assignments.length;

    let completedAssignments = 0;
    let onTimeSubmissions = 0;

    assignments.forEach((assignment) => {
      const submission = (assignment.submissions || []).find(
        (item) => String(item.student) === String(student._id)
      );

      if (!submission) {
        return;
      }

      completedAssignments += 1;

      if (assignment.dueDate && submission.submittedAt) {
        const dueTime = new Date(assignment.dueDate).getTime();
        const submissionTime = new Date(submission.submittedAt).getTime();
        if (submissionTime <= dueTime) {
          onTimeSubmissions += 1;
        }
      }
    });

    const pendingAssignments = Math.max(totalAssignments - completedAssignments, 0);

    const relevantAttempts = quizAttemptsRaw.filter((attempt) => {
      const batch = attempt?.quiz?.targetBatch;
      return !!batch && (batch === "All" || allowedClasses.includes(batch));
    });

    const totalQuizAttempts = relevantAttempts.length;
    const totalQuizScore = relevantAttempts.reduce(
      (sum, attempt) => sum + Number(attempt.percentage || 0),
      0
    );

    const overallScore = totalQuizAttempts
      ? Math.round(totalQuizScore / totalQuizAttempts)
      : 0;

    const assignmentCompletion = totalAssignments
      ? Math.round((completedAssignments / totalAssignments) * 100)
      : 0;

    const quizParticipation = availableQuizzes
      ? Math.round((totalQuizAttempts / availableQuizzes) * 100)
      : 0;

    const onTimeRate = completedAssignments
      ? Math.round((onTimeSubmissions / completedAssignments) * 100)
      : 0;

    const performance = [
      { subject: "Assignments", value: assignmentCompletion },
      { subject: "Quiz Avg", value: overallScore },
      { subject: "Quiz Participation", value: quizParticipation },
      { subject: "On-time", value: onTimeRate },
    ];

    res.json({
      success: true,
      data: {
        overallScore,
        assignmentCompletion,
        quizParticipation,
        completedAssignments,
        pendingAssignments,
        totalAssignments,
        totalQuizAttempts,
        availableQuizzes,
        performance,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};