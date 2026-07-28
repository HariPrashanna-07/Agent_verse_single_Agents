# AI File Organizer Agent 🤖📁

> An enterprise-grade, modular, and scalable full-stack application that intelligently analyzes, categorizes, renames, deduplicates, and organizes local file systems using Google's Gemini AI.

---

## 🌟 Key Features

- 📂 **Native Web Browser Folder Selection**: Select and upload local folders seamlessly using `<input type="file" webkitdirectory multiple>` without typing manual system paths.
- 🧠 **Context-Aware Gemini AI Engine**: Analyzes document contents (PDF, DOCX, TXT, MD, Code files) via Google's Gemini 1.5 Flash API instead of relying on file extensions.
- 🏷️ **Dynamic Category Generation**: Intelligently categorizes files into context-driven categories (*Personal, Finance, College, Research, Programming, Health, Legal, etc.*) without rigid hardcoded limits.
- 🔍 **2-Layer Duplicate Detection**:
  - **Layer 1 (Exact Match)**: Instant SHA-256 stream byte hashing.
  - **Layer 2 (Semantic Compare)**: Gemini AI semantic document comparison for files with similar text/sizes.
- 📋 **Safe Organization Plan & Preview**: Generates an interactive preview diff table. Files are **never** modified until approved by the user. Includes inline editing for suggested filenames and categories.
- ↩️ **1-Click Rollback / Transactional Undo**: Complete peace of mind. Every batch operation can be reverted with one click to restore files to their exact original upload paths and names.
- 🎨 **Apple-Inspired UI Philosophy**: Minimal, spacious, elegant, and calm productivity dashboard with Dark Mode support built using React, Vite, Tailwind CSS, and Lucide icons.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS (Apple Human Interface Design system)
- **Routing & HTTP**: React Router v6 + Axios
- **Icons**: Lucide React

### Backend
- **Runtime & Server**: Node.js + Express.js (MVC Architecture)
- **Database**: MongoDB + Mongoose ORM
- **AI SDK**: `@google/generative-ai` (Gemini 1.5 Flash)
- **Document Extractors**: `pdf-parse` (PDF), `mammoth` (DOCX), stream readers (TXT, MD, JSON, Source Code)
- **File System & Hashing**: `fs-extra`, `crypto`, `multer`

---

## 📂 Repository Folder Structure

```
ai-file-organizer/
├── package.json                   # Root monorepo workspace configuration
├── README.md                      # Project documentation
│
├── server/                        # Node.js + Express Backend (MVC Architecture)
│   ├── server.js                  # Express app & HTTP listener
│   ├── config/                    # db.js, gemini.js, constants.js
│   ├── models/                    # ScanHistory.js, Settings.js
│   ├── controllers/               # scanController, previewController, organizeController, undoController, historyController, settingsController
│   ├── services/                  # scannerService, extractorService, geminiService, duplicateService, organizerService, undoService, historyService
│   ├── middlewares/               # upload.js (Multer), errorHandler.js, pathValidator.js
│   ├── utils/                     # fileUtils.js, hashUtils.js, logger.js
│   ├── uploads/                   # Raw folder upload staging directory
│   └── organized/                 # Destination directory for organized file subfolders
│
└── client/                        # React + Vite + Tailwind CSS Frontend
    ├── index.html                 # HTML entry point with Inter font
    ├── vite.config.js             # Vite config with API proxy to port 5000
    ├── tailwind.config.js         # Custom Apple design tokens & colors
    └── src/
        ├── App.jsx                # Application shell & routing
        ├── main.jsx               # React DOM render entry
        ├── index.css              # Global styles & custom scrollbars
        ├── components/            # Button, Card, Badge, Modal, Toast, Loader, Navbar, Sidebar, StatCard
        ├── pages/                 # Dashboard, FolderUpload, ScanResults, PreviewPage, HistoryPage, SettingsPage
        ├── services/              # Axios API service handlers
        └── context/               # AppContext & ThemeContext
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally (`mongodb://localhost:27017`) or a MongoDB Atlas cloud URI
- Google Gemini API Key ([Get API Key](https://aistudio.google.com/))

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/HariPrashanna-07/Agent_verse_single_Agents.git
cd Agent_verse_single_Agents/ai-file-organizer

# Install Backend Dependencies
cd server
npm install

# Install Frontend Dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai_file_organizer
GEMINI_API_KEY=your_actual_gemini_api_key_here
NODE_ENV=development
```

### 3. Running the Application

```bash
# Terminal 1 — Start Express Backend (Runs on http://localhost:5000)
cd server
npm run dev

# Terminal 2 — Start React Vite Frontend (Runs on http://localhost:3000)
cd client
npm run dev
```

Open **`http://localhost:3000`** in your browser.

---

## 🔌 API Endpoint Reference

| Endpoint | Method | Payload / Format | Description |
|---|---|---|---|
| `/api/scan` | `POST` | `multipart/form-data` | Uploads folder files via `webkitdirectory`, extracts text, generates SHA-256 hashes |
| `/api/preview` | `POST` | `{ "scanId": "..." }` | Triggers Gemini AI analysis, dynamic categorization, and 2-layer duplicate detection |
| `/api/organize` | `POST` | `{ "scanId": "...", "approvedFiles": [...] }` | Moves & renames approved files into `server/organized/<scanId>/<Category>/` |
| `/api/undo` | `POST` | `{ "scanId": "..." }` | Reverts organized files back to their original upload staging positions |
| `/api/history` | `GET` | `?page=1&limit=10` | Retrieves past scan sessions, statistics, and audit logs |
| `/api/settings`| `GET/PUT`| `{ "theme": "dark", ... }` | Retrieves or updates application settings |

---

## 🔒 Security & Best Practices

- **Path Traversal Protection**: All user input filenames and paths are sanitized against directory traversal attacks (`../`).
- **Collision Prevention**: Destination folder moves check for file collisions and automatically append incremental counters (`_1`, `_2`) to prevent accidental overwrites.
- **Offline / Missing Key Fallback**: Built-in intelligent heuristic analyzer ensures the application remains functional even if no Gemini API key is supplied.

---

## 📜 License

Distributed under the MIT License.
