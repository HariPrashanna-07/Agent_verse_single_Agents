from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class HabitCreate(BaseModel):
    name: str
    description: Optional[str] = None
    target_value: float
    unit: str
    frequency: str = "daily"
    category: Optional[str] = "Other"
    difficulty: Optional[str] = "medium"


class HabitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    target_value: Optional[float] = None
    unit: Optional[str] = None
    frequency: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    active: Optional[bool] = None


class HabitOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    target_value: float
    unit: str
    frequency: str
    category: str
    difficulty: str
    active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
