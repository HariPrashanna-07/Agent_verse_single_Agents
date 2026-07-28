from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class LogCreate(BaseModel):
    habit_id: Optional[int] = None
    habit_name: Optional[str] = None
    actual_value: float
    date: Optional[str] = None
    notes: Optional[str] = None


class LogOut(BaseModel):
    id: int
    habit_id: int
    date: date
    actual_value: float
    completed: bool
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class StreakOut(BaseModel):
    habit_id: int
    habit_name: str
    current_streak: int
    best_streak: int
    completed_days: int
    total_tracked_days: int


class AnalysisOut(BaseModel):
    habit_id: int
    habit_name: str
    target_value: float
    unit: str
    completion_rate: float
    average_actual: float
    average_target_percentage: float
    current_streak: int
    best_streak: int
    missed_days: int
    completed_days: int
    trend: str
    consistency_score: float
    days_analyzed: int
