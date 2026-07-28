const fs = require('fs-extra');
const path = require('path');
const ScanHistory = require('../models/ScanHistory');
const logger = require('../utils/logger');

/**
 * Revert organized files back to their original upload staging positions
 */
const undoOrganization = async (scanId) => {
  const scanRecord = await ScanHistory.findById(scanId);
  if (!scanRecord) {
    throw new Error(`Scan record with ID ${scanId} not found.`);
  }

  if (scanRecord.status !== 'organized') {
    throw new Error(`Cannot undo scan ${scanId} with current status '${scanRecord.status}'. Only organized scans can be undone.`);
  }

  let revertedCount = 0;

  for (const file of scanRecord.files) {
    if (file.organized && file.newPath && (await fs.pathExists(file.newPath))) {
      // Ensure target staging folder exists
      await fs.ensureDir(path.dirname(file.originalPath));

      // Move back to original upload staging location
      await fs.move(file.newPath, file.originalPath, { overwrite: true });
      
      file.organized = false;
      file.newPath = '';
      revertedCount++;
      logger.info(`Reverted: ${file.suggestedName} -> ${file.originalPath}`);
    }
  }

  scanRecord.status = 'undone';
  scanRecord.statistics.organizedFiles = 0;
  await scanRecord.save();

  return {
    scanId: scanRecord._id,
    revertedCount,
    status: scanRecord.status
  };
};

module.exports = {
  undoOrganization
};
