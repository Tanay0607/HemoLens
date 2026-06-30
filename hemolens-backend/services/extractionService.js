// services/extractionService.js
// Extracts text from uploaded files (PDFs or images)
// PDF-parse handles digital PDFs; Tesseract handles scanned images

const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const path = require('path');

/**
 * Extract text from a PDF file buffer
 * @param {Buffer} fileBuffer - The file contents as a Buffer
 * @returns {string} Extracted text
 */
async function extractFromPDF(fileBuffer) {
  try {
    const data = await pdfParse(fileBuffer);

    if (!data.text || data.text.trim().length < 50) {
      throw new Error('PDF appears to be scanned or image-based — try uploading as an image instead');
    }

    return data.text;
  } catch (err) {
    if (err.message.includes('scanned')) throw err;
    throw new Error(`Could not read PDF: ${err.message}`);
  }
}

/**
 * Extract text from an image using OCR (Tesseract)
 * @param {Buffer} fileBuffer - The image file as a Buffer
 * @returns {string} Extracted text
 */
async function extractFromImage(fileBuffer) {
  try {
    // Tesseract reads the image and returns detected text
    const result = await Tesseract.recognize(fileBuffer, 'eng', {
      logger: () => {}, // silence progress logs
    });

    const text = result.data.text;

    if (!text || text.trim().length < 30) {
      throw new Error('Could not detect enough text in the image — ensure the image is clear and well-lit');
    }

    return text;
  } catch (err) {
    if (err.message.includes('detect')) throw err;
    throw new Error(`Image text extraction failed: ${err.message}`);
  }
}

/**
 * Auto-detect file type and extract text
 * @param {Buffer} fileBuffer - File contents
 * @param {string} mimetype - The file's MIME type (e.g. 'application/pdf')
 * @param {string} originalName - Original filename
 * @returns {{ text: string, fileType: string }}
 */
async function extractText(fileBuffer, mimetype, originalName) {
  const ext = path.extname(originalName).toLowerCase();

  const isPDF = mimetype === 'application/pdf' || ext === '.pdf';
  const isImage = mimetype.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);

  if (isPDF) {
    const text = await extractFromPDF(fileBuffer);
    return { text, fileType: 'pdf' };
  }

  if (isImage) {
    const text = await extractFromImage(fileBuffer);
    return { text, fileType: 'image' };
  }

  throw new Error('Unsupported file type. Please upload a PDF or image (JPG, PNG, WEBP).');
}

module.exports = { extractText };
