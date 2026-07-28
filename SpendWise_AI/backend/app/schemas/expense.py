from pydantic import BaseModel, Field
from typing import Optional
from datetime import date as date_type, datetime

ALLOWED_CATEGORIES = [
    "Food", "Transport", "Shopping", "Utilities", "Entertainment",
    "Education", "Healthcare", "Rent", "Subscription", "Other"
]

class ExpenseBase(BaseModel):
    amount: float = Field(..., gt=0, description="Amount spent")
    category: str = Field(..., description="Category of expense")
    description: str = Field(..., description="Description or item name")
    date: str = Field(default_factory=lambda: date_type.today().isoformat(), description="Date in YYYY-MM-DD format")

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    category: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None

class ExpenseOut(ExpenseBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
