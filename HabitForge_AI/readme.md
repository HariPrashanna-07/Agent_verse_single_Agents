# 🏋️ HabitForge AI — Autonomous Habit & Goal Coach Agent

**HabitForge AI** is a full-stack habit tracking and personal productivity application powered by a **single autonomous AI agent**.

Unlike a traditional habit tracker that only records completed tasks, HabitForge AI analyzes the user's actual progress, calculates consistency and streaks, identifies struggling habits, recommends realistic daily goals, and suggests adaptive goal adjustments.

The system uses **Groq-powered AI + structured tool calling + persistent SQLite data + deterministic analytics** to act as an intelligent personal consistency coach.

---

## 🎯 Problem Statement

People often create goals such as:

- Practice coding every day
- Exercise regularly
- Read books
- Meditate
- Improve communication skills

The main challenge is not creating goals — it is **staying consistent**.

Traditional habit trackers usually allow users to record habits and view streaks, but they do not intelligently answer questions such as:

> Why am I struggling with this habit?

> Is my daily target unrealistic?

> What should I focus on today?

> Which habit needs improvement?

> Should I increase or reduce my target?

HabitForge AI addresses this by using an autonomous AI agent that continuously works with the user's stored habit data.

---

# 💡 Solution

HabitForge AI acts as a personal AI habit coach.

Users can interact with the system naturally:

> "I want to practice DSA for 60 minutes every day."

> "I practiced DSA for 40 minutes today."

> "How consistent have I been with Exercise?"

> "What's my Reading streak?"

> "What should I focus on today?"

> "Should I reduce my Exercise target?"

The **HabitForge Agent** understands the request, selects the appropriate tool, retrieves or modifies data, analyzes the result, and generates a personalized response.

---

# 🤖 Why HabitForge Is an AI Agent

HabitForge AI is **not just a chatbot connected to a database**.

A normal chatbot follows:

```text
User
  ↓
LLM
  ↓
Text Response
```

HabitForge follows an agentic workflow:

```text
                    USER
                      │
                      ▼
              ┌─────────────────┐
              │ HabitForge Agent│
              └────────┬────────┘
                       │
                       ▼
               Understand Intent
                       │
                       ▼
                  Reason / Plan
                       │
                       ▼
                  Select Tool
                       │
                       ▼
                 Execute Tool
                       │
                       ▼
          ┌────────────────────────┐
          │ Backend Services / DB  │
          └────────────┬───────────┘
                       │
                       ▼
                 Observe Result
                       │
                       ▼
               Analyze Progress
                       │
                       ▼
           Check Proactive Insights
                       │
                       ▼
          Personalized AI Response
```

The agent can therefore **take actions**, not simply generate text.

---

# 🧠 Single-Agent Architecture

HabitForge uses:

```text
ONE HabitForge Agent
        +
Multiple Specialized Tools
```

It is intentionally **not a multi-agent system**.

The single agent is responsible for reasoning, selecting tools, interpreting results, and communicating with the user.

```text
                       ┌───────────────────────┐
                       │   HabitForge Agent    │
                       │      Groq LLM         │
                       └───────────┬───────────┘
                                   │
                    Tool Selection & Execution
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
        Habit Tools          Progress Tools       Analysis Tools
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   ▼
                         Python Services Layer
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
          Analytics             Streaks          Adaptive Goals
                                   │
                                   ▼
                              SQLite DB
```

---

# ⚙️ Agent Workflow

The HabitForge Agent follows a ReAct-style tool-calling workflow:

```text
User Input
    ↓
Understand Intent
    ↓
Reason
    ↓
Select Tool
    ↓
Execute Backend Tool
    ↓
Observe Tool Result
    ↓
Analyze Stored Data
    ↓
Check Coaching Conditions
    ↓
Generate Personalized Response
    ↓
Return Tool Calls + Insights
```

For example:

### User

```text
How am I doing with DSA?
```

### Agent workflow

```text
User Request
      ↓
HabitForge Agent
      ↓
Identify DSA Habit
      ↓
Retrieve Habit History
      ↓
Analyze Progress
      ↓
Calculate Streak
      ↓
Evaluate Consistency
      ↓
Generate Coaching Response
```

