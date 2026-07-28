from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import init_db
from app.api import agent_router, habit_router, progress_router, dashboard_router, insight_router, report_router

app = FastAPI(title="HabitForge AI", version="1.0.0", description="Autonomous Habit & Goal Coach Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()

app.include_router(agent_router.router)
app.include_router(habit_router.router)
app.include_router(progress_router.router)
app.include_router(dashboard_router.router)
app.include_router(insight_router.router)
app.include_router(report_router.router)

@app.get("/")
def root():
    return {"message": "HabitForge AI — Autonomous Habit Coach", "status": "running", "docs": "/docs"}
