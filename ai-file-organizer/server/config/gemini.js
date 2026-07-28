const { GoogleGenerativeAI } = require('@google/generative-ai');

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('[Gemini Client Warning]: GEMINI_API_KEY is not configured in .env file. Mock fallback or error will be triggered.');
  }
  return new GoogleGenerativeAI(apiKey || '');
};

module.exports = { getGeminiClient };
