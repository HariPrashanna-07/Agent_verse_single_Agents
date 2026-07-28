const path = require('path');
const fs = require('fs-extra');
const { generateFileHash } = require('../utils/hashUtils');
const { extractTextFromFile } = require('./extractorService');
const ScanHistory = require('../models/ScanHistory');
const logger = require('../utils/logger');

/**
 * Process uploaded files and build metadata + text index for scan session
 */
const processUploadedScan = async (scanId, files, folderName = 'Uploaded Folder') => {
  if (!files || files.length === 0) {
    throw new Error('No files were uploaded for scanning.');
  }

  logger.info(`Processing scan session ${scanId} with ${files.length} files.`);

  const processedFiles = [];
  let totalSize = 0;
  let duplicateCount = 0;
  const hashSet = new Set();

  for (const file of files) {
    const originalPath = file.path;
    const stats = await fs.stat(originalPath);
    const ext = path.extname(file.originalname).toLowerCase() || '.bin';
    const size = stats.size;
    totalSize += size;

    // Calculate SHA256 Hash
    const hash = await generateFileHash(originalPath);

    // Layer 1 Exact Hash Check
    let isDuplicate = false;
    let duplicateStatus = 'Unique';
    let duplicateReason = '';

    if (hashSet.has(hash)) {
      isDuplicate = true;
      duplicateStatus = 'Duplicate';
      duplicateReason = 'Exact SHA256 byte-for-byte duplicate';
      duplicateCount++;
    } else {
      hashSet.add(hash);
    }

    // Extract text content for supported formats
    const extractedText = await extractTextFromFile(originalPath, ext);

    processedFiles.push({
      originalName: file.originalname,
      suggestedName: file.originalname, // Default initial suggestion
      originalPath,
      newPath: '',
      extension: ext,
      category: 'Uncategorized',
      summary: '',
      confidence: 0,
      reason: '',
      hash,
      isDuplicate,
      duplicateStatus,
      duplicateReason,
      size,
      extractedText,
      approved: true,
      organized: false
    });
  }

  // Create database record
  const scanRecord = new ScanHistory({
    _id: scanId.startsWith('scan_') ? undefined : scanId,
    folderName: folderName || 'Uploaded Folder',
    status: 'scanned',
    statistics: {
      totalFiles: processedFiles.length,
      duplicateFiles: duplicateCount,
      organizedFiles: 0,
      totalSize,
      averageConfidence: 0,
      categories: new Map([['Uncategorized', processedFiles.length]])
    },
    files: processedFiles
  });

  await scanRecord.save();
  logger.info(`Scan session ${scanRecord._id} saved successfully to database.`);

  return scanRecord;
};

module.exports = {
  processUploadedScan
};
