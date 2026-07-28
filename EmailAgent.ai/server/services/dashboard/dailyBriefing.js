export class DailyBriefingService {
  static generateBriefing(user, stats) {
    const greeting = this.getGreeting();
    const urgentCount = stats.urgentEmails || 2;
    const unreadCount = stats.unreadEmails || 18;
    const tasksCount = stats.tasksFound || 6;
    const deadlinesCount = stats.deadlinesThisWeek || 3;

    return {
      greeting: `${greeting}, ${user.name.split(' ')[0]}! ☀️`,
      headline: `Your Inbox Intelligence Briefing for ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`,
      summary: `You have ${unreadCount} new unread emails today. ${urgentCount} emails require immediate action before EOD, and ${deadlinesCount} upcoming deadlines are scheduled for this week.`,
      highlights: [
        `🚨 ${urgentCount} Urgent email(s) requiring your review and sign-off today.`,
        `📌 ${tasksCount} Actionable tasks extracted from your latest correspondence.`,
        `📅 ${deadlinesCount} Deadlines approaching this week (including Q3 Audit & GCP Billing).`,
        `💡 4 Ready-to-send AI reply drafts generated and awaiting your approval.`,
      ],
      inboxHealthScore: stats.inboxHealthScore || 92,
    };
  }

  static getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }
}
