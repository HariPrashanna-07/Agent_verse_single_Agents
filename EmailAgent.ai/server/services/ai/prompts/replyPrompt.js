export function buildReplyPrompt(email, tone = 'professional', customInstructions = '') {
  return `Generate an email response in tone "${tone}". Custom instructions: "${customInstructions}".
Original Email Subject: ${email.subject}
Original Email Sender: ${email.sender?.name || ''} <${email.sender?.email || ''}>
Original Email Body: ${email.body || email.bodyPreview || email.snippet}

Respond ONLY with valid JSON:
{
  "replyDraft": "Generated response string"
}`;
}
