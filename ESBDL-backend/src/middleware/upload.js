import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "esdm-notes",
    resource_type: "auto",   // 🔥 MOST IMPORTANT FIX
    access_mode: "public",
  },
});

const upload = multer({ storage });

export default upload;