All statistics come from real stored data.

---

# 🛠️ Agent Tools

HabitForge provides structured tools that allow the AI agent to interact with the application.

| Tool | Purpose |
|---|---|
| `create_habit` | Create a new habit |
| `get_habits` | Retrieve active or filtered habits |
| `get_habit` | Retrieve a specific habit |
| `update_habit` | Modify an existing habit |
| `delete_habit` | Delete a habit |
| `log_progress` | Record daily habit progress |
| `get_today_goals` | Retrieve today's habit goals |
| `get_habit_history` | Retrieve historical habit data |
| `calculate_streak` | Calculate current and best streak |
| `analyze_progress` | Analyze habit consistency and performance |
| `suggest_daily_goals` | Generate personalized daily targets |
| `adapt_goal` | Update a target after goal adjustment |
| `generate_coaching_report` | Generate overall coaching analysis |

The agent decides which tool is required based on the user's natural-language request.

---

# 🧮 Deterministic Analytics

The LLM is **not responsible for calculating statistics**.

Python backend services calculate values such as:

- Completion rate
- Current streak
- Best streak
- Average progress
- Target achievement
- Missed days
- Completed days
- Weekly consistency
- Monthly consistency
- Progress trends

This prevents the LLM from inventing numerical results.

```text
SQLite Data
     ↓
Python Analytics
     ↓
Calculated Result
     ↓
HabitForge Agent
     ↓
Natural Language Explanation
```

---

# 🔥 Streak Analysis

HabitForge automatically analyzes habit streaks.

It calculates:

- Current streak
- Best streak
- Completed days
- Tracked days
- Missed days

Example:

```text
Reading

Current Streak: 8 days
Best Streak: 12 days
Completion Rate: 86%
```

Streak calculations are performed by the backend rather than the LLM.

---

# 🎯 Adaptive Goal Setting

One of HabitForge's core AI features is **adaptive goal recommendation**.

Suppose a user sets:

```text
Exercise
Target: 45 minutes/day
```

but recent performance shows:

```text
Average: 27 minutes
Completion Rate: 35%
Multiple missed days
```

HabitForge may recommend:

```text
Current Target:
45 minutes

Recommended Target:
30 minutes

Reason:
Your recent completion rate suggests that a smaller target
may help rebuild consistency.
```

The system can determine whether a goal should be:

```text
INCREASE
KEEP
DECREASE
```

Goal recommendations are based on deterministic performance analysis.

Permanent target modifications can require user approval.

---

# 📅 Personalized Daily Goals

HabitForge analyzes recent performance to suggest realistic goals for the current day.

Example:

```text
DSA Practice

Original Target:
60 minutes

Suggested Today:
45 minutes

Priority:
HIGH

Reason:
Recent average progress is below the current target.
```

Daily recommendations do not necessarily modify the user's permanent habit target.

---

# 💬 Personalized AI Coaching

HabitForge uses stored progress rather than generic motivational messages.

It can identify:

### 🔥 Streak at Risk

```text
Your 6-day Exercise streak is at risk because today's
progress has not been completed yet.
```

### ⚠️ Goal Too Difficult

```text
Your recent Exercise completion rate is low.
Consider temporarily reducing your target.
```

### 📈 Improving

```text
Your Meditation consistency has improved compared
with your previous performance.
```

### ⭐ Strong Habit

```text
Reading is currently one of your strongest habits
with consistently high completion.
```

---

# 🚨 Proactive Coaching

HabitForge can generate insights after actions such as:

```text
Create Habit
Log Progress
Update Habit
Adapt Goal
```

The agent can detect meaningful changes without requiring the user to explicitly ask for an analysis every time.

This enables proactive coaching rather than purely reactive chat.

---

# 🧠 Groq AI Integration

HabitForge uses the **Groq API** as its LLM provider.

Default model:

```text
llama-3.3-70b-versatile
```

Groq is responsible for:

- Understanding natural language
- Detecting user intent
- Selecting tools
- Extracting tool arguments
- Interpreting tool results
- Generating personalized coaching responses

