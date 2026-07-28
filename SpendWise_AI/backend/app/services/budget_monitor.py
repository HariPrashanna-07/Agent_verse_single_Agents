from datetime import date
import calendar
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.database.models import Expense, Budget
from app.services.forecasting import calculate_forecast

def evaluate_budget_risks(db: Session, month: int = None, year: int = None) -> List[Dict[str, Any]]:
    today = date.today()
    target_month = month or today.month
    target_year = year or today.year

    insights = []
    _, days_in_month = calendar.monthrange(target_year, target_month)
    elapsed_days = max(1, today.day)
    remaining_days = days_in_month - elapsed_days

    # 1. Evaluate Category Budgets
    cat_budgets = db.query(Budget).filter(
        Budget.category.isnot(None),
        Budget.month == target_month,
        Budget.year == target_year
    ).all()

    start_str = f"{target_year:04d}-{target_month:02d}-01"
    end_str = f"{target_year:04d}-{target_month:02d}-{days_in_month:02d}"

    # Get category totals for target month
    expenses = db.query(Expense).filter(Expense.date >= start_str, Expense.date <= end_str).all()
    cat_spent: Dict[str, float] = {}
    for e in expenses:
        cat_spent[e.category] = cat_spent.get(e.category, 0.0) + e.amount

    for b in cat_budgets:
        spent = cat_spent.get(b.category, 0.0)
        percentage = (spent / b.limit * 100.0) if b.limit > 0 else 0.0
        daily_rate = spent / elapsed_days if elapsed_days > 0 else 0.0
        projected = spent + (daily_rate * remaining_days)

        if percentage >= 100.0:
            insights.append({
                "level": "critical",
                "category": b.category,
                "message": f"🚨 Budget Exceeded! You've spent ₹{spent:,.2f} of your ₹{b.limit:,.2f} {b.category} budget ({percentage:.1f}%).",
                "action_suggestion": f"Pause further non-essential {b.category} spending for the rest of this month."
            })
        elif percentage >= 85.0 or projected > b.limit:
            insights.append({
                "level": "warning",
                "category": b.category,
                "message": f"⚠️ High Spending Warning! You've used {percentage:.0f}% of your {b.category} budget (₹{spent:,.2f} / ₹{b.limit:,.2f}) with {remaining_days} days remaining.",
                "action_suggestion": f"Cap daily {b.category} spending to ₹{((b.limit - spent) / max(1, remaining_days)):,.2f} to stay within limit."
            })

    # 2. Evaluate Overall Budget
    forecast = calculate_forecast(db, target_month, target_year)
    if forecast["budget_limit"] > 0:
        total_spent = forecast["spent_so_far"]
        limit = forecast["budget_limit"]
        pct = (total_spent / limit * 100.0)
        
        if pct >= 100.0:
            insights.append({
                "level": "critical",
                "category": "Overall",
                "message": f"🚨 Overall Monthly Budget Exceeded! Total spent: ₹{total_spent:,.2f} / Limit: ₹{limit:,.2f}.",
                "action_suggestion": "Review recent transactions and cut optional expenses immediately."
            })
        elif forecast["predicted_monthly_spending"] > limit or pct >= 85.0:
            insights.append({
                "level": "warning",
                "category": "Overall",
                "message": f"⚠️ Monthly Budget Alert: You have used {pct:.0f}% of your ₹{limit:,.2f} budget with {remaining_days} days left. Projected total: ₹{forecast['predicted_monthly_spending']:,.2f}.",
                "action_suggestion": f"Keep remaining daily expenses under ₹{((limit - total_spent) / max(1, remaining_days)):,.2f}/day."
            })

    return insights
