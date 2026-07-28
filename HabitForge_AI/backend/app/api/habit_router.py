from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.database.models import Habit
from app.schemas.habit import HabitCreate, HabitUpdate, HabitOut
from app.services.streaks import calculate_streak
from app.services.analytics import analyze_progress

router = APIRouter(prefix="/api/habits", tags=["habits"])


@router.get("", response_model=List[HabitOut])
def get_habits(active: Optional[bool] = None, category: Optional[str] = None,
               db: Session = Depends(get_db)):
    q = db.query(Habit)
    if active is not None:
        q = q.filter(Habit.active == active)
    if category:
        q = q.filter(Habit.category.ilike(f"%{category}%"))
    return q.all()


@router.post("", response_model=HabitOut, status_code=201)
def create_habit(data: HabitCreate, db: Session = Depends(get_db)):
    habit = Habit(**data.model_dump())
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return habit


@router.get("/{habit_id}", response_model=HabitOut)
def get_habit(habit_id: int, db: Session = Depends(get_db)):
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(404, "Habit not found")
    return habit


@router.put("/{habit_id}", response_model=HabitOut)
def update_habit(habit_id: int, data: HabitUpdate, db: Session = Depends(get_db)):
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(404, "Habit not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(habit, k, v)
    db.commit()
    db.refresh(habit)
    return habit


@router.delete("/{habit_id}")
def delete_habit(habit_id: int, db: Session = Depends(get_db)):
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(404, "Habit not found")
    db.delete(habit)
    db.commit()
    return {"success": True}


@router.get("/{habit_id}/streak")
def get_streak(habit_id: int, db: Session = Depends(get_db)):
    return calculate_streak(db, habit_id)


@router.get("/{habit_id}/analysis")
def get_analysis(habit_id: int, days: int = 7, db: Session = Depends(get_db)):
    return analyze_progress(db, habit_id, days)
