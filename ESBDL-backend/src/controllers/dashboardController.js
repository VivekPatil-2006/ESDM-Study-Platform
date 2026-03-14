import Assignment from "../models/Assignment.js";
import Note from "../models/Note.js";
import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import User from "../models/User.js";

const dayRange = (days) => {
  const today = new Date();
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const end = new Date(today);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const labelForDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });

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

export const getTeacherDashboardAnalytics = async (req, res) => {
  try {
    if (!req.user || !["teacher", "admin"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const teacherId = req.user._id;

    const { start: todayStart, end: todayEnd } = dayRange(1);
    const { start: trendStart, end: trendEnd } = dayRange(6);

    const [
      totalStudents,
      totalAssignments,
      totalNotes,
      totalQuizzes,
      activeQuizzes,
      dueTodayAssignments,
      notesUploadedToday,
      assignmentSubmissionsTrendRaw,
      quizPerformanceRaw,
      assignmentsForSubmissionCount,
      recentAssignments,
      recentNotes,
      recentQuizzes,
    ] = await Promise.all([
      User.countDocuments({ role: "student", isActive: true }),
      Assignment.countDocuments({ createdBy: teacherId }),
      Note.countDocuments({ uploadedBy: teacherId }),
      Quiz.countDocuments({ createdBy: teacherId }),
      Quiz.countDocuments({ createdBy: teacherId, status: "Active" }),
      Assignment.countDocuments({
        createdBy: teacherId,
        dueDate: { $gte: todayStart, $lte: todayEnd },
      }),
      Note.countDocuments({
        uploadedBy: teacherId,
        createdAt: { $gte: todayStart, $lte: todayEnd },
      }),
      Assignment.aggregate([
        { $match: { createdBy: teacherId } },
        { $unwind: "$submissions" },
        {
          $match: {
            "submissions.submittedAt": { $gte: trendStart, $lte: trendEnd },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$submissions.submittedAt",
              },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      QuizAttempt.aggregate([
        {
          $lookup: {
            from: "quizzes",
            localField: "quiz",
            foreignField: "_id",
            as: "quizDoc",
          },
        },
        { $unwind: "$quizDoc" },
        { $match: { "quizDoc.createdBy": teacherId } },
        {
          $group: {
            _id: "$quizDoc.targetBatch",
            average: { $avg: "$percentage" },
          },
        },
      ]),
      Assignment.find({ createdBy: teacherId }).select("submissions"),
      Assignment.find({ createdBy: teacherId })
        .select("assignmentTitle createdAt")
        .sort({ createdAt: -1 })
        .limit(3),
      Note.find({ uploadedBy: teacherId })
        .select("topic unit unitNumber createdAt")
        .sort({ createdAt: -1 })
        .limit(3),
      Quiz.find({ createdBy: teacherId })
        .select("name status createdAt")
        .sort({ createdAt: -1 })
        .limit(3),
    ]);

    const trendDays = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);
      trendDays.push({ key, label: labelForDate(d) });
    }

    const trendMap = new Map(assignmentSubmissionsTrendRaw.map((item) => [item._id, item.count]));
    const assignmentSubmissionTrend = {
      labels: trendDays.map((d) => d.label),
      values: trendDays.map((d) => trendMap.get(d.key) || 0),
    };

    const quizPerformance = {
      labels: quizPerformanceRaw.map((q) => q._id),
      values: quizPerformanceRaw.map((q) => Math.round(q.average || 0)),
    };

    const totalSubmissions = assignmentsForSubmissionCount.reduce(
      (sum, item) => sum + (Array.isArray(item.submissions) ? item.submissions.length : 0),
      0
    );

    const activity = [
      ...recentAssignments.map((item) => ({
        type: "assignment",
        icon: "clipboard",
        text: `Created assignment: ${item.assignmentTitle}`,
        createdAt: item.createdAt,
      })),
      ...recentNotes.map((item) => ({
        type: "note",
        icon: "document-text",
        text: `Uploaded notes: Unit ${item.unitNumber} - ${item.topic || item.unit}`,
        createdAt: item.createdAt,
      })),
      ...recentQuizzes.map((item) => ({
        type: "quiz",
        icon: "help-circle",
        text: `${item.status === "Active" ? "Activated" : "Created"} quiz: ${item.name}`,
        createdAt: item.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);

    return res.json({
      success: true,
      data: {
        overview: {
          totalStudents,
          totalAssignments,
          totalNotes,
          totalQuizzes,
        },
        charts: {
          assignmentSubmissionTrend,
          quizPerformance,
        },
        todaySummary: {
          dueTodayAssignments,
          notesUploadedToday,
          activeQuizzes,
          totalStudents,
        },
        totals: {
          totalSubmissions,
        },
        recentActivity: activity,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentDashboardAnalytics = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "student") {
      return res.status(403).json({ success: false, message: "Student access required" });
    }

    const studentId = req.user._id;
    const studentClasses = getStudentClasses(req.user);
    const targetBatches = [...studentClasses, "All"];

    const assignmentFilter = studentClasses.length
      ? { classes: { $in: studentClasses } }
      : { _id: null };

    const notesFilter = studentClasses.length
      ? { classes: { $in: studentClasses } }
      : { _id: null };

    const [
      assignments,
      notesCount,
      quizzesAvailable,
      quizAttempts,
    ] = await Promise.all([
      Assignment.find(assignmentFilter).select("submissions dueDate"),
      Note.countDocuments(notesFilter),
      Quiz.countDocuments({ status: "Active", targetBatch: { $in: targetBatches } }),
      QuizAttempt.find({ student: studentId }).select("percentage result"),
    ]);

    const assignmentsCount = assignments.length;

    let completedAssignments = 0;
    let pendingAssignments = 0;

    assignments.forEach((assignment) => {
      const submitted = (assignment.submissions || []).some(
        (sub) => String(sub.student) === String(studentId)
      );

      if (submitted) completedAssignments += 1;
      else pendingAssignments += 1;
    });

    const quizzesTaken = quizAttempts.length;
    const avgScore = quizzesTaken
      ? Math.round(
        quizAttempts.reduce((sum, attempt) => sum + Number(attempt.percentage || 0), 0) /
          quizzesTaken
      )
      : 0;

    const progressDenominator = assignmentsCount + quizzesAvailable;
    const progressNumerator = completedAssignments + quizzesTaken;
    const weeklyProgress = progressDenominator
      ? Math.min(Math.round((progressNumerator / progressDenominator) * 100), 100)
      : 0;

    return res.json({
      success: true,
      data: {
        kpis: {
          notes: notesCount,
          quizzes: quizzesTaken,
          assignments: assignmentsCount,
          avgScore,
        },
        progress: {
          weeklyProgress,
          completedAssignments,
          pendingAssignments,
          quizzesAvailable,
          quizzesTaken,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
