const { compareDocumentsForDuplicate } = require('./geminiService');
const logger = require('../utils/logger');

/**
 * Perform 2-Layer Duplicate Detection across a list of scanned file records
 * Layer 1: Exact SHA256 checksum matching
 * Layer 2: Gemini Semantic Document comparison
 */
const detectDuplicates = async (files) => {
  const hashMap = new Map();

  // Layer 1: SHA256 Checksum Mapping
  files.forEach(file => {
    if (hashMap.has(file.hash)) {
      hashMap.get(file.hash).push(file);
    } else {
      hashMap.set(file.hash, [file]);
    }
  });

  // Flag Layer 1 Duplicates
  for (const [hash, fileGroup] of hashMap.entries()) {
    if (fileGroup.length > 1) {
      // First file is primary, rest are exact duplicates
      for (let i = 1; i < fileGroup.length; i++) {
        fileGroup[i].isDuplicate = true;
        fileGroup[i].duplicateStatus = 'Duplicate';
        fileGroup[i].duplicateReason = `Exact SHA256 match with ${fileGroup[0].originalName}`;
      }
    }
  }

  // Layer 2: Gemini Semantic Check for non-exact duplicate pairs
  const uniqueFiles = files.filter(f => f.duplicateStatus === 'Unique');
  
  // Find potential pairs with text content available
  for (let i = 0; i < uniqueFiles.length; i++) {
    for (let j = i + 1; j < uniqueFiles.length; j++) {
      const fileA = uniqueFiles[i];
      const fileB = uniqueFiles[j];

      // Check if candidate for Layer 2 evaluation (same extension or close size ratio)
      const sameExt = fileA.extension === fileB.extension;
      const sizeRatio = Math.min(fileA.size, fileB.size) / Math.max(fileA.size, fileB.size);

      if (sameExt && sizeRatio > 0.8 && fileA.extractedText && fileB.extractedText) {
        logger.info(`Running Layer 2 Gemini duplicate check between ${fileA.originalName} and ${fileB.originalName}`);
        
        const result = await compareDocumentsForDuplicate(
          { name: fileA.originalName, text: fileA.extractedText },
          { name: fileB.originalName, text: fileB.extractedText }
        );

        if (result.status === 'Duplicate' || result.status === 'Possibly Duplicate') {
          fileB.isDuplicate = true;
          fileB.duplicateStatus = result.status;
          fileB.duplicateReason = `${result.status} of ${fileA.originalName}: ${result.reason}`;
        }
      }
    }
  }

  return files;
};

module.exports = {
  detectDuplicates
};
