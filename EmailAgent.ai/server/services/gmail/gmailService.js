import { google } from 'googleapis';
import { config } from '../../config/env.js';
import { MOCK_EMAILS } from '../../utils/demoData.js';

export class GmailService {
  static getOAuthClient() {
    return new google.auth.OAuth2(
      config.google.clientId,
      config.google.clientSecret,
      config.google.redirectUri
    );
  }

  static getAuthUrl() {
    const oauth2Client = this.getOAuthClient();
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/gmail.readonly',
    ];
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: scopes,
    });
  }

  static async getTokensFromCode(code) {
    const oauth2Client = this.getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  }

  static async fetchInboxMessages(userTokens, options = {}) {
    // Return mock data in Demo Mode or when live credentials missing
    if (config.isDemoMode || !userTokens?.accessToken) {
      return {
        messages: MOCK_EMAILS,
        nextPageToken: null,
        resultSizeEstimate: MOCK_EMAILS.length,
      };
    }

    try {
      const oauth2Client = this.getOAuthClient();
      oauth2Client.setCredentials({
        access_token: userTokens.accessToken,
        refresh_token: userTokens.refreshToken,
      });

      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults: options.maxResults || 20,
        pageToken: options.pageToken,
        q: options.q || 'label:INBOX',
      });

      const rawMessages = response.data.messages || [];
      const messages = [];

      for (const msg of rawMessages) {
        const fullMsg = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'full',
        });
        messages.push(this.parseGmailMessage(fullMsg.data));
      }

      return {
        messages,
        nextPageToken: response.data.nextPageToken,
        resultSizeEstimate: response.data.resultSizeEstimate,
      };
    } catch (error) {
      console.error('[GmailService] Error fetching messages:', error.message);
      return { messages: MOCK_EMAILS, nextPageToken: null, resultSizeEstimate: MOCK_EMAILS.length };
    }
  }

  static parseGmailMessage(raw) {
    const headers = raw.payload?.headers || [];
    const getHeader = (name) => headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    const subject = getHeader('Subject') || '(No Subject)';
    const fromStr = getHeader('From');
    const toStr = getHeader('To');
    const dateStr = getHeader('Date');

    const parseContact = (str) => {
      const match = str.match(/^(?:"?([^"]*)"?\s)?(?:<(.+)>)?$/);
      if (match) {
        return { name: match[1] || match[2] || str, email: match[2] || match[1] || str };
      }
      return { name: str, email: str };
    };

    return {
      gmailMessageId: raw.id,
      threadId: raw.threadId,
      subject,
      sender: parseContact(fromStr),
      recipient: parseContact(toStr),
      snippet: raw.snippet || '',
      bodyPreview: (raw.snippet || '').substring(0, 250),
      bodyFetched: false,
      body: '',
      date: dateStr ? new Date(dateStr) : new Date(),
      labels: raw.labelIds || ['INBOX'],
      isRead: !(raw.labelIds || []).includes('UNREAD'),
      hasAttachments: (raw.payload?.parts || []).some((p) => p.filename && p.filename.length > 0),
      aiStatus: 'NOT_ANALYZED',
    };
  }
}
