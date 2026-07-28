const { organizeApprovedFiles } = require('../services/organizerService');
const logger = require('../utils/logger');

const organizeFiles = async (req, res, next) => {
  try {
    const { scanId, approvedFiles } = req.body;

    if (!scanId) {
      return res.status(400).json({
        success: false,
        message: 'Missing scanId parameter.'
      });
    }

    const result = await organizeApprovedFiles(scanId, approvedFiles || []);

    res.status(200).json({
      success: true,
      message: `Successfully organized ${result.organizedFiles} files.`,
      scanId: result.scanId,
      status: result.status,
      organizedFiles: result.organizedFiles,
      files: result.files
    });
  } catch (error) {
    logger.error('Error in organizeFiles controller:', error);
    next(error);
  }
};

module.exports = {
  organizeFiles
};
