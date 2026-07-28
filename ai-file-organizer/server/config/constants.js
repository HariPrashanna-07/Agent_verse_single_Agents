const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../uploads');
const ORGANIZED_DIR = path.join(__dirname, '../organized');

const SUPPORTED_TEXT_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md', '.json', '.js', '.py', '.java', '.c', '.cpp', '.html', '.css', '.csv'];
const DEFAULT_IGNORED_EXTENSIONS = ['.tmp', '.log', '.ds_store', '.sys', '.bak', '.swp'];

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB per file max
const MAX_TEXT_EXTRACT_TOKENS = 4000; // Limit snippet token count for Gemini prompt efficiency

module.exports = {
  UPLOADS_DIR,
  ORGANIZED_DIR,
  SUPPORTED_TEXT_EXTENSIONS,
  DEFAULT_IGNORED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
  MAX_TEXT_EXTRACT_TOKENS
};
