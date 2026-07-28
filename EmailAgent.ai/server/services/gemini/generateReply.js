import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../../config/env.js';
import { PromptBuilder } from './promptBuilder.js';
import { ResponseParser } from './responseParser.js';

export async function generateCustomReplyWithGemini(email, tone = 'professional', customInstructions = '') {
  if (config.isDemoMode || !config.gemini.apiKey) {
    const toneResponses = {
      professional: `Hi ${email.sender?.name || 'there'},\n\nThank you for your email regarding "${email.subject}". I have reviewed the details and will follow up shortly.\n\nBest regards,\nAlex Rivera`,
      friendly: `Hey ${email.sender?.name || 'there'}!\n\nThanks for reaching out about "${email.subject}". Super excited to get this moving forward!\n\nCheers,\nAlex`,
      formal: `Dear ${email.sender?.name || 'Sir/Madam'},\n\nI confirm receipt of your email subject line "${email.subject}". The necessary actions are currently underway.\n\nSincerely,\nAlex Rivera`,
      short: `Hi, got your message about "${email.subject}". I will take care of it today! Thanks, Alex.`,
      detailed: `Hi ${email.sender?.name || 'there'},\n\nThank you for reaching out regarding "${email.subject}". I have noted all your key points and action items. I am working on the deliverables now and will send a complete update by the end of the day.\n\nBest regards,\nAlex Rivera`,
    };

    return {
      replyDraft: toneResponses[tone] || toneResponses.professional,
      tone,
      customInstructions,
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    const model = genAI.getGenerativeModel({ model: config.gemini.model });
    const prompt = PromptBuilder.buildReplyPrompt(email, tone, customInstructions);

    const response = await model.generateContent(prompt);

    const parsed = ResponseParser.parseAndCleanJSON(response.response.text());
    return {
      replyDraft: parsed.replyDraft || 'Thank you for your email.',
      tone,
      customInstructions,
    };
  } catch (error) {
    console.error('[GenerateReply] Error generating reply:', error.message);
    return {
      replyDraft: `Hi ${email.sender?.name || 'there'},\n\nThank you for your message regarding "${email.subject}". I will review this and respond shortly.\n\nBest regards,`,
      tone,
    };
  }
}
