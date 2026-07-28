import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../../config/env.js';
import { PromptBuilder } from './promptBuilder.js';
import { ResponseParser } from './responseParser.js';

export async function parseSearchIntentWithGemini(userQuery) {
  if (config.isDemoMode || !config.gemini.apiKey) {
    const queryLower = userQuery.toLowerCase();
    let category = 'All';
    let urgency = 'All';

    if (queryLower.includes('work') || queryLower.includes('job') || queryLower.includes('interview')) category = 'Work';
    if (queryLower.includes('invoice') || queryLower.includes('bill') || queryLower.includes('payment') || queryLower.includes('financial')) category = 'Finance';
    if (queryLower.includes('urgent') || queryLower.includes('asap') || queryLower.includes('important')) urgency = 'Urgent';

    return {
      category,
      urgency,
      isRead: queryLower.includes('unread') ? false : null,
      hasAttachments: queryLower.includes('receipt') || queryLower.includes('attachment') || queryLower.includes('invoice') ? true : null,
      keywords: userQuery.split(' ').filter((w) => w.length > 3),
      suggestedGmailQuery: `label:${category.toLowerCase()} ${userQuery}`,
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    const model = genAI.getGenerativeModel({ model: config.gemini.model });
    const prompt = PromptBuilder.buildSearchIntentPrompt(userQuery);

    const response = await model.generateContent(prompt);
    return ResponseParser.parseAndCleanJSON(response.response.text());
  } catch (error) {
    console.error('[SearchIntent] Error parsing search intent:', error.message);
    return {
      category: 'All',
      urgency: 'All',
      keywords: [userQuery],
      suggestedGmailQuery: userQuery,
    };
  }
}
