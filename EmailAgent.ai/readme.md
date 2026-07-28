# ✉️ EmailAgent.ai - Commercial-Grade AI Email Intelligence SaaS

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![Gemini API](https://img.shields.io/badge/Google_Gemini-1.5_Flash-8E75B2?logo=google)
![Gmail API](https://img.shields.io/badge/Gmail-OAuth_2.0-EA4335?logo=gmail)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS_v3-38B2AC?logo=tailwindcss)

> **A production-ready, commercial-grade AI Email Intelligence Agent** that securely connects to Gmail, synchronizes inbox metadata, and uses **Google Gemini LLM** to analyze emails, extract tasks & deadlines, score urgency & sentiment, generate multi-tone reply drafts, and execute natural language search.

> [!IMPORTANT]
> **Zero Auto-Send Guarantee**: The AI **NEVER** sends emails automatically. The user is always in total control and reviews every generated draft before taking action.

---

## 🌟 Key Product Features

- ☀️ **AI Daily Briefing**: Synthesizes a personalized morning inbox overview banner highlighting urgent items, upcoming deadlines, and pending tasks.
- ⚡ **Batch Processing Queue**: Rate-limited queue worker (`QUEUE_CONCURRENCY`, `QUEUE_DELAY_MS`) supporting "Analyze Selected" and "Analyze All" with live progress indicators (`Analyzing 18 / 220`).
- ✍️ **Multi-Tone Reply Draft Studio**: Generates 5 distinct draft styles (*Professional*, *Friendly*, *Formal*, *Short*, *Detailed*) with a one-click copy-to-clipboard tool.
- 🔍 **Natural Language Search Engine**: Combines Gmail search syntax with Gemini intent parsing (e.g. *"Show unread invoices from last month"*).
- 🏷️ **Categorization & Sentiment Analysis**: Auto-categorizes into *Work*, *Finance*, *Education*, *Personal*, *Shopping*, *Travel*, *Health*, *Promotions*, *Social*, and scores sentiment (*Positive*, *Neutral*, *Negative*, *Mixed*).
- 📊 **Inbox Health Score & Analytics**: Visual dashboards powered by Recharts tracking read ratio, token consumption, estimated API cost, and category distribution.
- 🌗 **Linear/Notion/Apple Glassmorphism UI**: High-end modern dark and light mode interface built with Tailwind CSS, Framer Motion, and Lucide React icons.
- 🧪 **Built-in Demo Engine**: Out-of-the-box simulated dataset enabling instant evaluation without requiring Google OAuth or Gemini API credentials right away.

---

## 🏗️ System Architecture

```
                          ┌──────────────────────────────────────────────┐
                          │               React + Vite Frontend          │
                          │     (Tailwind CSS, Lucide, Recharts)         │
                          └──────────────────────┬───────────────────────┘
                                                 │ REST API / Axios
                                                 ▼
                          ┌──────────────────────────────────────────────┐
                          │             Express.js Server                │
                          │       (MVC Architecture, Security)           │
                          └──────┬───────────────┼───────────────┬───────┘
                                 │               │               │
                                 ▼               ▼               ▼
                        ┌─────────┐      ┌──────────────┐   ┌─────────┐
                        │ MongoDB │      │  Google OAuth│   │ Gemini  │
                        │ Database│      │  & Gmail API │   │   API   │
                        └─────────┘      └──────────────┘   └─────────┘
```

### 1. Database Collections (Mongoose)
- **`Users`**: Google OAuth profile, encrypted refresh token (AES-256-CBC), user settings.
- **`Emails`**: Raw email metadata (`gmailMessageId`, `subject`, `sender`, `recipient`, `date`, `labels`, `aiStatus`).
- **`AIAnalysis`**: Strictly decoupled from `Emails` (ref: `emailId`). Stores historical analysis versions (`summary`, `category`, `urgency`, `sentiment`, `tasks`, `deadlines`, `replyDrafts`, `keywords`, `confidence`, `tokensUsed`, `processingTime`, `estimatedCost`).

### 2. Modular Services Directory (`server/services/`)
- `gmail/gmailService.js`: OAuth 2.0 client & message decoder.
- `sync/syncService.js`: Sync state manager ("Last Synced: 2 mins ago").
- `gemini/promptBuilder.js`: System prompt constructor enforcing strict JSON output.
- `gemini/responseParser.js`: Robust JSON repair engine & schema validator.
- `gemini/analyzeEmail.js`: Gemini 1.5 Flash intelligence extraction.
- `gemini/generateReply.js`: Multi-tone draft generation.
- `gemini/searchIntent.js`: Natural language query intent parser.
- `queue/analysisQueue.js`: Rate-limited batch processing queue.
- `dashboard/dailyBriefing.js`: Daily Briefing card synthesizer.
- `dashboard/statistics.js`: Metrics & Inbox Health Score calculator.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas string.

---

### Option A: Run in Instant Demo Mode (Zero Credentials Needed)

1. **Clone & Install Dependencies**:
   ```bash
   git clone https://github.com/HariPrashanna-07/Agent_verse_single_Agents.git
   cd Agent_verse_single_Agents/EmailAgent.ai
   ```

2. **Start Backend Server**:
   ```bash
   cd server
   npm install
   npm start
   ```
   *Server starts on `http://localhost:5000` with DEMO_MODE=true.*

3. **Start Frontend Client**:
   ```bash
   cd ../client
   npm install
   npm run dev
   ```
   *Frontend opens on `http://localhost:5173`. Click **"Launch Live Demo Experience"** to test.*

---

### Option B: Run in Live Production Mode (Live Gmail & Gemini API)

1. Open `server/.env` and update the configuration:
   ```env
   # Set DEMO_MODE to false
   DEMO_MODE=false

   # Google Gemini API Key (Get from https://aistudio.google.com/)
   GEMINI_API_KEY=AIzaSyYourActualGeminiApiKey

   # Google OAuth 2.0 Credentials (Get from https://console.cloud.google.com/)
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

   # MongoDB URI
   MONGO_URI=mongodb://127.0.0.1:27017/ai_email_agent
   ```

2. Enable **Gmail API** in Google Cloud Console under **APIs & Services > Library**.
3. Add `http://localhost:5000/api/auth/google/callback` under **Authorized Redirect URIs**.
4. Restart the backend server (`npm start` in `server/`).

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/auth/google` | Initiates Google OAuth consent flow |
| `POST` | `/api/auth/demo-login` | Instant demo session login |
| `GET` | `/api/auth/me` | Fetches current user profile |
| `GET` | `/api/emails` | Fetches inbox list with category & urgency filters |
| `POST` | `/api/emails/sync` | Syncs inbox messages from Gmail API |
| `POST` | `/api/emails/:id/analyze` | Triggers Gemini AI analysis for a specific email |
| `POST` | `/api/emails/batch-analyze` | Enqueues batch analysis for selected or all emails |
| `GET` | `/api/emails/queue-progress` | Returns live progress of batch queue worker |
| `POST` | `/api/emails/search-nl` | Executes natural language search query |
| `POST` | `/api/ai/generate-reply` | Generates custom multi-tone response draft |
| `GET` | `/api/dashboard/overview` | Fetches AI Daily Briefing & dashboard metrics |

---

## 🛡️ Security & Privacy

- **Token Encryption**: Google Refresh Tokens are encrypted at rest using AES-256-CBC.
- **Request Rate Limiting**: Express Rate Limiter restricts API abuse (300 requests per 15 min per IP).
- **Helmet Headers**: Secure HTTP headers enabled across all API endpoints.
- **User Control**: Drafts are provided strictly for copying/editing; no automatic email sending.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
