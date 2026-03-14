import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
    },

    unitNumber: {
      type: String,
      required: true,
    },

    unit: {
      type: String,
      required: true,
    },

    classes: [
      {
        type: String,
      },
    ],

    files: [
      {
        fileUrl: String,
        fileName: String,
        mimeType: String,
      },
    ],

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Note", noteSchema);