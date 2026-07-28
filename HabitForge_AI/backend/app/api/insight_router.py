from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.coaching import generate_insights
from app.services.adaptive_goals import evaluate_goal
from app.database.models import Habit

router = APIRouter(prefix="/api/insights", tags=["insights"])


@router.get("")
def get_insights(db: Session = Depends(get_db)):
    insights = generate_insights(db)
    habits = db.query(Habit).filter(Habit.active == True).all()
    goal_recommendations = []
    for habit in habits:
        rec = evaluate_goal(db, habit.id)
        if rec["recommendation"] != "KEEP":
            goal_recommendations.append({
                "habit_id": habit.id,
                "habit_name": habit.name,
                "unit": habit.unit,
                **rec,
            })
    return {"insights": insights, "goal_recommendations": goal_recommendations}
