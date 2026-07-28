from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date

class BudgetBase(BaseModel):
    category: Optional[str] = Field(None, description="Category name, or null/empty for total monthly budget")
    limit: float = Field(..., gt=0, description="Monthly spending limit")
    month: Optional[int] = Field(default_factory=lambda: date.today().month, ge=1, le=12)
    year: Optional[int] = Field(default_factory=lambda: date.today().year, ge=2020)

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    limit: float = Field(..., gt=0)

class BudgetOut(BudgetBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class BudgetStatusOut(BaseModel):
    id: Optional[int] = None
    category: Optional[str] = "Overall"
    limit: float
    spent: float
    remaining: float
    percentage_used: float
    month: int
    year: int
    is_exceeded: bool
