import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../../config/env.js';
import { PromptBuilder } from './promptBuilder.js';
import { ResponseParser } from './responseParser.js';

export async function parseSearchIntentWithGemini(userQuery) {
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

  if (!config.gemini.apiKey) {
    return defaultIntent;
  }

  const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  const prompt = PromptBuilder.buildSearchIntentPrompt(userQuery);
  const modelCandidates = [
    config.gemini.model,
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash-002',
    'gemini-1.5-flash-001',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro-002',
    'gemini-1.5-pro-001',
  ].filter((m, i, self) => m && self.indexOf(m) === i);

  for (const modelName of modelCandidates) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const response = await model.generateContent(prompt);
      return ResponseParser.parseAndCleanJSON(response.response.text());
    } catch (error) {
      console.warn(`[SearchIntent] Model "${modelName}" failed (${error.message}). Trying next candidate...`);
    }
  }

  return defaultIntent;
}
