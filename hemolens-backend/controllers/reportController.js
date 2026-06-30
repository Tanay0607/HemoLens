// controllers/reportController.js
// All the logic for blood report operations

const Report = require('../models/Report');
const { extractText } = require('../services/extractionService');
const { analyzeBloodReport, answerReportQuestion } = require('../services/claudeService');

/**
 * POST /api/reports/upload
 * Accepts a file, extracts text, runs AI analysis, saves to DB
 */
const uploadReport = async (req, res, next) => {
  try {
    // Multer puts the file on req.file
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a file.' });
    }

    // Create a report record immediately with "processing" status
    // This lets the frontend show a loading state
    const report = await Report.create({
      user: req.user._id,
      originalFileName: req.file.originalname,
      status: 'processing',
    });

    // Run extraction + analysis asynchronously
    // We respond quickly, then update the record when done
    processReport(report._id, req.file).catch(console.error);

    res.status(202).json({
      message: 'Report uploaded. Analysis in progress...',
      reportId: report._id,
    });
  } catch (err) {
    next(err);
  }
};

// Background processing function
async function processReport(reportId, file) {
  try {
    // Step 1: Extract text from the file
    const { text, fileType } = await extractText(
      file.buffer,
      file.mimetype,
      file.originalname
    );

    // Step 2: Send to Claude for analysis
    const analysis = await analyzeBloodReport(text);

    // Step 3: Save the results
    await Report.findByIdAndUpdate(reportId, {
      status: 'completed',
      fileType,
      extractedText: text,
      summary: analysis.summary,
      patientInfo: analysis.patientInfo,
      biomarkers: analysis.biomarkers,
      flagCounts: analysis.flagCounts,
      recommendations: analysis.recommendations,
    });
  } catch (err) {
    // If anything fails, mark as failed with an error message
    await Report.findByIdAndUpdate(reportId, {
      status: 'failed',
      errorMessage: err.message,
    });
  }
}

/**
 * GET /api/reports/:id
 * Get a single report by ID (only the owner can access it)
 */
const getReport = async (req, res, next) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      user: req.user._id, // ensures users can only see their own reports
    }).select('-extractedText'); // don't send the raw text (it's large)

    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    res.json({ report });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reports/status/:id
 * Poll the status of a report that's being processed
 */
const getReportStatus = async (req, res, next) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).select('status errorMessage flagCounts');

    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    res.json({ status: report.status, flagCounts: report.flagCounts, errorMessage: report.errorMessage });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reports/history
 * Get all reports for the logged-in user (summary only, no biomarkers)
 */
const getHistory = async (req, res, next) => {
  try {
    const reports = await Report.find({ user: req.user._id })
      .select('originalFileName status summary flagCounts createdAt fileType')
      .sort({ createdAt: -1 }) // newest first
      .limit(50);

    res.json({ reports, count: reports.length });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/reports/:id/chat
 * Ask a follow-up question about a specific report
 */
const chatAboutReport = async (req, res, next) => {
  try {
    const { question } = req.body;

    if (!question || question.trim().length < 3) {
      return res.status(400).json({ error: 'Please enter a question.' });
    }

    const report = await Report.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    if (report.status !== 'completed') {
      return res.status(400).json({ error: 'Report analysis is not yet complete.' });
    }

    // Send question + report context to Claude
    const answer = await answerReportQuestion(question, {
      summary: report.summary,
      biomarkers: report.biomarkers,
      recommendations: report.recommendations,
      patientInfo: report.patientInfo,
    });

    res.json({ answer });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/reports/:id
 * Permanently delete a report
 */
const deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    res.json({ message: 'Report deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadReport,
  getReport,
  getReportStatus,
  getHistory,
  chatAboutReport,
  deleteReport,
};

/**
 * GET /api/reports/:id/export
 * Generate and return an HTML report for printing/saving as PDF
 */
const exportReport = async (req, res, next) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      user: req.user._id,
    })

    if (!report) {
      return res.status(404).json({ error: 'Report not found.' })
    }

    if (report.status !== 'completed') {
      return res.status(400).json({ error: 'Report is not yet complete.' })
    }

    const { generateReportHTML } = require('../services/exportService')
    const html = generateReportHTML(report)

    // Send as HTML — browser opens it and user can print/save as PDF
    res.setHeader('Content-Type', 'text/html')
    res.setHeader('Content-Disposition', `inline; filename="hemolens-report-${report._id}.html"`)
    res.send(html)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  ...module.exports,
  exportReport,
}
