import VideoLink from "../models/VideoLink.js";

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
  const rawValue = String(value || "").trim().toUpperCase();
  if (!rawValue) return null;
  if (rawValue.startsWith("SE")) return `SY${rawValue.slice(2)}`;
  return rawValue;
};

const getStudentClasses = (user) => {
  const directClass = user?.class ? [normalizeToSY(user.class)] : [];
  const assigned = Array.isArray(user?.classAssigned)
    ? user.classAssigned.map(normalizeToSY)
    : [];

  return [...new Set([...directClass, ...assigned].filter(Boolean))];
};

const extractYoutubeId = (rawUrl) => {
  try {
    const parsed = new URL(String(rawUrl || "").trim());
    const host = parsed.hostname.replace("www.", "").toLowerCase();

    if (host === "youtu.be") {
      const shortId = parsed.pathname.split("/").filter(Boolean)[0];
      return shortId || null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const watchId = parsed.searchParams.get("v");
      if (watchId) return watchId;

      const segments = parsed.pathname.split("/").filter(Boolean);
      if (segments[0] === "embed" || segments[0] === "shorts") {
        return segments[1] || null;
      }
    }

    return null;
  } catch {
    return null;
  }
};

export const createVideoLink = async (req, res) => {
  try {
    if (!ensureTeacherAccess(req, res)) {
      return;
    }

    const { title, description, url, targetBatch } = req.body;

    if (!title || !url) {
      return res.status(400).json({
        success: false,
        message: "Title and YouTube URL are required",
      });
    }

    const youtubeId = extractYoutubeId(url);
    if (!youtubeId) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid YouTube link",
      });
    }

    const payload = await VideoLink.create({
      title: String(title).trim(),
      description: String(description || "").trim(),
      url: String(url).trim(),
      youtubeId,
      targetBatch: targetBatch || "All",
      uploadedBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Video link uploaded successfully",
      data: payload,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTeacherVideoLinks = async (req, res) => {
  try {
    if (!ensureTeacherAccess(req, res)) {
      return;
    }

    const links = await VideoLink.find({ uploadedBy: req.user._id })
      .sort({ createdAt: -1 })
      .select("title description url youtubeId targetBatch createdAt");

    return res.json({
      success: true,
      data: links,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTeacherVideoById = async (req, res) => {
  try {
    if (!ensureTeacherAccess(req, res)) {
      return;
    }

    const video = await VideoLink.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id,
    }).select("title description url youtubeId targetBatch createdAt");

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video link not found",
      });
    }

    return res.json({
      success: true,
      data: video,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getStudentVideoLinks = async (req, res) => {
  try {
    if (!ensureStudentAccess(req, res)) {
      return;
    }

    const allowedClasses = getStudentClasses(req.user);

    const links = await VideoLink.find({
      $or: [{ targetBatch: "All" }, { targetBatch: { $in: allowedClasses } }],
    })
      .sort({ createdAt: -1 })
      .select("title description url youtubeId targetBatch createdAt")
      .populate("uploadedBy", "name");

    return res.json({
      success: true,
      data: links,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
