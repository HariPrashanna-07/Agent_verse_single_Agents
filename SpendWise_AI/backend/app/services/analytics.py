from datetime import date, datetime, timedelta
import calendar
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.models import Expense, Budget

def parse_period_dates(period: str) -> tuple[str, str]:
    today = date.today()
    period = period.lower().replace("-", "_")

    if period == "today":
        return today.isoformat(), today.isoformat()
    elif period == "yesterday":
        y = today - timedelta(days=1)
        return y.isoformat(), y.isoformat()
    elif period == "this_week":
        # Start from Monday of current week
        start = today - timedelta(days=today.weekday())
        return start.isoformat(), today.isoformat()
    elif period == "last_week":
        end = today - timedelta(days=today.weekday() + 1)
        start = end - timedelta(days=6)
        return start.isoformat(), end.isoformat()
    elif period == "this_month":
        start = date(today.year, today.month, 1)
        return start.isoformat(), today.isoformat()
    elif period == "last_month":
        first_of_this_month = date(today.year, today.month, 1)
        last_day_prev_month = first_of_this_month - timedelta(days=1)
        first_day_prev_month = date(last_day_prev_month.year, last_day_prev_month.month, 1)
        return first_day_prev_month.isoformat(), last_day_prev_month.isoformat()
    else:
        # Default to this month
        start = date(today.year, today.month, 1)
        return start.isoformat(), today.isoformat()

def get_spending_analytics(db: Session, period: str = "this_month") -> Dict[str, Any]:
    start_date, end_date = parse_period_dates(period)
    
    # Query expenses in period
    expenses = db.query(Expense).filter(Expense.date >= start_date, Expense.date <= end_date).all()
    
    total_spent = sum(e.amount for e in expenses)
    count = len(expenses)

    # Category totals
    category_totals: Dict[str, float] = {}
    for e in expenses:
        category_totals[e.category] = category_totals.get(e.category, 0.0) + e.amount

    highest_category = max(category_totals.items(), key=lambda x: x[1]) if category_totals else ("None", 0.0)
    
    # Largest single expense
    largest_expense = None
    if expenses:
        max_exp = max(expenses, key=lambda x: x.amount)
        largest_expense = {
            "id": max_exp.id,
            "amount": max_exp.amount,
            "category": max_exp.category,
            "description": max_exp.description,
            "date": max_exp.date
        }

    # Calculate daily average
    start_d = datetime.strptime(start_date, "%Y-%m-%d").date()
    end_d = datetime.strptime(end_date, "%Y-%m-%d").date()
    days_in_period = max(1, (end_d - start_d).days + 1)
    daily_average = total_spent / days_in_period

    return {
        "period": period,
        "start_date": start_date,
        "end_date": end_date,
        "total_spent": round(total_spent, 2),
        "transaction_count": count,
        "category_totals": {k: round(v, 2) for k, v in category_totals.items()},
        "highest_spending_category": {
            "category": highest_category[0],
            "amount": round(highest_category[1], 2)
        },
        "largest_transaction": largest_expense,
        "daily_average": round(daily_average, 2),
        "days_in_period": days_in_period
    }

def compare_spending_periods(db: Session, period1: str = "this_month", period2: str = "last_month") -> Dict[str, Any]:
    data1 = get_spending_analytics(db, period1)
    data2 = get_spending_analytics(db, period2)

    total1 = data1["total_spent"]
    total2 = data2["total_spent"]
    
    diff = total1 - total2
    percentage_change = 0.0
    if total2 > 0:
        percentage_change = ((total1 - total2) / total2) * 100.0
    elif total1 > 0:
        percentage_change = 100.0

    return {
        "period1": {
            "name": period1,
            "total_spent": total1,
            "start_date": data1["start_date"],
            "end_date": data1["end_date"]
        },
        "period2": {
            "name": period2,
            "total_spent": total2,
            "start_date": data2["start_date"],
            "end_date": data2["end_date"]
        },
        "difference": round(diff, 2),
        "percentage_change": round(percentage_change, 2),
        "direction": "increased" if diff > 0 else ("decreased" if diff < 0 else "unchanged")
    }
