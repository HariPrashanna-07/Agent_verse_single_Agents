import { DEMO_USER } from '../middleware/authMiddleware.js';

export const MOCK_EMAILS = [
  {
    _id: 'email_101',
    gmailMessageId: 'msg_101',
    threadId: 'thread_101',
    userId: DEMO_USER._id,
    subject: 'URGENT: Q3 Financial Audit Report & Compliance Sign-off Needed',
    sender: { name: 'Sarah Jenkins (CFO)', email: 's.jenkins@enterprise-tech.io' },
    recipient: { name: 'Alex Rivera', email: 'alex.rivera@antigravity.ai' },
    snippet: 'Hi Alex, we need your final review on the Q3 financial audit spreadsheet before the board meeting tomorrow at 9 AM EST...',
    bodyPreview: 'Hi Alex, we need your final review on the Q3 financial audit spreadsheet before the board meeting tomorrow at 9 AM EST. Please check the attached P&L breakdown and flag any discrepancies.',
    bodyFetched: true,
    body: `<div style="font-family: sans-serif;">
      <p>Hi Alex,</p>
      <p>We need your final review on the Q3 financial audit spreadsheet before the board meeting tomorrow at <strong>9 AM EST</strong>. Please check the attached P&L breakdown and flag any discrepancies.</p>
      <p>Items requiring sign-off:</p>
      <ul>
        <li>Q3 Infrastructure & Cloud Hosting Spend ($42,500)</li>
        <li>Vendor contract renewals for Gemini API enterprise tier</li>
        <li>Tax compliance audit form 1099</li>
      </ul>
      <p>Please reply with your approval or comments before <strong>5:00 PM today</strong>.</p>
      <p>Best regards,<br/><strong>Sarah Jenkins</strong><br/>Chief Financial Officer</p>
    </div>`,
    date: new Date(Date.now() - 1000 * 60 * 25), // 25 mins ago
    labels: ['INBOX', 'IMPORTANT', 'Work'],
    isRead: false,
    hasAttachments: true,
    attachments: [{ filename: 'Q3_Financial_Audit_v4.xlsx', mimeType: 'application/vnd.ms-excel', size: 2450000 }],
    aiStatus: 'ANALYZED',
    createdAt: new Date(Date.now() - 1000 * 60 * 25),
  },
  {
    _id: 'email_102',
    gmailMessageId: 'msg_102',
    threadId: 'thread_102',
    userId: DEMO_USER._id,
    subject: 'Invitation: Technical Architecture Interview - Principal AI Engineer',
    sender: { name: 'Tech Talent Acquisition', email: 'careers@innovate-ai.com' },
    recipient: { name: 'Alex Rivera', email: 'alex.rivera@antigravity.ai' },
    snippet: 'Dear Alex, Congratulations! The engineering team was very impressed by your background. We would like to invite you for a 60-minute technical session...',
    bodyPreview: 'Dear Alex, Congratulations! The engineering team was very impressed by your background. We would like to invite you for a 60-minute technical session with our VP of Engineering next Monday at 2:00 PM PST.',
    bodyFetched: true,
    body: `<div style="font-family: sans-serif;">
      <p>Dear Alex,</p>
      <p>Congratulations! The engineering leadership team reviewed your portfolio and was exceptionally impressed by your AI Email Agent project architecture.</p>
      <p>We would love to invite you for a 60-minute Technical Architecture session with our VP of Engineering next <strong>Monday, August 3rd at 2:00 PM PST</strong>.</p>
      <p>Topics we will cover:</p>
      <ol>
        <li>Distributed Gemini LLM orchestration & rate-limiting queues</li>
        <li>Real-time Gmail OAuth sync architecture</li>
        <li>System security & token encryption at rest</li>
      </ol>
      <p>Please confirm if this time slot works for you or reply with 3 alternative slots.</p>
      <p>Warm regards,<br/><strong>Elena Rostova</strong><br/>Head of Technical Recruiting</p>
    </div>`,
    date: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
    labels: ['INBOX', 'Work', 'Education'],
    isRead: false,
    hasAttachments: false,
    attachments: [],
    aiStatus: 'ANALYZED',
    createdAt: new Date(Date.now() - 1000 * 60 * 90),
  },
  {
    _id: 'email_103',
    gmailMessageId: 'msg_103',
    threadId: 'thread_103',
    userId: DEMO_USER._id,
    subject: 'AWS & GCP Monthly Infrastructure Invoice - Payment Due Soon',
    sender: { name: 'Google Cloud Billing', email: 'no-reply@cloud.google.com' },
    recipient: { name: 'Alex Rivera', email: 'alex.rivera@antigravity.ai' },
    snippet: 'Your monthly Google Cloud invoice #GCP-948271 for $1,248.50 is ready. Auto-payment will be charged on Friday, August 1st.',
    bodyPreview: 'Your monthly Google Cloud invoice #GCP-948271 for $1,248.50 is ready. Auto-payment will be charged on Friday, August 1st.',
    bodyFetched: true,
    body: `<div><p>Your monthly Google Cloud invoice <strong>#GCP-948271</strong> for <strong>$1,248.50</strong> is now available in your console. Payment due date: <strong>August 1st, 2026</strong>.</p></div>`,
    date: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    labels: ['INBOX', 'Finance'],
    isRead: true,
    hasAttachments: true,
    attachments: [{ filename: 'Invoice_GCP_948271.pdf', mimeType: 'application/pdf', size: 340000 }],
    aiStatus: 'ANALYZED',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
  },
  {
    _id: 'email_104',
    gmailMessageId: 'msg_104',
    threadId: 'thread_104',
    userId: DEMO_USER._id,
    subject: 'PR Merged: Integrated Framer Motion animations & Lucide icon suite',
    sender: { name: 'Marcus Chen (GitHub)', email: 'notifications@github.com' },
    recipient: { name: 'Alex Rivera', email: 'alex.rivera@antigravity.ai' },
    snippet: 'marcus-chen merged commit #8f921a into main: Refactored Inbox component with glassmorphic cards and skeleton loaders.',
    bodyPreview: 'marcus-chen merged commit #8f921a into main: Refactored Inbox component with glassmorphic cards and skeleton loaders.',
    bodyFetched: false,
    body: '',
    date: new Date(Date.now() - 1000 * 60 * 60 * 8),
    labels: ['INBOX', 'Work'],
    isRead: true,
    hasAttachments: false,
    attachments: [],
    aiStatus: 'NOT_ANALYZED',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
  },
  {
    _id: 'email_105',
    gmailMessageId: 'msg_105',
    threadId: 'thread_105',
    userId: DEMO_USER._id,
    subject: 'Summer Tech Deals: 40% Off Cloud Workstations & UltraWide Monitors',
    sender: { name: 'TechGear Store', email: 'promotions@techgear-deals.com' },
    recipient: { name: 'Alex Rivera', email: 'alex.rivera@antigravity.ai' },
    snippet: 'Don’t miss out on our limited 48-hour summer sale! Upgrade your developer setup today...',
    bodyPreview: 'Don’t miss out on our limited 48-hour summer sale! Upgrade your developer setup today...',
    bodyFetched: false,
    body: '',
    date: new Date(Date.now() - 1000 * 60 * 60 * 18),
    labels: ['INBOX', 'Promotions'],
    isRead: false,
    hasAttachments: false,
    attachments: [],
    aiStatus: 'NOT_ANALYZED',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
  },
];

