from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.database.models import Habit, HabitLog
from app.services.analytics import analyze_progress
from app.services.streaks import calculate_streak


def suggest_daily_goals(db: Session) -> list:
    habits = db.query(Habit).filter(Habit.active == True).all()
    suggestions = []

    for habit in habits:
        analysis = analyze_progress(db, habit.id, days=7)
        streak = calculate_streak(db, habit.id)

        completion_rate = analysis.get("completion_rate", 0)
        avg_actual = analysis.get("average_actual", habit.target_value)
        target = habit.target_value

        # Determine suggested target
        if completion_rate < 50:
            suggested = max(5.0, round(avg_actual / 5) * 5) if avg_actual > 0 else round(target * 0.7 / 5) * 5
            priority = "HIGH"
            reason = f"Recent completion rate is {completion_rate}%. A smaller target today may help."
        elif completion_rate < 75:
            suggested = round((avg_actual * 0.9 + target * 0.1) / 5) * 5
            suggested = max(5.0, suggested)
            priority = "MEDIUM"
            reason = f"Your recent average is {avg_actual} {habit.unit}. Aiming slightly below target today."
        else:
            suggested = target
            priority = "MEDIUM" if streak["current_streak"] < 3 else "LOW"
            reason = f"You're on track! Maintain your {target} {habit.unit} target."

        # Cap suggested at target for non-increase scenarios
        suggested = min(suggested, target)

        # Check today's log
        today_log = db.query(HabitLog).filter(
            HabitLog.habit_id == habit.id,
            HabitLog.date == date.today()
        ).first()

        suggestions.append({
            "habit_id": habit.id,
            "habit_name": habit.name,
            "original_target": target,
            "unit": habit.unit,
            "suggested_target": suggested,
            "priority": priority,
            "reason": reason,
            "current_streak": streak["current_streak"],
            "completion_rate": completion_rate,
            "today_logged": today_log is not None,
            "today_actual": today_log.actual_value if today_log else None,
            "today_completed": today_log.completed if today_log else False,
        })

    # Sort by priority
    priority_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    suggestions.sort(key=lambda x: priority_order.get(x["priority"], 3))
    return suggestions
