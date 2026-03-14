import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    mimeType: { type: String, default: "application/octet-stream" },
    data:     { type: String, default: "" }, // base64 encoded file content
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    student:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    submittedAt: { type: Date, default: Date.now },
    note:        { type: String, default: "" },
  },
  { timestamps: false }
);

const assignmentSchema = new mongoose.Schema(
  {
    unitTitle: {
      type: String,
      required: true,
      trim: true,
    },

    assignmentTitle: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    totalMarks: {
      type: Number,
      required: true,
      min: 1,
    },

    classes: {
      type: [String],
      enum: ["SY9", "SY10", "SY11"],
      required: true,
    },

    attachments: [attachmentSchema],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    submissions: [submissionSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Assignment", assignmentSchema);
