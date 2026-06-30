// routes/reports.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const {
  uploadReport,
  getReport,
  getReportStatus,
  getHistory,
  chatAboutReport,
  deleteReport,
  exportReport,
} = require('../controllers/reportController');

// All report routes require login
router.use(protect);

router.get('/history', getHistory);
router.post('/upload', upload.single('report'), uploadReport);
router.get('/status/:id', getReportStatus);
router.get('/:id/export', exportReport);
router.get('/:id', getReport);
router.post('/:id/chat', chatAboutReport);
router.delete('/:id', deleteReport);

module.exports = router;
