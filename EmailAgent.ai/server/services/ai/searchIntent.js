import { config } from '../../config/env.js';
import { PromptBuilder } from './promptBuilder.js';
import { ResponseParser } from './responseParser.js';
import { AIProvider } from './aiProvider.js';

const KEYWORD_MAP = {
  anime: ['anime', 'crunchyroll', 'funimation', 'animation', 'manga', 'stream', 'otaku'],
  games: ['games', 'gaming', 'steam', 'playstation', 'xbox', 'nintendo', 'epic games', 'twitch', 'discord', 'gamepass', 'riot', 'ubisoft', 'blizzard', 'roblox'],
  game: ['game', 'gaming', 'steam', 'playstation', 'xbox', 'nintendo', 'epic games', 'twitch', 'discord', 'gamepass', 'riot', 'ubisoft', 'blizzard', 'roblox'],
  entertainment: ['entertainment', 'movie', 'show', 'netflix', 'spotify', 'youtube', 'prime video', 'hulu', 'disney', 'hbo', 'cinema', 'music', 'concert', 'ticket'],
  work: ['work', 'job', 'project', 'meeting', 'office', 'task', 'career', 'team', 'slack', 'jira'],
  finance: ['finance', 'invoice', 'bill', 'payment', 'bank', 'receipt', 'tax', 'salary', 'paypal', 'stripe'],
  shopping: ['shopping', 'order', 'shipping', 'amazon', 'delivery', 'package', 'tracking', 'store'],
  social: ['social', 'linkedin', 'twitter', 'facebook', 'instagram', 'github', 'invitation', 'connection'],
};

export async function parseSearchIntent(userQuery) {
  const queryLower = userQuery.toLowerCase().trim();
  let category = 'All';
  let urgency = 'All';

  if (queryLower.includes('work') || queryLower.includes('job') || queryLower.includes('interview')) category = 'Work';
  if (queryLower.includes('invoice') || queryLower.includes('bill') || queryLower.includes('payment') || queryLower.includes('financial')) category = 'Finance';
  if (queryLower.includes('urgent') || queryLower.includes('asap') || queryLower.includes('important')) urgency = 'Urgent';

  const baseKeywords = queryLower.split(/\s+/).filter((w) => w.length > 2);
  const expandedKeywords = new Set(baseKeywords);

  Object.keys(KEYWORD_MAP).forEach((key) => {
    if (queryLower.includes(key)) {
      KEYWORD_MAP[key].forEach((k) => expandedKeywords.add(k));
    }
  });

  const defaultIntent = {
    category,
    urgency,
    isRead: queryLower.includes('unread') ? false : null,
    hasAttachments: queryLower.includes('receipt') || queryLower.includes('attachment') || queryLower.includes('invoice') ? true : null,
    keywords: Array.from(expandedKeywords),
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

    const parsed = ResponseParser.parseAndCleanJSON(rawText);
    const aiKeywords = Array.isArray(parsed.keywords) ? parsed.keywords : [];
    aiKeywords.forEach((k) => expandedKeywords.add(k.toLowerCase()));

    return {
      ...parsed,
      keywords: Array.from(expandedKeywords),
    };
  } catch (error) {
    console.warn(`[SearchIntent] AI Provider error (${error.message}). Serving fallback search intent.`);
    return defaultIntent;
  }
}
