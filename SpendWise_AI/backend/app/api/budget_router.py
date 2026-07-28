from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.database.connection import get_db
from app.database.models import Budget
from app.schemas.budget import BudgetCreate, BudgetOut, BudgetStatusOut
from app.services.analytics import get_spending_analytics
from app.services.budget_monitor import evaluate_budget_risks

router = APIRouter(prefix="/api/budgets", tags=["Budgets"])

@router.get("", response_model=List[BudgetStatusOut])
def get_budgets(
    month: Optional[int] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    today = date.today()
    target_month = month or today.month
    target_year = year or today.year

    budgets = db.query(Budget).filter(
        Budget.month == target_month,
        Budget.year == target_year
    ).all()

    analytics = get_spending_analytics(db, "this_month")
    
    res = []
    for b in budgets:
        spent = analytics["total_spent"] if b.category is None else analytics["category_totals"].get(b.category, 0.0)
        rem = b.limit - spent
        pct = (spent / b.limit * 100.0) if b.limit > 0 else 0.0
        
        res.append(BudgetStatusOut(
            id=b.id,
            category=b.category or "Overall",
            limit=b.limit,
            spent=round(spent, 2),
            remaining=round(rem, 2),
            percentage_used=round(pct, 1),
            month=b.month,
            year=b.year,
            is_exceeded=spent > b.limit
        ))
    return res

@router.post("", response_model=BudgetOut)
def create_or_update_budget(budget_in: BudgetCreate, db: Session = Depends(get_db)):
    cat = budget_in.category
    cat = None if cat and str(cat).lower() in ["overall", "total", "none", "null"] else cat
    m = budget_in.month or date.today().month
    y = budget_in.year or date.today().year

    existing = db.query(Budget).filter(
        Budget.category == cat,
        Budget.month == m,
        Budget.year == y
    ).first()

    if existing:
        existing.limit = budget_in.limit
        db.commit()
        db.refresh(existing)
        return existing
    else:
        b_obj = Budget(category=cat, limit=budget_in.limit, month=m, year=y)
        db.add(b_obj)
        db.commit()
        db.refresh(b_obj)
        return b_obj

@router.get("/risks")
def get_budget_risks(month: Optional[int] = None, year: Optional[int] = None, db: Session = Depends(get_db)):
    return evaluate_budget_risks(db, month, year)