export const MOCK_ANALYSES = {
  email_101: {
    _id: 'analysis_101',
    emailId: 'email_101',
    userId: DEMO_USER._id,
    analysisVersion: 1,
    summary: {
      short: 'CFO Sarah Jenkins requires final review and sign-off on the Q3 financial audit report before 5:00 PM today.',
      detailed:
        'The email contains urgent financial compliance items for the upcoming board meeting tomorrow at 9 AM EST. Specific audit sections include $42,500 in cloud hosting spend, Gemini API vendor contract renewals, and 1099 tax compliance forms. Immediate response requested by 5:00 PM EST.',
    },
    category: 'Finance',
    urgency: 'Urgent',
    sentiment: 'Neutral',
    tasks: [
      { task: 'Review Q3 financial audit spreadsheet (Q3_Financial_Audit_v4.xlsx)', deadline: 'Today, 5:00 PM EST', status: 'pending' },
      { task: 'Verify cloud hosting spend ($42,500)', deadline: 'Today, 5:00 PM EST', status: 'pending' },
      { task: 'Sign off on Gemini API vendor contract renewal', deadline: 'Today, 5:00 PM EST', status: 'pending' },
    ],
    deadlines: [
      { description: 'Final Audit Sign-off', date: 'Today', time: '5:00 PM EST' },
      { description: 'Board of Directors Meeting', date: 'Tomorrow', time: '9:00 AM EST' },
    ],
    replyDrafts: {
      professional:
        'Hi Sarah,\n\nI have received the Q3 audit documents. I am currently reviewing the cloud hosting figures and vendor contracts and will send over my sign-off before 5:00 PM EST today.\n\nBest regards,\nAlex',
      friendly:
        'Hey Sarah!\n\nThanks for sending this over. I am jumping into the Q3 spreadsheet right now and will get back to you with my sign-off well before 5 PM.\n\nCheers,\nAlex',
      formal:
        'Dear Ms. Jenkins,\n\nThank you for transmitting the Q3 Financial Audit Report. I confirm receipt and will execute a formal review of the documentation prior to the 5:00 PM EST deadline today.\n\nSincerely,\nAlex Rivera',
      short: 'Hi Sarah, got it! Reviewing the spreadsheet now and will send my sign-off by 5 PM today. Thanks, Alex.',
      detailed:
        'Hi Sarah,\n\nThank you for reaching out. I have downloaded Q3_Financial_Audit_v4.xlsx and am auditing the $42,500 cloud infrastructure spend as well as the Gemini API enterprise contract renewal. Expect a detailed sign-off and itemized feedback by 4:30 PM EST.\n\nBest regards,\nAlex Rivera',
    },
    keywords: ['Financial Audit', 'Board Meeting', 'Cloud Spend', 'Gemini API', 'Tax Compliance'],
    confidence: 0.98,
    tokensUsed: 480,
    processingTime: 1120,
    estimatedCost: 0.00014,
    createdAt: new Date(Date.now() - 1000 * 60 * 20),
  },
  email_102: {
    _id: 'analysis_102',
    emailId: 'email_102',
    userId: DEMO_USER._id,
    analysisVersion: 1,
    summary: {
      short: 'Innovate AI has invited Alex to a 60-minute Technical Architecture session for the Principal AI Engineer role next Monday.',
      detailed:
        'The candidate passed initial screening with high marks. Talent Acquisition is requesting confirmation for an interview with the VP of Engineering on Monday, August 3rd at 2:00 PM PST covering Gemini orchestration, Gmail OAuth sync, and security.',
    },
    category: 'Work',
    urgency: 'Medium',
    sentiment: 'Positive',
    tasks: [
      { task: 'Confirm interview availability for Monday at 2:00 PM PST', deadline: 'This Friday', status: 'pending' },
      { task: 'Prepare architectural diagrams for Gemini LLM rate-limiting queue', deadline: 'Monday, Aug 3', status: 'pending' },
    ],
    deadlines: [{ description: 'Technical Architecture Interview', date: 'Monday, Aug 3', time: '2:00 PM PST' }],
    replyDrafts: {
      professional:
        'Dear Elena,\n\nThank you so much for the invitation! I would be delighted to meet with the VP of Engineering on Monday, August 3rd at 2:00 PM PST. Looking forward to discussing our LLM architecture.\n\nBest regards,\nAlex Rivera',
      friendly:
        'Hi Elena!\n\nThat is fantastic news! Monday at 2:00 PM PST works perfectly for me. Excited to discuss the architecture with the team!\n\nBest,\nAlex',
      formal:
        'Dear Ms. Rostova,\n\nI accept your invitation for the Technical Architecture session scheduled for Monday, August 3, 2026, at 2:00 PM PST. Please forward the calendar invitation.\n\nSincerely,\nAlex Rivera',
      short: 'Hi Elena, Monday at 2:00 PM PST works great for me! Thanks, Alex.',
      detailed:
        'Dear Elena,\n\nThank you for the update. I am excited about the opportunity and confirm my attendance for Monday, August 3rd at 2:00 PM PST. I look forward to walking the team through our rate-limiting queues, token security, and real-time OAuth sync.\n\nBest regards,\nAlex Rivera',
    },
    keywords: ['Interview', 'Principal AI Engineer', 'Architecture', 'VP Engineering', 'Gemini'],
    confidence: 0.96,
    tokensUsed: 420,
    processingTime: 980,
    estimatedCost: 0.00012,
    createdAt: new Date(Date.now() - 1000 * 60 * 85),
  },
  email_103: {
    _id: 'analysis_103',
    emailId: 'email_103',
    userId: DEMO_USER._id,
    analysisVersion: 1,
    summary: {
      short: 'Google Cloud monthly billing invoice #GCP-948271 for $1,248.50 is due on August 1st.',
      detailed: 'Automated invoice notice for monthly GCP consumption totaling $1,248.50. Auto-debit scheduled for August 1st, 2026.',
    },
    category: 'Finance',
    urgency: 'Low',
    sentiment: 'Neutral',
    tasks: [{ task: 'Ensure corporate card has sufficient funds for $1,248.50 auto-debit', deadline: 'Aug 1', status: 'pending' }],
    deadlines: [{ description: 'GCP Payment Auto-debit', date: 'Aug 1', time: '11:59 PM' }],
    replyDrafts: {
      professional: 'No reply needed - automated billing notification.',
      friendly: 'Automated invoice message received.',
      formal: 'Formal billing notice processed.',
      short: 'Billing notice acknowledged.',
      detailed: 'Automated invoice confirmation logged in financial records.',
    },
    keywords: ['Google Cloud', 'Invoice', 'Billing', 'Auto-payment'],
    confidence: 0.99,
    tokensUsed: 210,
    processingTime: 450,
    estimatedCost: 0.00006,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
  },
};
