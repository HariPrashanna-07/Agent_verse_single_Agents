import Groq from 'groq-sdk';
import { config } from '../../config/env.js';

let groqInstance = null;

export function getGroqClient() {
  if (!groqInstance && config.ai.apiKey) {
    groqInstance = new Groq({
      apiKey: config.ai.apiKey,
    });
  }
  return groqInstance;
}
