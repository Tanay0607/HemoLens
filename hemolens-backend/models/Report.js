// models/Report.js
// Defines what a "blood report" looks like in MongoDB

const mongoose = require('mongoose');

// A single biomarker (e.g. Hemoglobin: 11.2 g/dL — LOW)
const biomarkerSchema = new mongoose.Schema({
  name: { type: String, required: true },        // "Hemoglobin"
  value: { type: Number },                        // 11.2
  unit: { type: String },                         // "g/dL"
  referenceRange: { type: String },               // "12.0 – 17.0"
  flag: {
    type: String,
    enum: ['normal', 'low', 'high', 'critical_low', 'critical_high', 'unknown'],
    default: 'unknown',
  },
  category: { type: String },                     // "Complete Blood Count"
  explanation: { type: String },                  // plain-English explanation
});

const reportSchema = new mongoose.Schema(
  {
    // Which user uploaded this report
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // File info
    originalFileName: { type: String },
    fileType: { type: String, enum: ['pdf', 'image'] },

    // Raw text extracted from the file (before AI processing)
    extractedText: { type: String },

    // ── AI Analysis Results ──────────────────────────────────────
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },

    // Overall plain-English summary of the report
    summary: { type: String },

    // Patient info extracted from the report itself
    patientInfo: {
      name: String,
      age: String,
      gender: String,
      reportDate: String,
      labName: String,
    },

    // All biomarkers found in the report
    biomarkers: [biomarkerSchema],

    // Quick-access counts (computed from biomarkers)
    flagCounts: {
      normal: { type: Number, default: 0 },
      abnormal: { type: Number, default: 0 },
      critical: { type: Number, default: 0 },
    },

    // Key recommendations from the AI
    recommendations: [{ type: String }],

    // Error message if analysis failed
    errorMessage: { type: String },
  },
  {
    timestamps: true,
  }
);

// Index so we can quickly find all reports for a user
reportSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
