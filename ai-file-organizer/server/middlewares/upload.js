const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { UPLOADS_DIR, MAX_FILE_SIZE_BYTES } = require('../config/constants');

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      // Use existing scanId or generate a unique timestamp scan subfolder
      if (!req.scanId) {
        req.scanId = `scan_${Date.now()}`;
      }
      const scanDir = path.join(UPLOADS_DIR, req.scanId);
      
      // Preserve webkitRelativePath subdirectory structure if provided
      let subDir = '';
      if (req.body && req.body.paths && Array.isArray(req.body.paths)) {
        // Option for path mapping
      }
      
      const targetDir = path.join(scanDir, subDir);
      await fs.ensureDir(targetDir);
      cb(null, targetDir);
    } catch (err) {
      cb(err, UPLOADS_DIR);
    }
  },
  filename: (req, file, cb) => {
    // Preserve original filename safely
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniquePrefix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES }
});

module.exports = upload;
