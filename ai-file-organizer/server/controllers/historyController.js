const { getHistoryAndStats } = require('../services/historyService');
const logger = require('../utils/logger');

const getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const data = await getHistoryAndStats(page, limit);

    res.status(200).json({
      success: true,
      scans: data.scans,
      pagination: data.pagination,
      dashboardStats: data.dashboardStats
    });
  } catch (error) {
    logger.error('Error in getHistory controller:', error);
    next(error);
  }
};

module.exports = {
  getHistory
};
