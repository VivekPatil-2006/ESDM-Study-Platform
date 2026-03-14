import xlsx from "xlsx";

import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";

const teacherRoles = ["teacher", "admin"];
const studentRoles = ["student"];

const normalizeKey = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const getValueByAliases = (row, aliases) => {
  const rowEntries = Object.entries(row || {});
  const normalizedAliases = aliases.map((alias) => normalizeKey(alias));

  for (const [key, value] of rowEntries) {
    if (normalizedAliases.includes(normalizeKey(key))) {
      return value;
    }
  }

  return undefined;
};

const parseQuestionsFromSheet = (buffer) => {
  const workbook = xlsx.read(buffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    return [];
  }

  const rows = xlsx.utils.sheet_to_json(workbook.Sheets[firstSheetName], {
    defval: "",
  });

  return rows
    .map((row) => {
      const question = getValueByAliases(row, ["question", "questions", "query"]);
      const answer = getValueByAliases(row, ["answer", "correctanswer", "correctoption"]);

      const options = [
        getValueByAliases(row, ["option1", "option_1", "optiona", "a"]),
        getValueByAliases(row, ["option2", "option_2", "optionb", "b"]),
        getValueByAliases(row, ["option3", "option_3", "optionc", "c"]),
        getValueByAliases(row, ["option4", "option_4", "optiond", "d"]),
      ]
        .map((item) => String(item || "").trim())
        .filter(Boolean);

      return {
        question: String(question || "").trim(),
        answer: String(answer || "").trim(),
        options,
      };
    })
    .filter((item) => item.question && item.answer && item.options.length >= 2);
};

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

