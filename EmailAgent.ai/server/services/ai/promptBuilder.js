import { buildAnalyzePrompt } from './prompts/analyzePrompt.js';
import { buildReplyPrompt } from './prompts/replyPrompt.js';
import { buildSearchPrompt } from './prompts/searchPrompt.js';
import { buildDailyBriefingPrompt } from './prompts/dailyBriefingPrompt.js';

export class PromptBuilder {
  static buildAnalysisPrompt(email) {
    return buildAnalyzePrompt(email);
  }

  static buildReplyPrompt(email, tone = 'professional', customInstructions = '') {
    return buildReplyPrompt(email, tone, customInstructions);
  }

  static buildSearchIntentPrompt(userQuery) {
    return buildSearchPrompt(userQuery);
  }

  static buildBriefingPrompt(user, stats) {
    return buildDailyBriefingPrompt(user, stats);
  }
}
