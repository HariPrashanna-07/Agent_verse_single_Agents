import { StatisticsService } from '../services/dashboard/statistics.js';
import { DailyBriefingService } from '../services/dashboard/dailyBriefing.js';

export async function getDashboardOverview(req, res) {
  try {
    const stats = await StatisticsService.getDashboardMetrics(req.user._id);
    const briefing = DailyBriefingService.generateBriefing(req.user, stats);

    res.json({
      success: true,
      briefing,
      stats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
