const scannerService = require('../services/scannerService');
const logger = require('../utils/logger');

const scanFolder = async (req, res, next) => {
  try {
    const files = req.files;
    const { folderName } = req.body;
    const scanId = req.scanId || `scan_${Date.now()}`;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded. Please attach files using webkitdirectory folder upload.'
      });
    }

    const scanResult = await scannerService.processUploadedScan(scanId, files, folderName);

    res.status(201).json({
      success: true,
      message: 'Folder scanned successfully.',
      scanId: scanResult._id,
      folderName: scanResult.folderName,
      statistics: scanResult.statistics,
      files: scanResult.files
    });
  } catch (error) {
    logger.error('Error in scanFolder controller:', error);
    next(error);
  }
};

module.exports = {
  scanFolder
};
