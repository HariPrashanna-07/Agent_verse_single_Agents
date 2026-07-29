export function buildAnalyzePrompt(email) {
  return `You are a world-class AI Email Intelligence Agent. Analyze the following email text and respond strictly in raw JSON without any markdown formatting or surrounding backticks.

EMAIL DATA:
Subject: ${email.subject}
Sender: ${email.sender?.name || ''} <${email.sender?.email || ''}>
Date: ${email.date}
Body:
${email.body || email.bodyPreview || email.snippet}

INSTRUCTIONS:
1. "summary": Provide a "short" (1-2 sentence TL;DR) and "detailed" (2-3 paragraph breakdown) summary.
2. "category": Must be one of ["Work", "Finance", "Education", "Personal", "Shopping", "Travel", "Health", "Social", "Promotions", "Other"].
3. "urgency": Must be one of ["Urgent", "Medium", "Low"].
4. "sentiment": Must be one of ["Positive", "Neutral", "Negative", "Mixed"].
5. "tasks": Array of objects [{ "task": string, "deadline": string }]. Extract actionable to-dos.
6. "deadlines": Array of objects [{ "description": string, "date": string, "time": string }]. Extract dates mentioned.
7. "keywords": Array of 3-6 relevant topic tags.
8. "replyDrafts": Object containing 5 distinct draft styles:
   - "professional": Polite, clear business response.
   - "friendly": Warm, engaging tone.
   - "formal": Strict executive formal tone.
   - "short": Concise 1-2 sentence reply.
   - "detailed": Itemized, thorough response.
9. "confidence": Number between 0.85 and 0.99.

EXACT OUTPUT JSON FORMAT REQUIRED:
{
  "summary": { "short": "...", "detailed": "..." },
  "category": "Work",
  "urgency": "Medium",
  "sentiment": "Neutral",
  "tasks": [{ "task": "...", "deadline": "..." }],
  "deadlines": [{ "description": "...", "date": "...", "time": "..." }],
  "keywords": ["..."],
  "replyDrafts": {
    "professional": "...",
    "friendly": "...",
    "formal": "...",
    "short": "...",
    "detailed": "..."
  },
  "confidence": 0.95
}`;
}
