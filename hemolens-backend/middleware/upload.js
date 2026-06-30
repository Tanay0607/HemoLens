// middleware/upload.js
// Handles file uploads using Multer
// Files are stored in memory (as Buffer) rather than disk — safer and simpler

const multer = require('multer');

const MAX_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '10');

// Store files in memory as Buffer objects (req.file.buffer)
const storage = multer.memoryStorage();

// Only allow PDFs and common image formats
const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true); // accept the file
  } else {
    cb(new Error('Only PDF, JPG, PNG, and WEBP files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZE_MB * 1024 * 1024, // convert MB to bytes
  },
});

module.exports = { upload };
