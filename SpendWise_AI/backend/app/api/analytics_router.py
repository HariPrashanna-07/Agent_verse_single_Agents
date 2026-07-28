from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database.connection import get_db
from app.services.analytics import get_spending_analytics, compare_spending_periods
from app.services.forecasting import calculate_forecast
from app.services.recommendations import generate_savings_recommendations
from app.services.budget_monitor import evaluate_budget_risks

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/summary")
def get_summary(period: str = "this_month", db: Session = Depends(get_db)):
    return get_spending_analytics(db, period)

@router.get("/compare")
def compare_periods(
    period1: str = "this_month",
    period2: str = "last_month",
    db: Session = Depends(get_db)
):
    return compare_spending_periods(db, period1, period2)

@router.get("/forecast")
def get_forecast(
    month: Optional[int] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    return calculate_forecast(db, month, year)

@router.get("/recommendations")
def get_recommendations(period: str = "this_month", db: Session = Depends(get_db)):
    return generate_savings_recommendations(db, period)

@router.get("/report")
def get_full_report(
    month: Optional[int] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    analytics = get_spending_analytics(db, "this_month")
    comparison = compare_spending_periods(db, "this_month", "last_month")
    forecast = calculate_forecast(db, month, year)
    recommendations = generate_savings_recommendations(db, "this_month")
    risks = evaluate_budget_risks(db, month, year)

    return {
        "analytics": analytics,
        "comparison": comparison,
        "forecast": forecast,
        "recommendations": recommendations,
        "active_warnings": risks
    }
