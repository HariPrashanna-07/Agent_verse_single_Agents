from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta
from app.database.connection import get_db
from app.database.models import Habit, HabitLog
from app.services.analytics import analyze_progress
from app.services.streaks import calculate_streak

router = APIRouter(prefix="/api/reports", tags=["reports"])


def _build_report(db: Session, days: int) -> dict:
    habits = db.query(Habit).filter(Habit.active == True).all()
    habit_reports = []
    for h in habits:
        analysis = analyze_progress(db, h.id, days)
        streak = calculate_streak(db, h.id)
        habit_reports.append({**analysis, **streak})

    overall = round(sum(r["completion_rate"] for r in habit_reports) / len(habit_reports), 1) if habit_reports else 0

    # Daily breakdown
    today = date.today()
    daily = []
    for i in range(days - 1, -1, -1):
        d = today - timedelta(days=i)
        total = len(habits)
        completed = sum(
            1 for h in habits
            if db.query(HabitLog).filter(HabitLog.habit_id == h.id, HabitLog.date == d, HabitLog.completed == True).first()
        )
        daily.append({"date": str(d), "completed": completed, "total": total,
                      "pct": round(completed / total * 100, 1) if total else 0})

    return {
        "period_days": days,
        "overall_completion_rate": overall,
        "habit_reports": habit_reports,
        "daily_breakdown": daily,
    }


@router.get("/weekly")
def weekly_report(db: Session = Depends(get_db)):
    return _build_report(db, 7)


@router.get("/monthly")
def monthly_report(db: Session = Depends(get_db)):
    return _build_report(db, 30)
