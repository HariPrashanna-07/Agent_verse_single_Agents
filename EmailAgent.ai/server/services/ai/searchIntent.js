import { config } from '../../config/env.js';
import { PromptBuilder } from './promptBuilder.js';
import { ResponseParser } from './responseParser.js';
import { AIProvider } from './aiProvider.js';

export async function parseSearchIntent(userQuery) {
  const queryLower = userQuery.toLowerCase();
  let category = 'All';
  let urgency = 'All';

  if (queryLower.includes('work') || queryLower.includes('job') || queryLower.includes('interview')) category = 'Work';
  if (queryLower.includes('invoice') || queryLower.includes('bill') || queryLower.includes('payment') || queryLower.includes('financial')) category = 'Finance';
  if (queryLower.includes('urgent') || queryLower.includes('asap') || queryLower.includes('important')) urgency = 'Urgent';

  const defaultIntent = {
    category,
    urgency,
    isRead: queryLower.includes('unread') ? false : null,
    hasAttachments: queryLower.includes('receipt') || queryLower.includes('attachment') || queryLower.includes('invoice') ? true : null,
    keywords: userQuery.split(' ').filter((w) => w.length > 3),
    suggestedGmailQuery: `label:${category.toLowerCase()} ${userQuery}`,
  };

  if (!config.ai.apiKey) {
    return defaultIntent;
  }

  try {
    const prompt = PromptBuilder.buildSearchIntentPrompt(userQuery);
    const rawText = await AIProvider.createCompletion({
      prompt,
      temperature: 0.2,
      responseFormat: 'json_object',
    });

    return ResponseParser.parseAndCleanJSON(rawText);
  } catch (error) {
    console.warn(`[SearchIntent] AI Provider error (${error.message}). Serving fallback search intent.`);
    return defaultIntent;
  }
}