export const createQuiz = async (req, res) => {
  try {
    if (!ensureTeacherAccess(req, res)) {
      return;
    }

    const { name, description, targetBatch, duration } = req.body;

    if (!name || !description || !targetBatch || !duration) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Excel file is required",
      });
    }

    const questions = parseQuestionsFromSheet(req.file.buffer);

    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Excel file must contain question, options, and answer columns",
      });
    }

    const quiz = await Quiz.create({
      name,
      description,
      targetBatch,
      duration,
      status: "Inactive",
      fileName: req.file.originalname,
      questionCount: questions.length,
      questions,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      data: quiz,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTeacherQuizzes = async (req, res) => {
  try {
    if (!ensureTeacherAccess(req, res)) {
      return;
    }

    const quizzes = await Quiz.find()
      .sort({ createdAt: -1 })
      .select("name description targetBatch duration status fileName questionCount createdAt");

    res.json({
      success: true,
      data: quizzes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTeacherQuizById = async (req, res) => {
  try {
    if (!ensureTeacherAccess(req, res)) {
      return;
    }

    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateQuizStatus = async (req, res) => {
  try {
    if (!ensureTeacherAccess(req, res)) {
      return;
    }

    const { status } = req.body;

    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz status",
      });
    }

    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      {
        status,
        activatedAt: status === "Active" ? new Date() : null,
      },
      { new: true }
    );

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.json({
      success: true,
      message: `Quiz ${status.toLowerCase()} successfully`,
      data: quiz,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const ensureStudentAccess = (req, res) => {
  if (!studentRoles.includes(req.user?.role)) {
    res.status(403).json({
      success: false,
      message: "Student access required",
    });
    return false;
  }

  return true;
};

const normalizeBatchCode = (value) => {
  const rawValue = String(value || "").trim().toUpperCase();

  if (rawValue.startsWith("SE")) {
    return `SY${rawValue.slice(2)}`;
  }

  return rawValue;
};

const getStudentAllowedBatches = (user) => {
  const directClass = user?.class ? [user.class] : [];
  const classList = Array.isArray(user?.classAssigned) ? user.classAssigned : [];

  return [...directClass, ...classList]
    .map(normalizeBatchCode)
    .filter(Boolean);
};
const canStudentAccessQuiz = (quiz, user) => {
  if (!quiz || quiz.status !== "Active") {
    return false;
  }

  if (quiz.targetBatch === "All") {
    return true;
  }

  const allowedBatches = getStudentAllowedBatches(user);
  return allowedBatches.includes(quiz.targetBatch);
};

const compareAnswer = (selectedOption, correctAnswer) =>
  String(selectedOption || "").trim().toLowerCase() === String(correctAnswer || "").trim().toLowerCase();

export const getStudentActiveQuizzes = async (req, res) => {
  try {
    if (!ensureStudentAccess(req, res)) {
      return;
    }

    const allowedBatches = getStudentAllowedBatches(req.user);

    const quizzes = await Quiz.find({
      status: "Active",
      $or: [
        { targetBatch: "All" },
        { targetBatch: { $in: allowedBatches } },
      ],
    })
      .sort({ activatedAt: -1, createdAt: -1 })
      .select("name description duration targetBatch questionCount status activatedAt");

    res.json({
      success: true,
      data: quizzes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getStudentQuizResults = async (req, res) => {
  try {
    if (!ensureStudentAccess(req, res)) {
      return;
    }

    const attempts = await QuizAttempt.find({ student: req.user._id })
      .populate("quiz", "name description duration targetBatch")
      .sort({ submittedAt: -1 });

    const results = attempts.map((attempt) => ({
      _id: attempt._id,
      quizId: attempt.quiz?._id,
      title: attempt.quiz?.name || "Quiz",
      description: attempt.quiz?.description || "",
      duration: attempt.quiz?.duration || "",
      targetBatch: attempt.quiz?.targetBatch || "",
      score: attempt.score,
      total: attempt.totalQuestions,
      percentage: attempt.percentage,
      result: attempt.result,
      submittedAt: attempt.submittedAt,
    }));

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getStudentQuizForAttempt = async (req, res) => {
  try {
    if (!ensureStudentAccess(req, res)) {
      return;
    }

    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    if (!canStudentAccessQuiz(quiz, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this quiz",
      });
    }

    const questionSet = quiz.questions.map((question, index) => ({
      questionIndex: index,
      question: question.question,
      options: question.options,
    }));

    res.json({
      success: true,
      data: {
        _id: quiz._id,
        name: quiz.name,
        description: quiz.description,
        duration: quiz.duration,
        targetBatch: quiz.targetBatch,
        questionCount: quiz.questionCount,
        questions: questionSet,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const submitStudentQuiz = async (req, res) => {
  try {
    if (!ensureStudentAccess(req, res)) {
      return;
    }

    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    if (!canStudentAccessQuiz(quiz, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to submit this quiz",
      });
    }

    const submittedAnswers = Array.isArray(req.body?.answers) ? req.body.answers : [];

    const evaluatedAnswers = quiz.questions.map((question, index) => {
      const submittedAnswer = submittedAnswers.find((item) => Number(item.questionIndex) === index);
      const selectedOption = String(submittedAnswer?.selectedOption || "").trim();
      const isCorrect = compareAnswer(selectedOption, question.answer);

      return {
        questionIndex: index,
        selectedOption,
        isCorrect,
      };
    });

    const score = evaluatedAnswers.filter((answer) => answer.isCorrect).length;
    const totalQuestions = quiz.questions.length;
    const percentage = totalQuestions > 0 ? Number(((score / totalQuestions) * 100).toFixed(2)) : 0;
    const result = percentage >= 40 ? "Passed" : "Failed";

    const attempt = await QuizAttempt.findOneAndUpdate(
      { quiz: quiz._id, student: req.user._id },
      {
        quiz: quiz._id,
        student: req.user._id,
        answers: evaluatedAnswers,
        score,
        totalQuestions,
        percentage,
        result,
        submittedAt: new Date(),
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    res.json({
      success: true,
      message: "Quiz submitted successfully",
      data: {
        _id: attempt._id,
        quizId: quiz._id,
        title: quiz.name,
        score,
        total: totalQuestions,
        percentage,
        result,
        submittedAt: attempt.submittedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const downloadQuizTemplate = async (req, res) => {
  try {
    const templateRows = [
      {
        question: "What does CPU stand for?",
        option1: "Central Processing Unit",
        option2: "Computer Processing Unit",
        option3: "Central Program Unit",
        option4: "Control Process Unit",
        answer: "Central Processing Unit",
      },
      {
        question: "Which protocol is used to load web pages?",
        option1: "FTP",
        option2: "HTTP",
        option3: "SMTP",
        option4: "SSH",
        answer: "HTTP",
      },
    ];

    const worksheet = xlsx.utils.json_to_sheet(templateRows);
    const workbook = xlsx.utils.book_new();

    xlsx.utils.book_append_sheet(workbook, worksheet, "QuizTemplate");

    const excelBuffer = xlsx.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=quiz_template.xlsx");

    return res.send(excelBuffer);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};