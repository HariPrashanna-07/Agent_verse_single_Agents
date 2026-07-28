const fs = require('fs-extra');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { SUPPORTED_TEXT_EXTENSIONS, MAX_TEXT_EXTRACT_TOKENS } = require('../config/constants');
const logger = require('../utils/logger');

// Rough character limit matching token budget (~4 characters per token)
const MAX_CHAR_LIMIT = MAX_TEXT_EXTRACT_TOKENS * 4;

/**
 * Extract readable text content from supported file types (PDF, DOCX, TXT, MD, Code files)
 */
const extractTextFromFile = async (filePath, extension) => {
  const ext = extension.toLowerCase();
  
  if (!SUPPORTED_TEXT_EXTENSIONS.includes(ext)) {
    return '[Binary file or non-text format - Metadata only]';
  }

  try {
    let rawText = '';

    if (ext === '.pdf') {
      const dataBuffer = await fs.readFile(filePath);
      const parsed = await pdfParse(dataBuffer);
      rawText = parsed.text || '';
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      rawText = result.value || '';
    } else {
      // Plain text, markdown, source code files
      rawText = await fs.readFile(filePath, 'utf8');
    }

    // Clean whitespace
    rawText = rawText.replace(/\s+/g, ' ').trim();

    // Truncate to token budget if content is large (head + tail strategy)
    if (rawText.length > MAX_CHAR_LIMIT) {
      const half = Math.floor(MAX_CHAR_LIMIT / 2);
      const head = rawText.slice(0, half);
      const tail = rawText.slice(-half);
      rawText = `${head}\n\n[... content truncated for processing efficiency ...]\n\n${tail}`;
    }

    return rawText || '[Empty document]';
  } catch (error) {
    logger.warn(`Failed text extraction for file ${filePath}: ${error.message}`);
    return `[Text extraction failed: ${error.message}]`;
  }
};

module.exports = {
  extractTextFromFile
};
