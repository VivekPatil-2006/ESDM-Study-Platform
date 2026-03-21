import Diagram from "../models/Diagram.js";

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

const ensureStudentAccess = (req, res) => {
  if (req.user?.role !== "student") {
    res.status(403).json({
      success: false,
      message: "Student access required",
    });
    return false;
  }

  return true;
};

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

const isValidUrl = (value) => {
  if (!value) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export const createDiagram = async (req, res) => {
  try {
    if (!ensureTeacherAccess(req, res)) {
      return;
    }

    const {
      title,
      subject,
      description,
      imageData,
      imageMimeType,
      targetBatch,
      practiceLinks,
    } = req.body;

    if (!title || !subject || !imageData) {
      return res.status(400).json({
        success: false,
        message: "Title, subject and image are required",
      });
    }

    const resolvedLinks = {
      drawio: practiceLinks?.drawio || "https://app.diagrams.net/",
      creately: practiceLinks?.creately || "https://creately.com/diagram-type/uml/",
      lucidchart: practiceLinks?.lucidchart || "https://www.lucidchart.com/pages/",
    };

    const linksValid =
      isValidUrl(resolvedLinks.drawio) &&
      isValidUrl(resolvedLinks.creately) &&
      isValidUrl(resolvedLinks.lucidchart);

    if (!linksValid) {
      return res.status(400).json({
        success: false,
        message: "All practice links must be valid URLs",
      });
    }

    const payload = await Diagram.create({
      title: String(title).trim(),
      subject: String(subject).trim(),
      description: String(description || "").trim(),
      imageData,
      imageMimeType: String(imageMimeType || "image/jpeg"),
      targetBatch: targetBatch || "All",
      practiceLinks: resolvedLinks,
      uploadedBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Diagram uploaded successfully",
      data: payload,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTeacherDiagrams = async (req, res) => {
  try {
    if (!ensureTeacherAccess(req, res)) {
      return;
    }

    const diagrams = await Diagram.find({ uploadedBy: req.user._id })
      .sort({ createdAt: -1 })
      .select("title subject description imageData imageMimeType targetBatch practiceLinks createdAt");

    return res.json({
      success: true,
      data: diagrams,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTeacherDiagramById = async (req, res) => {
  try {
    if (!ensureTeacherAccess(req, res)) {
      return;
    }

    const diagram = await Diagram.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id,
    }).select("title subject description imageData imageMimeType targetBatch practiceLinks createdAt");

    if (!diagram) {
      return res.status(404).json({
        success: false,
        message: "Diagram not found",
      });
    }

    return res.json({
      success: true,
      data: diagram,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getStudentDiagrams = async (req, res) => {
  try {
    if (!ensureStudentAccess(req, res)) {
      return;
    }

    const allowedClasses = getStudentClasses(req.user);

    const diagrams = await Diagram.find({
      $or: [{ targetBatch: "All" }, { targetBatch: { $in: allowedClasses } }],
    })
      .sort({ createdAt: -1 })
      .select("title subject description imageData imageMimeType targetBatch practiceLinks createdAt")
      .populate("uploadedBy", "name");

    return res.json({
      success: true,
      data: diagrams,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
