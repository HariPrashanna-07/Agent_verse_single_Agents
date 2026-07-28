"""
Seed script — generates realistic demo data relative to TODAY.
Run: python seed.py
Idempotent: clears existing data and rebuilds.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import date, timedelta
import random
from app.database.connection import SessionLocal, init_db
from app.database.models import Habit, HabitLog, GoalAdjustment

random.seed(42)

HABITS = [
    {"name": "DSA Practice", "target_value": 60, "unit": "minutes", "category": "Learning",
     "difficulty": "hard", "description": "Daily coding practice — algorithms & data structures"},
    {"name": "Exercise", "target_value": 45, "unit": "minutes", "category": "Fitness",
     "difficulty": "medium", "description": "Daily workout"},
    {"name": "Reading", "target_value": 20, "unit": "pages", "category": "Reading",
     "difficulty": "easy", "description": "Daily reading"},
    {"name": "Meditation", "target_value": 15, "unit": "minutes", "category": "Mindfulness",
     "difficulty": "easy", "description": "Daily mindfulness practice"},
    {"name": "English Communication", "target_value": 30, "unit": "minutes", "category": "Personal",
     "difficulty": "medium", "description": "Speaking and writing practice"},
]

# Pattern generators per habit (value as % of target, None = missed)
def dsa_pattern(day_offset: int) -> float | None:
    """Moderate consistency, recent difficulty — declining trend"""
    if day_offset > 21:
        return random.choice([60, 55, 60, 50, 60, None, 55])[day_offset % 7] if False else random.uniform(55, 65)
    if day_offset > 14:
        return random.choice([50, 45, 60, None, 50, 55, 45])[day_offset % 7] if False else random.uniform(40, 60)
    if day_offset > 7:
        return random.choice([45, 40, None, 35, 40, 45, None])[day_offset % 7] if False else random.uniform(30, 50)
    # Last 7 days — struggling
    patterns = [45, 30, None, 35, 40, 30, None]
    return patterns[day_offset % 7]


def exercise_pattern(day_offset: int) -> float | None:
    """Low consistency, several misses"""
    patterns_early = [45, None, 30, None, 40, None, 35]
    patterns_mid = [None, 30, None, 25, None, 35, None]
    patterns_late = [30, None, None, 25, None, 30, None]
    if day_offset > 14:
        return patterns_early[day_offset % 7]
    if day_offset > 7:
        return patterns_mid[day_offset % 7]
    return patterns_late[day_offset % 7]


def reading_pattern(day_offset: int) -> float | None:
    """High consistency, strong streak"""
    patterns = [20, 22, 20, 25, 20, 20, 18]
    val = patterns[day_offset % 7]
    return val if random.random() > 0.05 else None  # 95% completion


def meditation_pattern(day_offset: int) -> float | None:
    """Improving — started low, getting better"""
    if day_offset > 21:
        return random.choice([None, 10, None, 8, 10, None, 12])
    if day_offset > 14:
        return random.choice([10, 12, None, 12, 15, 10, None])
    if day_offset > 7:
        return random.choice([12, 15, 12, None, 15, 15, 12])
    # Last 7 days — consistent
    return random.choice([15, 15, 12, 15, 15, None, 15])


def english_pattern(day_offset: int) -> float | None:
    """Stable"""
    patterns = [30, 25, 30, None, 30, 30, 25]
    return patterns[day_offset % 7]


PATTERN_FNS = [dsa_pattern, exercise_pattern, reading_pattern, meditation_pattern, english_pattern]


def seed():
    init_db()
    db = SessionLocal()

    # Clear existing
    db.query(GoalAdjustment).delete()
    db.query(HabitLog).delete()
    db.query(Habit).delete()
    db.commit()
    print("Cleared existing data.")

    today = date.today()
    created_habits = []

    for habit_data in HABITS:
        habit = Habit(**habit_data)
        db.add(habit)
        db.flush()
        created_habits.append(habit)

    db.commit()
    print(f"Created {len(created_habits)} habits.")

    # Generate 30 days of logs
    log_count = 0
    for i, habit in enumerate(created_habits):
        pattern_fn = PATTERN_FNS[i]
        for day_offset in range(29, -1, -1):  # 30 days ago to yesterday
            d = today - timedelta(days=day_offset)
            val = pattern_fn(day_offset)
            if val is not None:
                completed = val >= habit.target_value
                log = HabitLog(
                    habit_id=habit.id,
                    date=d,
                    actual_value=round(val, 1),
                    completed=completed,
                    notes=None,
                )
                db.add(log)
                log_count += 1

    db.commit()
    print(f"Created {log_count} habit logs.")

    # Add a goal adjustment record for Exercise (demonstrates the feature)
    exercise = next(h for h in created_habits if h.name == "Exercise")
    adj = GoalAdjustment(
        habit_id=exercise.id,
        old_target=60.0,
        new_target=45.0,
        reason="Completion rate was below 40% with 60-minute target. Reduced to 45 minutes to rebuild consistency.",
        adjustment_type="decrease",
    )
    db.add(adj)
    db.commit()
    print("Created 1 goal adjustment record.")

    # Print summary
    print("\n=== Seed Summary ===")
    for habit in created_habits:
        logs = db.query(HabitLog).filter(HabitLog.habit_id == habit.id).all()
        completed = sum(1 for l in logs if l.completed)
        print(f"  {habit.name}: {len(logs)} logs, {completed} completed ({round(completed/len(logs)*100) if logs else 0}%)")

    db.close()
    print("\nSeed complete! Run: uvicorn app.main:app --reload")


if __name__ == "__main__":
    seed()
