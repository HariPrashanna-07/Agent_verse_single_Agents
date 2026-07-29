import { getGroqClient } from './groqClient.js';
import { config } from '../../config/env.js';

export class AIProvider {
  static async createCompletion({ prompt, systemPrompt, temperature = 0.2, responseFormat = 'json_object' }) {
    if (config.ai.provider === 'groq') {
      const client = getGroqClient();
      if (!client) {
        throw new Error('Groq API Key is missing. Please set GROQ_API_KEY in server/.env');
      }

      const messages = [];
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const completionOptions = {
        messages,
        model: config.ai.model || 'openai/gpt-oss-20b',
        temperature,
      };

      if (responseFormat === 'json_object') {
        completionOptions.response_format = { type: 'json_object' };
      }

      const completion = await client.chat.completions.create(completionOptions);
      return completion.choices[0]?.message?.content || '';
    }

    throw new Error(`Unsupported AI Provider: ${config.ai.provider}`);
  }
}
