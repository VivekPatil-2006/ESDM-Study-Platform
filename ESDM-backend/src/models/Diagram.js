import mongoose from "mongoose";

const diagramSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    imageData: {
      type: String,
      required: true,
      default: "",
    },
    imageMimeType: {
      type: String,
      default: "image/jpeg",
      trim: true,
    },
    targetBatch: {
      type: String,
      enum: ["SY9", "SY10", "SY11", "All"],
      default: "All",
    },
    practiceLinks: {
      drawio: {
        type: String,
        default: "https://app.diagrams.net/",
        trim: true,
      },
      creately: {
        type: String,
        default: "https://creately.com/diagram-type/uml/",
        trim: true,
      },
      lucidchart: {
        type: String,
        default: "https://www.lucidchart.com/pages/",
        trim: true,
      },
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Diagram", diagramSchema);
