// models/Report.js
const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["users", "sales", "inventory", "feedback"],
    },
    dateRange: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      default: "completed",
      enum: ["completed", "processing", "failed", "scheduled"],
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Report || mongoose.model("Report", ReportSchema);
