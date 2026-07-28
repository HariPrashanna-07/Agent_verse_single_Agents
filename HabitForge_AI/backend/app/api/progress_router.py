from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date as date_type
from typing import List
from app.database.connection import get_db
from app.database.models import Habit, HabitLog
from app.schemas.progress import LogCreate, LogOut
from app.services.streaks import calculate_streak
from app.services.analytics import analyze_progress

router = APIRouter(prefix="/api/progress", tags=["progress"])


@router.post("", response_model=LogOut, status_code=201)
def log_progress(data: LogCreate, db: Session = Depends(get_db)):
    habit = None
    if data.habit_id:
        habit = db.query(Habit).filter(Habit.id == data.habit_id).first()
    elif data.habit_name:
        habit = db.query(Habit).filter(Habit.name.ilike(f"%{data.habit_name}%")).first()
    if not habit:
        raise HTTPException(404, "Habit not found")

    log_date = date_type.today()
    if data.date:
        try:
            log_date = date_type.fromisoformat(data.date)
        except ValueError:
            pass

    existing = db.query(HabitLog).filter(
        HabitLog.habit_id == habit.id, HabitLog.date == log_date
    ).first()

    completed = data.actual_value >= habit.target_value

    if existing:
        existing.actual_value = data.actual_value
        existing.completed = completed
        if data.notes:
            existing.notes = data.notes
        db.commit()
        db.refresh(existing)
        return existing

    log = HabitLog(habit_id=habit.id, date=log_date,
                   actual_value=data.actual_value, completed=completed, notes=data.notes)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/{habit_id}", response_model=List[LogOut])
def get_progress(habit_id: int, days: int = 30, db: Session = Depends(get_db)):
    from datetime import timedelta
    start = date_type.today() - timedelta(days=days - 1)
    return db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id, HabitLog.date >= start
    ).order_by(HabitLog.date.desc()).all()


@router.get("/{habit_id}/streak")
def get_streak(habit_id: int, db: Session = Depends(get_db)):
    return calculate_streak(db, habit_id)


@router.get("/{habit_id}/analysis")
def get_analysis(habit_id: int, days: int = 7, db: Session = Depends(get_db)):
    return analyze_progress(db, habit_id, days)
