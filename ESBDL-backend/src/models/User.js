import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    rollNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      required: true,
    },

    // 👇 Academic Info
    class: {
      type: String,
      enum: ["SY9", "SY10", "SY11"],
      default: null,
      trim: true,
    },

    classAssigned: {
      type: [String],
      enum: ["SE9", "SE10", "SE11"],
      default: [],
    },


    department: {
      type: String,
      trim: true,
    },

    // 👇 Profile Info
    photo: {
      type: String, // base64 or URL
      default: null,
    },

  

    address: {
      type: String,
      trim: true,
    },

    year: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
