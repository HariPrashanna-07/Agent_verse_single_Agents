const path = require('path');
const { isSafePath } = require('../utils/fileUtils');

const validatePath = (req, res, next) => {
  const { folderPath } = req.body;
  if (folderPath && typeof folderPath === 'string') {
    // Check for obvious path traversal characters
    if (folderPath.includes('..')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid folder path: Path traversal detected.'
      });
    }
  }
  next();
};

module.exports = { validatePath };
