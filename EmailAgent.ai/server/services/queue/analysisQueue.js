import { Email } from '../../models/Email.js';
import { AIAnalysis } from '../../models/AIAnalysis.js';
import { analyzeEmailWithGemini } from '../gemini/analyzeEmail.js';

class QueueManager {
  constructor() {
    this.concurrency = 2; // Process 2 emails at a time to stay under API limits
    this.delayMs = 500; // 500ms delay between calls
    this.isProcessing = false;
    this.queue = [];
    this.progress = {
      active: false,
      processed: 0,
      total: 0,
      currentSubject: '',
      errors: 0,
    };
  }

  getProgress() {
    return { ...this.progress };
  }

  async enqueueBatch(emailIds, userId) {
    if (this.progress.active) {
      return { success: false, message: 'Batch analysis already in progress' };
    }

    this.queue = emailIds.map((id) => ({ emailId: id, userId }));
    this.progress = {
      active: true,
      processed: 0,
      total: emailIds.length,
      currentSubject: 'Initializing...',
      errors: 0,
    };

    // Run processing asynchronously without blocking API response
    this.processQueue();

    return { success: true, message: `Queued ${emailIds.length} emails for batch analysis`, total: emailIds.length };
  }

  async processQueue() {
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      try {

        let email = await Email.findById(item.emailId);
        if (!email) {
          email = { _id: item.emailId, subject: 'Demo Email Item', date: new Date() };
        }

        this.progress.currentSubject = email.subject || 'Processing email';
        await Email.findByIdAndUpdate(item.emailId, { aiStatus: 'ANALYZING' });

        const result = await analyzeEmailWithGemini(email);

        await AIAnalysis.create({
          ...result,
          emailId: item.emailId,
          userId: item.userId,
          analysisVersion: 1,
        });

        await Email.findByIdAndUpdate(item.emailId, { aiStatus: 'ANALYZED' });
        this.progress.processed++;
      } catch (err) {
        console.error('[AnalysisQueue] Item error:', err.message);
        await Email.findByIdAndUpdate(item.emailId, { aiStatus: 'FAILED' });
        this.progress.errors++;
        this.progress.processed++;
      }

      await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    }

    this.progress.active = false;
    this.progress.currentSubject = 'Completed';
    this.isProcessing = false;
  }
}

export const analysisQueue = new QueueManager();