Python backend services remain responsible for deterministic calculations.

---

# 💾 Persistent Memory

HabitForge uses:

```text
SQLite + SQLAlchemy
```

Database:

```text
habitforge.db
```

Main database entities:

### Habit

Stores:

```text
Name
Description
Target
Unit
Frequency
Category
Difficulty
Active Status
```

### HabitLog

Stores:

```text
Habit
Date
Actual Progress
Completion Status
Notes
```

### GoalAdjustment

Stores:

```text
Old Target
New Target
Reason
Adjustment Type
Timestamp
```

This allows HabitForge to remember historical performance across sessions.

---

# 🖥️ Application Features

## 📊 Dashboard

Displays:

- Today's progress
- Active habits
- Current streaks
- Weekly consistency
- Recent progress
- AI coaching insights

---

## ✅ My Habits

Users can:

- Create habits
- Edit habits
- Delete habits
- Activate/deactivate habits
- Search habits
- Filter by category

---

## 🎯 Today's Goals

Displays personalized daily recommendations based on:

- Original target
- Recent performance
- Completion rate
- Current streak
- Missed days
- Habit difficulty

---

## 🤖 AI Coach

Natural-language interface to the HabitForge Agent.

Example prompts:

```text
How am I doing this week?

What should I focus on today?

What's my Reading streak?

Which habit am I struggling with?

Should I adjust any goals?

Create a 30-minute daily reading habit.
```

The UI also displays executed agent tools.

Example:

```text
Tool Execution: analyze_progress ✓
```

This makes the agent's actions visible during demonstrations.

---

## 📈 Progress

Provides visual analytics such as:

- 7-day completion
- 30-day consistency
- Habit performance
- Current streak
- Best streak
- Progress trends

Charts are generated using actual backend data.

---

## 💡 Insights

Displays coaching insights grouped into areas such as:

```text
Needs Attention
Improving
Strong Habits
Goal Adjustments
```

Goal adjustments can be reviewed before being applied.

---

# 🏗️ Tech Stack

## Frontend

- React
- Vite
- Tailwind CSS
- Recharts
- Lucide React
- Axios
- React Router

## Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn

## AI

- Groq API
- Llama 3.3 70B Versatile
- Structured Tool Calling
- ReAct-style Agent Workflow

## Database

- SQLite

---

# 📂 Project Structure

```text
HabitForge_AI/
│
├── backend/
│   │
│   ├── app/
│   │   ├── agent/
│   │   │   ├── __init__.py
│   │   │   ├── agent.py
│   │   │   ├── prompts.py
│   │   │   └── tools.py
│   │   │
│   │   ├── api/
│   │   │   ├── agent_router.py
│   │   │   ├── dashboard_router.py
│   │   │   ├── habit_router.py
│   │   │   ├── insight_router.py
│   │   │   ├── progress_router.py
│   │   │   └── report_router.py
│   │   │
│   │   ├── database/
│   │   │   ├── connection.py
│   │   │   └── models.py
│   │   │
│   │   ├── schemas/
│   │   │
│   │   ├── services/
│   │   │   ├── analytics.py
│   │   │   ├── streaks.py
│   │   │   ├── adaptive_goals.py
│   │   │   ├── daily_goals.py
│   │   │   ├── coaching.py
│   │   │   └── llm_provider.py
│   │   │
│   │   └── main.py
│   │
│   ├── seed.py
│   ├── test_backend.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

# 🚀 Installation & Setup

## 1. Clone the Repository

```bash
git clone <repository-url>
```

Move into the project:

```bash
cd HabitForge_AI
```

---

# 🐍 Backend Setup

Navigate to:

```bash
cd backend
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## 🔑 Environment Variables

Create:

```text
backend/.env
```

Add:

```env
GROQ_API_KEY=your_groq_api_key_here
LLM_MODEL=llama-3.3-70b-versatile
DATABASE_URL=sqlite:///./habitforge.db
```

> Never commit the real `.env` file or Groq API key to GitHub.

---

## 🌱 Seed Demo Data

Run:

```bash
python seed.py
```

The seed script creates realistic habit history for demonstration purposes.

