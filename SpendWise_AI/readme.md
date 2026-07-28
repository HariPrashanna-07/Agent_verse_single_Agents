# SpendWise AI — Autonomous Expense Management Agent

[![Domain](https://img.shields.io/badge/Hackathon-Autonomous%20AI%20Agents-emerald)](https://github.com)
[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20FastAPI%20%7C%20SQLite%20%7C%20Recharts-blue)](https://github.com)

**SpendWise AI** is a full-stack personal finance application powered by a single autonomous AI agent (**SpendWise**). The agent processes natural language prompts, decides on tool execution, executes backend database operations, evaluates budget rules, and generates data-grounded insights and spending forecasts.

---

## 🚀 Key Features

- **Single Autonomous AI Agent (SpendWise)**: Handles expense entry, analytics queries, forecasting, and savings recommendations via a ReAct tool-calling loop.
- **Natural Language Expense Entry**: Extract amount, description, category, and date automatically (e.g. *"I spent ₹250 on lunch today"* or *"₹180 for coffee and snacks"*).
- **Multi-Expense Processing**: Recognizes multiple transactions in a single prompt.
- **12 Backend Tools**: Complete database integration for CRUD, period analytics, category breakdown, budget monitoring, deterministic forecasting, and reports.
- **Deterministic Financial Engine**: Pure Python backend arithmetic for totals, percentages, daily burn rates, and rate-based month-end forecasting.
- **Autonomous Budget Monitoring**: Proactively evaluates budget usage after every transaction and alerts users before limits are breached.
- **Data-Grounded Recommendations**: Tailored savings suggestions based on actual user transactions.
- **Bonus Receipt OCR Scanner**: Image scanner to parse receipts and create expenses with one click.

---

## 🛠️ Technology Stack

- **Frontend**: React + Vite, Tailwind CSS, Recharts, Lucide Icons, Axios, React Router v6.
- **Backend**: Python 3.10+, FastAPI, Uvicorn, SQLAlchemy, SQLite, Pydantic v2.
- **AI Agent & LLM Provider**: OpenAI / Groq / OpenRouter / Gemini API with tool/function calling support & fallback engine.

---

## 📂 Project Structure

```
SpendWise AI/
├── backend/
│   ├── app/
│   │   ├── agent/          # SpendWise Agent ReAct loop, tools dispatcher, system prompts
│   │   ├── api/            # FastAPI APIRouters (expenses, budgets, analytics, agent, ocr)
│   │   ├── database/       # SQLite engine connection & SQLAlchemy models
│   │   ├── schemas/        # Pydantic v2 validation models
│   │   └── services/       # Analytics, forecasting, budget monitoring, LLM provider
│   ├── seed.py             # Realistic database seeder
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/     # Layout, MetricCard, InsightCard, ToolCallBadge, Modals
│   │   ├── pages/          # Dashboard, Transactions, AIAssistant, Reports, ReceiptOCR
│   │   ├── services/       # Axios API client
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

---

## 🏁 Quickstart & Execution Guide

### 1. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### 2. Configure Environment (.env)

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` to select your preferred LLM provider and paste your API key:

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here
LLM_MODEL=gpt-4o-mini
DATABASE_URL=sqlite:///./spendwise.db
CURRENCY_SYMBOL=₹
```
*(Note: If no API key is provided, SpendWise automatically uses a fallback NLP parser so the application remains 100% functional during testing).*

### 3. Seed Realistic Demo Data

```bash
python seed.py
```

### 4. Start FastAPI Backend

```bash
python app/main.py
```
*Backend API will run at `http://localhost:8000` (Docs at `http://localhost:8000/docs`).*

### 5. Frontend Setup

In a new terminal window:

```bash
# Navigate to frontend folder
cd frontend

# Install Node dependencies
npm install

# Start Vite React dev server
npm run dev
```
*Frontend will open at `http://localhost:5173`.*

---

## 🧪 Critical Hackathon Scenario Testing

Open the **AI Assistant** tab (`http://localhost:5173/chat`) or use the quick suggestion buttons:

1. **Natural Language Expense Entry**:
   - Prompt: `"I spent ₹250 on lunch today."`
   - *SpendWise understands amount = ₹250, category = Food, description = Lunch, date = today, calls `add_expense`, saves to SQLite, and confirms entry.*
2. **Category Query**:
   - Prompt: `"Where did I spend the most this month?"`
   - *SpendWise calls `get_spending_summary`, retrieves database data, and identifies the largest spending category.*
3. **Forecasting Query**:
   - Prompt: `"Am I likely to exceed my budget?"`
   - *SpendWise executes `forecast_expenses`, calculates current burn rate, and explains the projected budget status.*
4. **Savings Recommendation Query**:
   - Prompt: `"What should I reduce?"`
   - *SpendWise analyzes flexible expense totals and provides realistic percentage reduction targets.*
