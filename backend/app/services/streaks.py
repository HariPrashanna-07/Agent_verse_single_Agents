from datetime import date, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database.models import HabitLog, Habit


def calculate_streak(db: Session, habit_id: int) -> dict:
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        return {"current_streak": 0, "best_streak": 0, "completed_days": 0, "total_tracked_days": 0}

    logs = (
        db.query(HabitLog)
        .filter(HabitLog.habit_id == habit_id)
        .order_by(HabitLog.date.desc())
        .all()
    )

    if not logs:
        return {
            "habit_id": habit_id,
            "habit_name": habit.name,
            "current_streak": 0,
            "best_streak": 0,
            "completed_days": 0,
            "total_tracked_days": 0,
        }

    completed_dates = {log.date for log in logs if log.completed}
    total_tracked = len({log.date for log in logs})
    completed_days = len(completed_dates)

    today = date.today()
    current_streak = 0
    check_date = today

    # If today not logged, check from yesterday
    if today not in completed_dates:
        check_date = today - timedelta(days=1)

    while check_date in completed_dates:
        current_streak += 1
        check_date -= timedelta(days=1)

    # Best streak
    best_streak = 0
    temp_streak = 0
    if completed_dates:
        all_dates = sorted(completed_dates)
        temp_streak = 1
        best_streak = 1
        for i in range(1, len(all_dates)):
            if (all_dates[i] - all_dates[i - 1]).days == 1:
                temp_streak += 1
                best_streak = max(best_streak, temp_streak)
            else:
                temp_streak = 1

    return {
        "habit_id": habit_id,
        "habit_name": habit.name,
        "current_streak": current_streak,
        "best_streak": best_streak,
        "completed_days": completed_days,
        "total_tracked_days": total_tracked,
    }
