from datetime import date, timedelta
from typing import List
from sqlalchemy.orm import Session
from app.database.models import HabitLog, Habit
from app.services.streaks import calculate_streak


def analyze_progress(db: Session, habit_id: int, days: int = 7) -> dict:
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        return {}

    end_date = date.today()
    start_date = end_date - timedelta(days=days - 1)

    logs = (
        db.query(HabitLog)
        .filter(HabitLog.habit_id == habit_id, HabitLog.date >= start_date, HabitLog.date <= end_date)
        .order_by(HabitLog.date.asc())
        .all()
    )

    logged_dates = {log.date: log for log in logs}
    all_dates = [start_date + timedelta(days=i) for i in range(days)]

    completed_days = sum(1 for log in logs if log.completed)
    missed_days = days - len(logs)
    total_actual = sum(log.actual_value for log in logs)
    average_actual = total_actual / len(logs) if logs else 0.0
    completion_rate = (completed_days / days) * 100 if days > 0 else 0.0
    avg_target_pct = (average_actual / habit.target_value * 100) if habit.target_value > 0 else 0.0

    # Trend: compare first half vs second half
    mid = days // 2
    first_half = [log for log in logs if log.date < start_date + timedelta(days=mid)]
    second_half = [log for log in logs if log.date >= start_date + timedelta(days=mid)]
    first_avg = sum(l.actual_value for l in first_half) / len(first_half) if first_half else 0
    second_avg = sum(l.actual_value for l in second_half) / len(second_half) if second_half else 0

    if second_avg > first_avg * 1.1:
        trend = "improving"
    elif second_avg < first_avg * 0.9:
        trend = "declining"
    else:
        trend = "stable"

    streak_data = calculate_streak(db, habit_id)
    consistency_score = min(100.0, (completion_rate * 0.6 + avg_target_pct * 0.4))

    return {
        "habit_id": habit_id,
        "habit_name": habit.name,
        "target_value": habit.target_value,
        "unit": habit.unit,
        "completion_rate": round(completion_rate, 1),
        "average_actual": round(average_actual, 1),
        "average_target_percentage": round(avg_target_pct, 1),
        "current_streak": streak_data["current_streak"],
        "best_streak": streak_data["best_streak"],
        "missed_days": missed_days,
        "completed_days": completed_days,
        "trend": trend,
        "consistency_score": round(consistency_score, 1),
        "days_analyzed": days,
    }


def get_overall_stats(db: Session) -> dict:
    habits = db.query(Habit).filter(Habit.active == True).all()
    if not habits:
        return {}

    today = date.today()
    week_start = today - timedelta(days=6)

    total_completed = 0
    total_possible = 0
    best_streak = 0
    best_streak_habit = ""

    for habit in habits:
        logs = db.query(HabitLog).filter(
            HabitLog.habit_id == habit.id,
            HabitLog.date >= week_start,
            HabitLog.date <= today
        ).all()
        completed = sum(1 for l in logs if l.completed)
        total_completed += completed
        total_possible += 7

        from app.services.streaks import calculate_streak as cs
        s = cs(db, habit.id)
        if s["current_streak"] > best_streak:
            best_streak = s["current_streak"]
            best_streak_habit = habit.name

    weekly_consistency = round((total_completed / total_possible * 100), 1) if total_possible > 0 else 0.0

    today_logs = db.query(HabitLog).filter(HabitLog.date == today).all()
    today_completed = sum(1 for l in today_logs if l.completed)

    return {
        "active_habits": len(habits),
        "today_completed": today_completed,
        "today_total": len(habits),
        "weekly_consistency": weekly_consistency,
        "best_streak": best_streak,
        "best_streak_habit": best_streak_habit,
    }
