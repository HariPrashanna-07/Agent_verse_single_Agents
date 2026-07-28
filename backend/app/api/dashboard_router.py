from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta
from app.database.connection import get_db
from app.database.models import Habit, HabitLog
from app.services.analytics import get_overall_stats, analyze_progress
from app.services.streaks import calculate_streak
from app.services.daily_goals import suggest_daily_goals
from app.services.coaching import generate_insights

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("")
def get_dashboard(db: Session = Depends(get_db)):
    stats = get_overall_stats(db)
    daily_goals = suggest_daily_goals(db)
    insights = generate_insights(db)

    # Weekly chart data
    today = date.today()
    weekly_data = []
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        habits = db.query(Habit).filter(Habit.active == True).all()
        total = len(habits)
        completed = 0
        for h in habits:
            log = db.query(HabitLog).filter(HabitLog.habit_id == h.id, HabitLog.date == d).first()
            if log and log.completed:
                completed += 1
        pct = round((completed / total * 100), 1) if total > 0 else 0
        weekly_data.append({"day": d.strftime("%a"), "date": str(d), "completion": pct, "completed": completed, "total": total})

    # Today's habits with progress
    today_habits = []
    for h in db.query(Habit).filter(Habit.active == True).all():
        log = db.query(HabitLog).filter(HabitLog.habit_id == h.id, HabitLog.date == today).first()
        streak = calculate_streak(db, h.id)
        today_habits.append({
            "id": h.id,
            "name": h.name,
            "target": h.target_value,
            "unit": h.unit,
            "category": h.category,
            "actual": log.actual_value if log else 0,
            "completed": log.completed if log else False,
            "streak": streak["current_streak"],
            "progress_pct": round(min(100, (log.actual_value / h.target_value * 100)) if log else 0, 1),
        })

    return {
        **stats,
        "weekly_data": weekly_data,
        "today_habits": today_habits,
        "daily_goals": daily_goals[:5],
        "insights": insights[:3],
    }
