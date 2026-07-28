const { undoOrganization } = require('../services/undoService');
const logger = require('../utils/logger');

const undoScan = async (req, res, next) => {
  try {
    const { scanId } = req.body;

    if (!scanId) {
      return res.status(400).json({
        success: false,
        message: 'Missing scanId parameter.'
      });
    }

    const result = await undoOrganization(scanId);

    res.status(200).json({
      success: true,
      message: `Successfully undone organization for scan ${scanId}. Reverted ${result.revertedCount} files.`,
      scanId: result.scanId,
      revertedCount: result.revertedCount,
      status: result.status
    });
  } catch (error) {
    logger.error('Error in undoScan controller:', error);
    next(error);
  }
};

module.exports = {
  undoScan
};
