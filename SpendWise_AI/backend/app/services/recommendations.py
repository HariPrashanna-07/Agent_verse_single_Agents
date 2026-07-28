from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.services.analytics import get_spending_analytics

# Non-essential / flexible spending categories suitable for cost reduction
FLEXIBLE_CATEGORIES = ["Shopping", "Entertainment", "Subscription", "Food", "Other"]

def generate_savings_recommendations(db: Session, period: str = "this_month") -> List[Dict[str, Any]]:
    analytics = get_spending_analytics(db, period)
    cat_totals = analytics.get("category_totals", {})
    total_spent = analytics.get("total_spent", 0.0)

    recommendations = []

    if total_spent == 0 or not cat_totals:
        return [{
            "category": "General",
            "current_spending": 0.0,
            "suggested_reduction_pct": 0,
            "potential_savings": 0.0,
            "reasoning": "No spending records found for this period to generate targeted recommendations."
        }]

    # Filter for flexible categories sorted by highest spent
    flexible_spending = [
        (cat, amt) for cat, amt in cat_totals.items() if cat in FLEXIBLE_CATEGORIES and amt > 0
    ]
    flexible_spending.sort(key=lambda x: x[1], reverse=True)

    total_potential_savings = 0.0

    for cat, amt in flexible_spending:
        reduction_pct = 20 if cat in ["Shopping", "Entertainment", "Subscription"] else 15
        potential_savings = round((amt * reduction_pct) / 100.0, 2)
        total_potential_savings += potential_savings

        recommendations.append({
            "category": cat,
            "current_spending": round(amt, 2),
            "suggested_reduction_pct": reduction_pct,
            "potential_savings": potential_savings,
            "reasoning": f"You spent ₹{amt:,.2f} on {cat}. A {reduction_pct}% trim could save you ₹{potential_savings:,.2f} this period."
        })

    if recommendations:
        recommendations.insert(0, {
            "category": "Summary Plan",
            "current_spending": total_spent,
            "suggested_reduction_pct": 0,
            "potential_savings": round(total_potential_savings, 2),
            "reasoning": f"By optimizing flexible categories ({', '.join([r['category'] for r in recommendations if r['category'] != 'Summary Plan'])}), you could save a total of ₹{total_potential_savings:,.2f}."
        })

    return recommendations
