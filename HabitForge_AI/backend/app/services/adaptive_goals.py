from app.services.analytics import analyze_progress
from sqlalchemy.orm import Session


def evaluate_goal(db: Session, habit_id: int, days: int = 7) -> dict:
    analysis = analyze_progress(db, habit_id, days)
    if not analysis:
        return {"recommendation": "KEEP", "reason": "Insufficient data."}

    completion_rate = analysis["completion_rate"]
    avg_target_pct = analysis["average_target_percentage"]
    current_streak = analysis["current_streak"]
    target = analysis["target_value"]
    avg_actual = analysis["average_actual"]

    if completion_rate < 50 and avg_target_pct < 70:
        # Suggest decrease: round avg_actual up to nearest 5
        suggested = max(5.0, round(avg_actual / 5) * 5)
        suggested = min(suggested, target - 5)
        return {
            "recommendation": "DECREASE",
            "current_target": target,
            "suggested_target": suggested,
            "reason": (
                f"Your {days}-day completion rate is {completion_rate}% and average achievement "
                f"is {avg_target_pct}% of target. Reducing to {suggested} {analysis['unit']} "
                "may help rebuild consistency."
            ),
        }
    elif completion_rate >= 85 and avg_target_pct >= 100 and current_streak >= 5:
        suggested = round(target * 1.1 / 5) * 5
        return {
            "recommendation": "INCREASE",
            "current_target": target,
            "suggested_target": suggested,
            "reason": (
                f"You've been consistently exceeding your target with a {current_streak}-day streak "
                f"and {completion_rate}% completion. A slight increase to {suggested} {analysis['unit']} "
                "could help you grow further."
            ),
        }
    else:
        return {
            "recommendation": "KEEP",
            "current_target": target,
            "suggested_target": target,
            "reason": (
                f"Your current target seems appropriate. Completion rate: {completion_rate}%, "
                f"average achievement: {avg_target_pct}%."
            ),
        }
