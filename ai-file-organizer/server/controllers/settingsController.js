const Settings = require('../models/Settings');
const logger = require('../utils/logger');

const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    logger.error('Error in getSettings controller:', error);
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const { ignoredExtensions, aiStrictness, duplicateDetectionMode, theme } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    if (Array.isArray(ignoredExtensions)) settings.ignoredExtensions = ignoredExtensions;
    if (aiStrictness) settings.aiStrictness = aiStrictness;
    if (duplicateDetectionMode) settings.duplicateDetectionMode = duplicateDetectionMode;
    if (theme) settings.theme = theme;

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully.',
      settings
    });
  } catch (error) {
    logger.error('Error in updateSettings controller:', error);
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings
};
