"""
Backend test suite — deterministic tests for core functionality.
Run: python test_backend.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import date, timedelta
from app.database.connection import init_db, SessionLocal
from app.database.models import Habit, HabitLog, GoalAdjustment
from app.agent.agent import execute_tool
from app.services.analytics import analyze_progress
from app.services.streaks import calculate_streak
from app.services.adaptive_goals import evaluate_goal
from app.services.daily_goals import suggest_daily_goals
from app.services.coaching import generate_insights

PASS = "[PASS]"
FAIL = "[FAIL]"


def test(name, condition):
    print(f"  {PASS if condition else FAIL}: {name}")
    return condition


def run_tests():
    init_db()
    db = SessionLocal()

    # Clear test data
    db.query(GoalAdjustment).delete()
    db.query(HabitLog).delete()
    db.query(Habit).delete()
    db.commit()

    print("\n=== HabitForge AI Backend Tests ===\n")
    results = []

    # 1. Create habit
    print("1. create_habit")
    r = execute_tool("create_habit", {"name": "Test DSA", "target_value": 60, "unit": "minutes", "category": "Learning"}, db)
    results.append(test("creates habit", r.get("success") and r.get("habit_id")))
    habit_id = r.get("habit_id")

    # 2. Get habits
    print("2. get_habits")
    r = execute_tool("get_habits", {}, db)
    results.append(test("returns list", isinstance(r, list) and len(r) > 0))

    # 3. Log progress
    print("3. log_progress")
    r = execute_tool("log_progress", {"habit_id": habit_id, "actual_value": 45}, db)
    results.append(test("logs progress", r.get("success")))
    results.append(test("not completed (45 < 60)", not r.get("completed")))

    r2 = execute_tool("log_progress", {"habit_id": habit_id, "actual_value": 60}, db)
    results.append(test("completed (60 >= 60)", r2.get("completed")))

    # 4. Get habit history
    print("4. get_habit_history")
    r = execute_tool("get_habit_history", {"habit_id": habit_id, "days": 7}, db)
    results.append(test("returns history list", isinstance(r, list)))

    # 5. Calculate streak
    print("5. calculate_streak")
    # Add consecutive logs
    for i in range(1, 4):
        d = date.today() - timedelta(days=i)
        log = HabitLog(habit_id=habit_id, date=d, actual_value=60, completed=True)
        db.add(log)
    db.commit()

    r = execute_tool("calculate_streak", {"habit_id": habit_id}, db)
    results.append(test("has current_streak", "current_streak" in r))
    results.append(test("streak >= 1", r.get("current_streak", 0) >= 1))

    # 6. Analyze progress
    print("6. analyze_progress")
    r = execute_tool("analyze_progress", {"habit_id": habit_id, "days": 7}, db)
    results.append(test("has completion_rate", "completion_rate" in r))
    results.append(test("has trend", r.get("trend") in ["improving", "stable", "declining"]))
    results.append(test("has consistency_score", "consistency_score" in r))

    # 7. Suggest daily goals
    print("7. suggest_daily_goals")
    r = execute_tool("suggest_daily_goals", {}, db)
    results.append(test("returns list", isinstance(r, list)))

    # 8. Adaptive goal recommendation
    print("8. adaptive_goals.evaluate_goal")
    # Add poor performance logs
    for i in range(2, 9):
        d = date.today() - timedelta(days=i)
        existing = db.query(HabitLog).filter(HabitLog.habit_id == habit_id, HabitLog.date == d).first()
        if not existing:
            log = HabitLog(habit_id=habit_id, date=d, actual_value=25, completed=False)
            db.add(log)
    db.commit()

    rec = evaluate_goal(db, habit_id, days=7)
    results.append(test("has recommendation", "recommendation" in rec))
    results.append(test("recommendation is valid", rec["recommendation"] in ["KEEP", "DECREASE", "INCREASE"]))

    # 9. Adapt goal
    print("9. adapt_goal")
    r = execute_tool("adapt_goal", {"habit_id": habit_id, "new_target": 40, "reason": "Test reduction"}, db)
    results.append(test("goal adapted", r.get("success")))
    results.append(test("old_target recorded", r.get("old_target") == 60))
    results.append(test("new_target set", r.get("new_target") == 40))

    adj = db.query(GoalAdjustment).filter(GoalAdjustment.habit_id == habit_id).first()
    results.append(test("GoalAdjustment record created", adj is not None))

    # 10. Coaching insights
    print("10. coaching insights")
    insights = generate_insights(db)
    results.append(test("returns list", isinstance(insights, list)))

    # 11. Agent endpoint simulation
    print("11. agent tool chain")
    # Re-fetch the habit since adapt_goal may have changed target
    r1 = execute_tool("get_habit", {"name": "Test DSA"}, db)
    actual_id = r1.get("id", habit_id)
    r2 = execute_tool("analyze_progress", {"habit_id": actual_id}, db)
    results.append(test("chained tool calls work", "id" in r1 and "completion_rate" in r2))

    # Summary
    passed = sum(results)
    total = len(results)
    print(f"\n=== Results: {passed}/{total} passed ===")
    if passed == total:
        print("All tests passed!")
    else:
        print(f"{total - passed} test(s) failed.")

    db.close()


if __name__ == "__main__":
    run_tests()
