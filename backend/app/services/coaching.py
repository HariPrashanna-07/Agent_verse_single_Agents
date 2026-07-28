from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.database.models import Habit, HabitLog
from app.services.analytics import analyze_progress
from app.services.streaks import calculate_streak


def generate_insights(db: Session) -> list:
    habits = db.query(Habit).filter(Habit.active == True).all()
    insights = []
    today = date.today()

    for habit in habits:
        analysis = analyze_progress(db, habit.id, days=7)
        streak = calculate_streak(db, habit.id)

        completion_rate = analysis.get("completion_rate", 0)
        avg_target_pct = analysis.get("average_target_percentage", 0)
        trend = analysis.get("trend", "stable")
        current_streak = streak["current_streak"]

        # Streak at risk
        today_log = db.query(HabitLog).filter(
            HabitLog.habit_id == habit.id,
            HabitLog.date == today
        ).first()
        if current_streak >= 3 and (today_log is None or not today_log.completed):
            insights.append({
                "type": "STREAK_AT_RISK",
                "habit_id": habit.id,
                "habit_name": habit.name,
                "message": f"You haven't completed {habit.name} today. Your {current_streak}-day streak is at risk.",
                "severity": "warning",
            })

        # Struggling
        if completion_rate < 40:
            insights.append({
                "type": "STRUGGLING",
                "habit_id": habit.id,
                "habit_name": habit.name,
                "message": f"Your {habit.name} completion rate is only {completion_rate}% over the last 7 days. Consider reducing the target.",
                "severity": "danger",
            })

        # Improving
        if trend == "improving" and completion_rate >= 50:
            insights.append({
                "type": "IMPROVING",
                "habit_id": habit.id,
                "habit_name": habit.name,
                "message": f"Your {habit.name} consistency is improving. Keep it up!",
                "severity": "success",
            })

        # Goal too easy
        if completion_rate >= 90 and avg_target_pct >= 110 and current_streak >= 5:
            insights.append({
                "type": "GOAL_TOO_EASY",
                "habit_id": habit.id,
                "habit_name": habit.name,
                "message": f"You've been consistently exceeding your {habit.name} target. Consider increasing it slightly.",
                "severity": "info",
            })

        # Goal too difficult
        if completion_rate < 50 and avg_target_pct < 70:
            insights.append({
                "type": "GOAL_TOO_DIFFICULT",
                "habit_id": habit.id,
                "habit_name": habit.name,
                "message": f"Your {habit.name} completion rate is {completion_rate}%. A smaller target may improve consistency.",
                "severity": "warning",
            })

    return insights[:8]  # Cap to avoid noise
