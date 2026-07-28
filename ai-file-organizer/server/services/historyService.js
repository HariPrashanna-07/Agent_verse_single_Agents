const ScanHistory = require('../models/ScanHistory');

/**
 * Fetch scan history list with pagination & calculate aggregate dashboard statistics
 */
const getHistoryAndStats = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const scans = await ScanHistory.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalScans = await ScanHistory.countDocuments();

  // Aggregate Dashboard Analytics across all completed scans
  const allScans = await ScanHistory.find();
  
  let totalFiles = 0;
  let duplicateFiles = 0;
  let organizedFiles = 0;
  let totalSize = 0;
  let totalConfidenceSum = 0;
  let confidenceCount = 0;
  const categoryCounts = new Map();

  allScans.forEach(scan => {
    totalFiles += scan.statistics.totalFiles || 0;
    duplicateFiles += scan.statistics.duplicateFiles || 0;
    organizedFiles += scan.statistics.organizedFiles || 0;
    totalSize += scan.statistics.totalSize || 0;

    if (scan.statistics.averageConfidence > 0) {
      totalConfidenceSum += scan.statistics.averageConfidence;
      confidenceCount++;
    }

    if (scan.statistics.categories) {
      for (const [cat, count] of scan.statistics.categories.entries()) {
        const existing = categoryCounts.get(cat) || 0;
        categoryCounts.set(cat, existing + count);
      }
    }
  });

  let largestCategory = 'N/A';
  let maxCatCount = 0;
  for (const [cat, count] of categoryCounts.entries()) {
    if (count > maxCatCount) {
      maxCatCount = count;
      largestCategory = cat;
    }
  }

  const avgConfidence = confidenceCount > 0 ? Math.round(totalConfidenceSum / confidenceCount) : 0;

  return {
    scans,
    pagination: {
      totalScans,
      page,
      limit,
      totalPages: Math.ceil(totalScans / limit) || 1
    },
    dashboardStats: {
      totalFiles,
      duplicateFiles,
      organizedFiles,
      totalSize,
      largestCategory,
      averageConfidence: avgConfidence,
      categoryBreakdown: Object.fromEntries(categoryCounts)
    }
  };
};

module.exports = {
  getHistoryAndStats
};
