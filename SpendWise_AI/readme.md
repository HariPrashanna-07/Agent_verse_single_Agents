# 💰 SpendWise AI — Autonomous Expense Management Agent

SpendWise AI is a full-stack personal finance application powered by a **single autonomous AI agent**.

Instead of manually recording and analyzing every expense, users can interact with SpendWise using natural language. The agent understands the user's intent, selects the appropriate tool, executes backend operations, analyzes stored financial data, monitors budgets, and provides personalized spending insights.

---

## 🎯 Problem Statement

Tracking expenses manually is tedious, and users often struggle to understand:

- Where their money is being spent
- Whether they are staying within budget
- Which spending categories are increasing
- How much they may spend by the end of the month
- Where they can reduce unnecessary expenses

SpendWise AI solves this using an autonomous AI agent capable of interacting with financial tools and stored expense data.

---

## 🤖 What Makes SpendWise an AI Agent?

SpendWise is not just a chatbot.

A normal chatbot mainly follows:

User → LLM → Text Response

SpendWise follows an agentic workflow:

User Request  
↓  
SpendWise Agent  
↓  
Understand Intent & Reason  
↓  
Select Appropriate Tool  
↓  
Execute Backend Tool  
↓  
Access / Modify SQLite Data  
↓  
Observe Tool Result  
↓  
Generate Data-Grounded Response  
↓  
Run Proactive Budget Monitoring

The agent can therefore **reason, take actions, interact with tools, observe results, and respond using actual application data**.

---

## ✨ Features

### 💳 Expense Management

Users can add expenses naturally:

> "I spent ₹250 on lunch today."

SpendWise identifies the amount, description, category, and date and stores the transaction in the database.

Users can also:

- Add expenses
- View expenses
- Update expenses
- Delete expenses
- Search and filter transactions

### 📊 Spending Analytics

SpendWise can answer questions such as:

> "Where did I spend the most this month?"

The agent retrieves actual expense data and provides category-level spending insights.

### 🎯 Budget Management

Users can define overall or category-specific budgets.

Example:

> "Set my monthly budget to ₹25,000."

SpendWise continuously evaluates spending against configured budgets.

### 🚨 Autonomous Budget Monitoring

After financial actions, the backend automatically checks budget utilization.

SpendWise can proactively detect:

- Budget limits being exceeded
- Categories approaching their limits
- High spending rates
- Potential month-end overspending

### 🔮 Expense Forecasting

SpendWise estimates month-end spending using the current spending rate.

The financial calculation is performed by the Python backend rather than the LLM.

### 💡 Savings Recommendations

SpendWise analyzes categories such as:

- Shopping
- Entertainment
- Food
- Subscriptions

and provides data-grounded suggestions for reducing spending.

### 📑 Reports

The Reports page provides:

- Monthly spending summary
- Category breakdown
- Month-over-month comparison
- Spending forecast
- Savings recommendations

### 🧾 Receipt OCR

The application includes receipt scanning support for extracting expense information from uploaded receipts.

---

## 🧠 AI Architecture

SpendWise uses **Groq** as the LLM inference platform.

The agent uses the LLM for:

- Natural language understanding
- Intent interpretation
- Reasoning
- Tool selection
- Conversational responses

Financial calculations are handled deterministically by Python backend services.

```text
User
  │
  ▼
React Frontend
  │
  ▼
FastAPI Backend
  │
  ▼
SpendWise Agent
  │
  ▼
Groq API + LLM
  │
  ▼
Tool Selection
  │
  ├── Expense Tools
  ├── Budget Tools
  ├── Analytics Tools
  ├── Forecasting Tools
  └── Reporting Tools
  │
  ▼
Python Services
  │
  ▼
SQLite Database
```

---

## 🛠️ Agent Tools

SpendWise has **12 structured tools** available to the single agent.

| Tool | Purpose |
|---|---|
| `add_expense` | Add a new expense |
| `get_expenses` | Retrieve expenses using filters |
| `update_expense` | Modify an existing expense |
| `delete_expense` | Delete an expense |
| `get_expenses_by_period` | Retrieve expenses for periods such as today, week, or month |
| `get_category_spending` | Analyze spending by category |
| `set_budget` | Create or update a budget |
| `get_budget` | Retrieve budget information |
| `get_spending_summary` | Generate spending analytics |
| `compare_spending` | Compare spending across periods |
| `forecast_expenses` | Estimate month-end spending |
| `generate_report` | Generate a financial report |

