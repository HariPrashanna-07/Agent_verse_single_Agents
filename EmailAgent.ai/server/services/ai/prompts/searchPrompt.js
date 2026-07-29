export function buildSearchPrompt(userQuery) {
  return `Analyze the following natural language email search query and extract structured filter intent.
User Query: "${userQuery}"

Respond ONLY with valid JSON:
{
  "category": "Work" | "Finance" | "Education" | "Personal" | "Promotions" | "All",
  "urgency": "Urgent" | "Medium" | "Low" | "All",
  "isRead": boolean | null,
  "hasAttachments": boolean | null,
  "keywords": ["extracted", "search", "terms"],
  "suggestedGmailQuery": "Gmail search bar format like 'label:WORK invoice'"
}`;
}
