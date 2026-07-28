from datetime import date
import calendar
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.database.models import Expense, Budget

def calculate_forecast(db: Session, month: Optional[int] = None, year: Optional[int] = None) -> Dict[str, Any]:
    today = date.today()
    target_month = month or today.month
    target_year = year or today.year

    _, days_in_month = calendar.monthrange(target_year, target_month)
    
    if target_year == today.year and target_month == today.month:
        elapsed_days = max(1, today.day)
    elif (target_year < today.year) or (target_year == today.year and target_month < today.month):
        elapsed_days = days_in_month
    else:
        elapsed_days = 1

    remaining_days = days_in_month - elapsed_days

    # Fetch expenses for target month/year
    start_str = f"{target_year:04d}-{target_month:02d}-01"
    end_str = f"{target_year:04d}-{target_month:02d}-{days_in_month:02d}"

    expenses = db.query(Expense).filter(Expense.date >= start_str, Expense.date <= end_str).all()
    spent_so_far = sum(e.amount for e in expenses)

    daily_average = spent_so_far / elapsed_days if elapsed_days > 0 else 0.0
    projected_total = spent_so_far + (daily_average * remaining_days)

    # Fetch overall monthly budget
    overall_budget = db.query(Budget).filter(
        Budget.category.is_(None),
        Budget.month == target_month,
        Budget.year == target_year
    ).first()

    budget_limit = overall_budget.limit if overall_budget else 0.0
    budget_diff = budget_limit - projected_total if budget_limit > 0 else 0.0

    percentage_of_budget = (projected_total / budget_limit * 100.0) if budget_limit > 0 else 0.0

    risk_level = "normal"
    if budget_limit > 0:
        if percentage_of_budget >= 100.0:
            risk_level = "critical"
        elif percentage_of_budget >= 85.0:
            risk_level = "warning"

    return {
        "month": target_month,
        "year": target_year,
        "days_in_month": days_in_month,
        "elapsed_days": elapsed_days,
        "remaining_days": remaining_days,
        "spent_so_far": round(spent_so_far, 2),
        "average_daily_spending": round(daily_average, 2),
        "predicted_monthly_spending": round(projected_total, 2),
        "budget_limit": round(budget_limit, 2),
        "predicted_budget_difference": round(budget_diff, 2),
        "predicted_budget_percentage": round(percentage_of_budget, 1),
        "risk_level": risk_level
    }