> These are **tools used by one SpendWise agent**, not separate AI agents.

---

## 🧩 Agent Workflow

Example request:

> "Where did I spend the most this month?"

SpendWise performs:

```text
User Prompt
    ↓
Groq LLM
    ↓
Intent Understanding
    ↓
Select get_spending_summary
    ↓
Execute Python Tool
    ↓
Query SQLite
    ↓
Return Spending Data
    ↓
Agent Observes Result
    ↓
Generate Final Response
```

Example output:

> Your highest spending category this month is Shopping, with a total of ₹5,400.

If the Shopping budget is ₹4,000, SpendWise can additionally generate a proactive budget warning.

---

## 🧮 Deterministic Financial Calculations

The LLM does **not** calculate financial totals.

Python backend services calculate:

- Total spending
- Category totals
- Budget utilization
- Remaining budget
- Daily spending rate
- Month-over-month changes
- Forecasts
- Savings targets

The LLM receives these calculated results and explains them conversationally.

This reduces hallucinations in financial calculations.

---

## 🔮 Forecasting Logic

The current MVP uses a spending-rate forecast rather than a trained machine-learning model.

```text
Daily Average = Spent So Far / Elapsed Days

Predicted Month-End Spending =
Spent So Far + (Daily Average × Remaining Days)
```

This allows SpendWise to estimate whether the user is likely to exceed their monthly budget.

---

## 🗄️ Database

SpendWise uses **SQLite** with **SQLAlchemy**.

Main entities:

### Expense

- ID
- Amount
- Category
- Description
- Date
- Created timestamp

### Budget

- ID
- Category
- Limit
- Month
- Year
- Created timestamp

SQLite was selected for the prototype because it provides lightweight persistent storage without requiring an external database server.

---

## 📦 Demo Data

A seed script is included to populate the SQLite database with realistic synthetic expenses and budgets.

This allows features such as:

- Spending analytics
- Category comparisons
- Budget monitoring
- Forecasting
- Reports

to be demonstrated immediately without manually entering a large number of transactions.

---

## 💻 Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Recharts
- Lucide React
- Axios

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn

### AI

- Groq API
- LLM tool/function calling
- ReAct-style agent workflow

### Database

- SQLite

---

## 📁 Project Structure

```text
SpendWise_AI/
│
├── backend/
│   ├── app/
│   │   ├── agent/
│   │   ├── api/
│   │   ├── database/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── seed.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
│
└── README.md
```

---

## ⚙️ Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Agent_verse_single_Agents/SpendWise_AI
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file:

```env
GROQ_API_KEY=your_groq_api_key_here
LLM_MODEL=llama-3.3-70b-versatile

DATABASE_URL=sqlite:///./spendwise.db
CURRENCY_SYMBOL=₹
```

> Never commit your actual `.env` file or Groq API key to GitHub.

Populate demo data:

```bash
python seed.py
```

Start FastAPI:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://localhost:8000
```

FastAPI Swagger documentation:

```text
http://localhost:8000/docs
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 🧪 Demo Prompts

Try asking SpendWise:

```text
I spent ₹250 on lunch today.

Where did I spend the most this month?

How much did I spend this week?

Set my monthly budget to ₹25000.

Am I likely to exceed my budget?

What should I reduce?

Compare this month with last month.
```

The UI displays the tool selected by SpendWise, making the agent's actions visible during demonstrations.

---

## 🔐 Security

API keys are stored using environment variables.

The `.env` file should be excluded from Git using:

```gitignore
.env
__pycache__/
*.pyc
```

Never hard-code or commit API keys.

---

## 🚀 Future Improvements

- User authentication and multiple user accounts
- PostgreSQL/cloud database
- Improved receipt OCR
- Recurring expense detection
- Subscription tracking
- Advanced time-series forecasting
- Personalized long-term financial goals
- Voice-based expense entry
- Notifications for budget risks

---

## 🏆 Agentverse

SpendWise AI was developed as a **Single Autonomous AI Agent** for the Agentverse challenge under the Autonomous AI Agents / Productivity domain.

The project demonstrates how an LLM can move beyond conversational responses by selecting tools, executing actions, accessing persistent data, and proactively assisting users with financial decision-making.
