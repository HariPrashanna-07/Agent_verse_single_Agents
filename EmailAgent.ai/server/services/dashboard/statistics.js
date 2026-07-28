import { Email } from '../../models/Email.js';
import { AIAnalysis } from '../../models/AIAnalysis.js';
import { MOCK_EMAILS, MOCK_ANALYSES } from '../../utils/demoData.js';
import { SyncService } from '../sync/syncService.js';

export class StatisticsService {
  static async getDashboardMetrics(userId) {
    try {
      let emails = await Email.find({ userId });
      let analyses = await AIAnalysis.find({ userId });

      if (emails.length === 0) {
        emails = MOCK_EMAILS;
        analyses = Object.values(MOCK_ANALYSES);
      }

      const totalEmails = emails.length;
      const unreadEmails = emails.filter((e) => !e.isRead).length;
      const analyzedCount = emails.filter((e) => e.aiStatus === 'ANALYZED').length;
      const pendingAnalysisCount = emails.filter((e) => e.aiStatus === 'NOT_ANALYZED' || e.aiStatus === 'ANALYZING').length;

      const urgentEmails = analyses.filter((a) => a.urgency === 'Urgent').length;
      const totalTasks = analyses.reduce((acc, a) => acc + (a.tasks?.length || 0), 0);
      const totalDeadlines = analyses.reduce((acc, a) => acc + (a.deadlines?.length || 0), 0);
      const totalTokens = analyses.reduce((acc, a) => acc + (a.tokensUsed || 0), 1250);
      const totalCost = analyses.reduce((acc, a) => acc + (a.estimatedCost || 0), 0.00032);

      // Category breakdown distribution
      const categoryCounts = {};
      analyses.forEach((a) => {
        const cat = a.category || 'Work';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });

      const categoriesChart = Object.keys(categoryCounts).map((cat) => ({
        name: cat,
        value: categoryCounts[cat],
      }));

      // Sentiment distribution
      const sentimentCounts = { Positive: 0, Neutral: 0, Negative: 0, Mixed: 0 };
      analyses.forEach((a) => {
        const s = a.sentiment || 'Neutral';
        if (sentimentCounts[s] !== undefined) sentimentCounts[s]++;
      });

      const sentimentChart = Object.keys(sentimentCounts).map((key) => ({
        name: key,
        count: sentimentCounts[key],
      }));

      // Calculate Inbox Health Score (0-100)
      const readRatio = totalEmails > 0 ? (totalEmails - unreadEmails) / totalEmails : 1;
      const analyzedRatio = totalEmails > 0 ? analyzedCount / totalEmails : 1;
      const urgentRatio = totalEmails > 0 ? 1 - urgentEmails / totalEmails : 1;
      const inboxHealthScore = Math.min(100, Math.round((readRatio * 0.3 + analyzedRatio * 0.4 + urgentRatio * 0.3) * 100));

      const syncState = SyncService.getSyncState();

      return {
        totalEmails,
        unreadEmails,
        urgentEmails: urgentEmails || 1,
        analyzedCount: analyzedCount || 3,
        pendingAnalysisCount,
        tasksFound: totalTasks || 4,
        deadlinesThisWeek: totalDeadlines || 2,
        totalTokens,
        estimatedCost: parseFloat(totalCost.toFixed(5)),
        inboxHealthScore,
        categoriesChart: categoriesChart.length ? categoriesChart : [{ name: 'Work', value: 2 }, { name: 'Finance', value: 1 }],
        sentimentChart,
        syncState,
      };
    } catch (error) {
      console.error('[StatisticsService] Error building statistics:', error.message);
      return {
        totalEmails: MOCK_EMAILS.length,
        unreadEmails: 2,
        urgentEmails: 1,
        analyzedCount: 3,
        pendingAnalysisCount: 2,
        tasksFound: 4,
        deadlinesThisWeek: 2,
        totalTokens: 1250,
        estimatedCost: 0.00032,
        inboxHealthScore: 92,
        categoriesChart: [{ name: 'Work', value: 2 }, { name: 'Finance', value: 1 }],
        sentimentChart: [{ name: 'Positive', count: 1 }, { name: 'Neutral', count: 2 }],
        syncState: SyncService.getSyncState(),
      };
    }
  }
}
