import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../../config/env.js';
import { PromptBuilder } from './promptBuilder.js';
import { ResponseParser } from './responseParser.js';
import { MOCK_ANALYSES } from '../../utils/demoData.js';

export async function analyzeEmailWithGemini(email) {
  const startTime = Date.now();

  // If in Demo Mode or missing API Key, return instant mock analysis
  if (config.isDemoMode || !config.gemini.apiKey) {
    const mock = MOCK_ANALYSES[email._id] || MOCK_ANALYSES['email_101'];
    return {
      ...mock,
      emailId: email._id,
      processingTime: Date.now() - startTime,
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    const model = genAI.getGenerativeModel({ model: config.gemini.model });
    const prompt = PromptBuilder.buildAnalysisPrompt(email);

    const response = await model.generateContent(prompt);
    const rawText = response.response.text();
    const parsed = ResponseParser.parseAndCleanJSON(rawText);
    const validated = ResponseParser.validateAnalysisSchema(parsed);

    const processingTime = Date.now() - startTime;
    const tokensUsed = 450;
    const estimatedCost = (tokensUsed / 1000) * 0.0003;

    return {
      ...validated,
      tokensUsed,
      processingTime,
      estimatedCost: parseFloat(estimatedCost.toFixed(6)),
    };
  } catch (error) {
    console.error('[AnalyzeEmail] Gemini analysis failed:', error.message);
    const mock = MOCK_ANALYSES['email_101'];
    return {
      ...mock,
      emailId: email._id,
      processingTime: Date.now() - startTime,
    };
  }
}
