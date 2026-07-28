const path = require('path');
const fs = require('fs-extra');
const { ORGANIZED_DIR } = require('../config/constants');
const { sanitizeFilename } = require('../utils/fileUtils');
const ScanHistory = require('../models/ScanHistory');
const logger = require('../utils/logger');

/**
 * Organize approved files into category subfolders with suggested names
 */
const organizeApprovedFiles = async (scanId, approvedFiles = []) => {
  const scanRecord = await ScanHistory.findById(scanId);
  if (!scanRecord) {
    throw new Error(`Scan record with ID ${scanId} not found.`);
  }

  const approvedMap = new Map();
  approvedFiles.forEach(item => {
    approvedMap.set(item._id.toString(), item);
  });

  const scanOrganizedDir = path.join(ORGANIZED_DIR, scanId.toString());
  await fs.ensureDir(scanOrganizedDir);

  let organizedCount = 0;

  for (const file of scanRecord.files) {
    const fileIdStr = file._id.toString();
    const userEdit = approvedMap.get(fileIdStr);

    // Skip if user explicitly unapproved/rejected this file
    if (userEdit && userEdit.approved === false) {
      file.approved = false;
      continue;
    }

    // Apply user edits if provided
    if (userEdit) {
      if (userEdit.suggestedName) file.suggestedName = sanitizeFilename(userEdit.suggestedName, file.extension);
      if (userEdit.category) file.category = userEdit.category.trim();
      file.approved = true;
    }

    const category = file.category || 'Uncategorized';
    const categoryDir = path.join(scanOrganizedDir, category);
    await fs.ensureDir(categoryDir);

    let targetFilename = file.suggestedName || file.originalName;
    targetFilename = sanitizeFilename(targetFilename, file.extension);
    
    let targetPath = path.join(categoryDir, targetFilename);

    // Prevent overwriting if destination file already exists (append counter suffix)
    let counter = 1;
    const nameWithoutExt = path.basename(targetFilename, file.extension);
    while (await fs.pathExists(targetPath)) {
      const newName = `${nameWithoutExt}_${counter}${file.extension}`;
      targetPath = path.join(categoryDir, newName);
      file.suggestedName = newName;
      counter++;
    }

    // Execute Move Operation from upload staging to organized target directory
    if (await fs.pathExists(file.originalPath)) {
      await fs.move(file.originalPath, targetPath, { overwrite: false });
      file.newPath = targetPath;
      file.organized = true;
      organizedCount++;
      logger.info(`Organized: ${file.originalName} -> ${targetPath}`);
    } else {
      logger.warn(`Source file not found for move: ${file.originalPath}`);
    }
  }

  scanRecord.status = 'organized';
  scanRecord.statistics.organizedFiles = organizedCount;
  await scanRecord.save();

  return {
    scanId: scanRecord._id,
    organizedFiles: organizedCount,
    status: scanRecord.status,
    files: scanRecord.files
  };
};

module.exports = {
  organizeApprovedFiles
};
