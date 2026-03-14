import Note from "../models/Note.js";

export const noteController = async (req, res) => {
  try {
    const { topic, unit, unitNumber, classes } = req.body;

    /* ================= VALIDATION ================= */

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one file is required",
      });
    }

    if (!topic || !unit || !unitNumber || !classes) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    /* 🔹 PARSE CLASSES (comes as string from formdata) */
    const parsedClasses =
      typeof classes === "string" ? JSON.parse(classes) : classes;

    /* ================= MULTIPLE FILES ================= */

    const uploadedFiles = req.files.map((file) => ({
      fileUrl: file.path,
      fileName: file.originalname,
      mimeType: file.mimetype,
    }));

    const note = await Note.create({
      topic,
      unitNumber,
      unit,
      classes: parsedClasses,
      files: uploadedFiles,
      uploadedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Note uploaded successfully",
      data: note,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRecentNotes = async (req, res) => {
  try {
    const notes = await Note.find()
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(notes);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
