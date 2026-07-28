const ScanHistory = require('../models/ScanHistory');
const { analyzeDocument } = require('../services/geminiService');
const { detectDuplicates } = require('../services/duplicateService');
const logger = require('../utils/logger');

const generatePreview = async (req, res, next) => {
  try {
    const { scanId } = req.body;

    if (!scanId) {
      return res.status(400).json({
        success: false,
        message: 'Missing scanId parameter.'
      });
    }

    const scanRecord = await ScanHistory.findById(scanId);
    if (!scanRecord) {
      return res.status(404).json({
        success: false,
        message: `Scan record with ID ${scanId} not found.`
      });
    }

    logger.info(`Generating Gemini organization plan for scanId ${scanId}...`);

    let totalConfidence = 0;
    const categoryMap = new Map();

    // Batch process Gemini AI Analysis for each file
    for (const file of scanRecord.files) {
      const aiResult = await analyzeDocument(
        file.originalName,
        file.extension,
        file.extractedText
      );

      file.suggestedName = aiResult.suggestedName;
      file.category = aiResult.category;
      file.summary = aiResult.summary;
      file.confidence = aiResult.confidence;
      file.reason = aiResult.reason;

      totalConfidence += file.confidence;

      // Increment dynamic category counter
      const currentCatCount = categoryMap.get(aiResult.category) || 0;
      categoryMap.set(aiResult.category, currentCatCount + 1);
    }

    // Run 2-Layer Duplicate Detection
    scanRecord.files = await detectDuplicates(scanRecord.files);

    // Recalculate statistics
    const duplicateCount = scanRecord.files.filter(f => f.isDuplicate).length;
    const avgConfidence = scanRecord.files.length > 0 ? Math.round(totalConfidence / scanRecord.files.length) : 0;

    scanRecord.status = 'previewed';
    scanRecord.statistics.duplicateFiles = duplicateCount;
    scanRecord.statistics.averageConfidence = avgConfidence;
    scanRecord.statistics.categories = categoryMap;

    await scanRecord.save();

    logger.info(`Preview plan generated successfully for ${scanId}.`);

    res.status(200).json({
      success: true,
      message: 'AI Organization preview generated successfully.',
      scanId: scanRecord._id,
      status: scanRecord.status,
      statistics: scanRecord.statistics,
      files: scanRecord.files
    });

  } catch (error) {
    logger.error('Error in generatePreview controller:', error);
    next(error);
  }
};

module.exports = {
  generatePreview
};
