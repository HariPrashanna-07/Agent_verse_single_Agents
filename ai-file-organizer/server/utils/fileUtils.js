const path = require('path');

/**
 * Clean and sanitize suggested filename to prevent illegal characters & path traversal
 */
const sanitizeFilename = (filename, extension) => {
  if (!filename) return `file_${Date.now()}${extension || ''}`;

  // Remove illegal path/filesystem characters
  let cleanName = filename.replace(/[/\\?%*:|"<>]/g, '').trim();

  // Prevent hidden files / dotfiles leading
  cleanName = cleanName.replace(/^\.+/, '');

  // Truncate to max 60 characters (excluding extension)
  if (cleanName.length > 60) {
    cleanName = cleanName.substring(0, 60).trim();
  }

  // Ensure extension matches
  if (extension) {
    const ext = extension.startsWith('.') ? extension : `.${extension}`;
    if (!cleanName.toLowerCase().endsWith(ext.toLowerCase())) {
      cleanName = `${cleanName}${ext}`;
    }
  }

  return cleanName || `file_${Date.now()}${extension || ''}`;
};

/**
 * Prevent path traversal attack by checking target path stays inside safe base directory
 */
const isSafePath = (baseDir, targetPath) => {
  const relative = path.relative(baseDir, targetPath);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
};

module.exports = {
  sanitizeFilename,
  isSafePath
};
