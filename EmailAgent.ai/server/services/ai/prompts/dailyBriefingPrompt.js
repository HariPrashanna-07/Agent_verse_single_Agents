export function buildDailyBriefingPrompt(user, stats) {
  return `Generate an executive inbox intelligence briefing for ${user.name}.
Inbox Statistics:
- Unread Emails: ${stats.unreadEmails}
- Urgent Emails: ${stats.urgentEmails}
- Actionable Tasks Found: ${stats.tasksFound}
- Deadlines This Week: ${stats.deadlinesThisWeek}
- Inbox Health Score: ${stats.inboxHealthScore}

Respond ONLY with valid JSON:
{
  "greeting": "Good Morning / Afternoon / Evening",
  "headline": "Briefing Headline",
  "summary": "1-2 sentence executive summary",
  "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"],
  "inboxHealthScore": number
}`;
}