Demo habits include:

- DSA Practice
- Exercise
- Reading
- Meditation
- English Communication

The habits intentionally have different consistency patterns so HabitForge can demonstrate progress analysis and adaptive coaching.

---

## ▶️ Start Backend

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://localhost:8000
```

Swagger API documentation:

```text
http://localhost:8000/docs
```

---

# ⚛️ Frontend Setup

Open another terminal.

Navigate to:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🧪 Hackathon Demo

The following flow demonstrates the autonomous agent.

## 1️⃣ Create a Habit

User:

```text
I want to practice DSA for 60 minutes every day.
```

Agent:

```text
Understand Intent
        ↓
create_habit
        ↓
SQLite
        ↓
Habit Created
```

---

## 2️⃣ Log Progress

User:

```text
I practiced DSA for 40 minutes today.
```

Agent executes:

```text
log_progress
```

The record is stored and the dashboard updates.

---

## 3️⃣ Ask About a Streak

User:

```text
What's my Reading streak?
```

Agent executes:

```text
calculate_streak
```

The streak is calculated from historical records.

---

## 4️⃣ Analyze Consistency

User:

```text
How consistent have I been with Exercise?
```

Agent may execute:

```text
get_habit
        ↓
get_habit_history
        ↓
analyze_progress
```

The response is based on actual stored performance.

---

## 5️⃣ Generate Today's Plan

User:

```text
What should I focus on today?
```

Agent executes:

```text
suggest_daily_goals
```

HabitForge generates personalized priorities.

---

## 6️⃣ Adaptive Goal Recommendation

User:

```text
Should I reduce my Exercise target?
```

HabitForge analyzes recent performance and may recommend:

```text
Current Target:
45 minutes

Recommended Target:
30 minutes

Reason:
Recent completion has been below the current target.
```

---

## 7️⃣ Approve Goal Adjustment

User:

```text
Yes, change Exercise to 30 minutes.
```

Agent executes:

```text
adapt_goal
```

The new target is stored and the adjustment history records why it changed.

---

# 🔒 Security

The real Groq API key must only be stored locally in:

```text
backend/.env
```

The repository should ignore:

```text
.env
backend/.env
*.db
__pycache__/
*.pyc
node_modules/
dist/
.venv/
venv/
```

The `.env.example` file should contain only placeholders:

```env
GROQ_API_KEY=your_groq_api_key_here
LLM_MODEL=llama-3.3-70b-versatile
DATABASE_URL=sqlite:///./habitforge.db
```

---

# 🌟 Key Highlights

HabitForge AI combines:

**Natural Language Interaction**

+

**Autonomous Tool Selection**

+

**Persistent Habit Memory**

+

**Deterministic Progress Analytics**

+

**Streak Analysis**

+

**Adaptive Goal Setting**

+

**Personalized Daily Planning**

+

**Proactive Coaching**

Instead of simply tracking what the user did, HabitForge attempts to answer:

> **What should the user do next to stay consistent?**

---

# 🔮 Future Enhancements

Possible future improvements include:

- Mobile application
- Voice-based habit logging
- Calendar integration
- Smart reminders
- Notification scheduling
- Wearable fitness integration
- Long-term goal planning
- Advanced behavioral pattern analysis
- Gamification and achievements
- Multi-device synchronization
- Cloud database support
- Personalized weekly AI reports

---

# 🏆 Hackathon Focus

**Domain:** Autonomous AI Agents & Productivity

**Agent:** HabitForge Agent

**Architecture:** Single Autonomous Agent

**Core AI Capability:** Groq-powered reasoning and structured tool calling

**Core Agent Capabilities:**

```text
PERCEIVE
User intent + stored progress

REASON
Determine required action

ACT
Execute backend tools

OBSERVE
Analyze tool results

ADAPT
Recommend sustainable goal changes

COACH
Provide personalized next actions
```

HabitForge demonstrates how an AI agent can move beyond conversation and become an **action-oriented productivity system that tracks, reasons, analyzes, and adapts based on user behavior**.

---

## 🏋️ HabitForge AI

### Build consistency. Analyze progress. Adapt intelligently.
