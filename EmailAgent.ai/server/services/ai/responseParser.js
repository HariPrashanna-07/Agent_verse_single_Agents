export class ResponseParser {
  static parseAndCleanJSON(rawText) {
    if (!rawText) throw new Error('Empty response from AI Service');

    let cleaned = rawText.trim();

    // Strip markdown code block wrapper if present
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      return JSON.parse(cleaned);
    } catch (firstErr) {
      try {
        const repaired = cleaned
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']')
          .replace(/[\u0000-\u001F]+/g, ' ');
        return JSON.parse(repaired);
      } catch (secondErr) {
        console.error('[ResponseParser] Failed to parse JSON:', cleaned);
        throw new Error('AI output could not be parsed as valid JSON');
      }
    }
  }

  static validateAnalysisSchema(parsed) {
    return {
      summary: {
        short: parsed.summary?.short || 'No summary generated.',
        detailed: parsed.summary?.detailed || parsed.summary?.short || 'Detailed summary unavailable.',
      },
      category: ['Work', 'Finance', 'Education', 'Personal', 'Shopping', 'Travel', 'Health', 'Social', 'Promotions', 'Other'].includes(
        parsed.category
      )
        ? parsed.category
        : 'Work',
      urgency: ['Urgent', 'Medium', 'Low'].includes(parsed.urgency) ? parsed.urgency : 'Low',
      sentiment: ['Positive', 'Neutral', 'Negative', 'Mixed'].includes(parsed.sentiment) ? parsed.sentiment : 'Neutral',
      tasks: Array.isArray(parsed.tasks)
        ? parsed.tasks.map((t) => ({ task: t.task || 'Action item', deadline: t.deadline || 'None', status: 'pending' }))
        : [],
      deadlines: Array.isArray(parsed.deadlines)
        ? parsed.deadlines.map((d) => ({ description: d.description || 'Deadline', date: d.date || 'Soon', time: d.time || '11:59 PM' }))
        : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : ['Email'],
      replyDrafts: {
        professional: parsed.replyDrafts?.professional || 'Thank you for your email. I have received it.',
        friendly: parsed.replyDrafts?.friendly || 'Thanks for reaching out! Got your message.',
        formal: parsed.replyDrafts?.formal || 'I confirm receipt of your correspondence.',
        short: parsed.replyDrafts?.short || 'Received, thank you.',
        detailed: parsed.replyDrafts?.detailed || 'Thank you for your message. I am reviewing the details and will get back to you shortly.',
      },
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.92,
    };
  }
}
