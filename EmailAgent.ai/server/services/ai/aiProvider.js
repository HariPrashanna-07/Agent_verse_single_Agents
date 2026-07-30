import { getGroqClient } from './groqClient.js';
import { config } from '../../config/env.js';

export class AIProvider {
  static async createCompletion({ prompt, systemPrompt, temperature = 0.2, responseFormat = 'json_object' }) {
    if (config.ai.provider === 'groq') {
      const client = getGroqClient();
      if (!client) {
        throw new Error('Groq API Key is missing. Please set GROQ_API_KEY in server/.env');
      }

      const defaultSys = 'You are an expert AI Email Intelligence Agent. You must output raw valid JSON.';
      const messages = [
        { role: 'system', content: systemPrompt || defaultSys },
        { role: 'user', content: prompt },
      ];

      const model = config.ai.model || 'openai/gpt-oss-20b';

      try {
        const completionOptions = {
          messages,
          model,
          temperature,
        };

        if (responseFormat === 'json_object') {
          completionOptions.response_format = { type: 'json_object' };
        }

        const completion = await client.chat.completions.create(completionOptions);
        return completion.choices[0]?.message?.content || '';
      } catch (err) {
        // If Groq strict JSON mode validation fails, retry without strict response_format
        if (err.message?.includes('json_validate_failed') || err.message?.includes('Failed to validate JSON')) {
          console.warn('[AIProvider] Groq json_object strict validation failed. Retrying completion...');
          const retryCompletion = await client.chat.completions.create({
            messages,
            model,
            temperature,
          });
          return retryCompletion.choices[0]?.message?.content || '';
        }
        throw err;
      }
    }

    throw new Error(`Unsupported AI Provider: ${config.ai.provider}`);
  }
}
