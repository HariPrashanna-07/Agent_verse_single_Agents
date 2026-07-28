import { Email } from '../../models/Email.js';
import { GmailService } from '../gmail/gmailService.js';
import { MOCK_EMAILS } from '../../utils/demoData.js';
import { config } from '../../config/env.js';

let syncState = {
  lastSync: new Date(Date.now() - 1000 * 60 * 2), // 2 mins ago default
  syncDuration: 1450, // ms
  emailsSynced: MOCK_EMAILS.length,
  syncStatus: 'IDLE', // IDLE | SYNCING | COMPLETED | FAILED
  syncErrors: [],
};

export class SyncService {
  static getSyncState() {
    return { ...syncState };
  }

  static async syncUserInbox(user) {
    const startTime = Date.now();
    syncState.syncStatus = 'SYNCING';
    syncState.syncErrors = [];

    try {
      if (config.isDemoMode) {
        // Ensure mock emails are synced into MongoDB or in-memory array
        for (const mock of MOCK_EMAILS) {
          try {
            await Email.findOneAndUpdate(
              { gmailMessageId: mock.gmailMessageId, userId: user._id },
              { ...mock, userId: user._id },
              { upsert: true, new: true }
            );
          } catch (e) {
            // Memory mode fallback silently handled
          }
        }
        syncState.emailsSynced = MOCK_EMAILS.length;
        syncState.lastSync = new Date();
        syncState.syncDuration = Date.now() - startTime;
        syncState.syncStatus = 'COMPLETED';
        return { success: true, count: MOCK_EMAILS.length, duration: syncState.syncDuration };
      }

      const fetched = await GmailService.fetchInboxMessages({
        accessToken: user.accessToken,
        refreshToken: user.refreshToken,
      });

      let count = 0;
      for (const msg of fetched.messages) {
        await Email.findOneAndUpdate(
          { gmailMessageId: msg.gmailMessageId, userId: user._id },
          { ...msg, userId: user._id },
          { upsert: true, new: true }
        );
        count++;
      }

      syncState.emailsSynced = count;
      syncState.lastSync = new Date();
      syncState.syncDuration = Date.now() - startTime;
      syncState.syncStatus = 'COMPLETED';

      return { success: true, count, duration: syncState.syncDuration };
    } catch (error) {
      console.error('[SyncService] Sync failed:', error.message);
      syncState.syncStatus = 'FAILED';
      syncState.syncErrors.push(error.message);
      return { success: false, error: error.message };
    }
  }
}
