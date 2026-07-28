import os
import sys
import random
from datetime import date, timedelta

# Ensure parent directory is in sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.connection import SessionLocal, engine, Base
from app.database.models import Expense, Budget

def seed_database():
    print("[SEED] Re-creating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    today = date.today()
    this_month = today.month
    this_year = today.year

    prev_month_date = date(this_year, this_month, 1) - timedelta(days=15)
    prev_month = prev_month_date.month
    prev_year = prev_month_date.year

    print(f"[SEED] Creating seed data for Current Month ({this_month}/{this_year}) and Previous Month ({prev_month}/{prev_year})...")

    # 1. Seed Budgets
    budgets = [
        # Overall Monthly Budget
        Budget(category=None, limit=25000.0, month=this_month, year=this_year),
        Budget(category=None, limit=25000.0, month=prev_month, year=prev_year),
        # Category Budgets
        Budget(category="Food", limit=6000.0, month=this_month, year=this_year),
        Budget(category="Shopping", limit=4000.0, month=this_month, year=this_year),
        Budget(category="Transport", limit=3000.0, month=this_month, year=this_year),
        Budget(category="Entertainment", limit=2500.0, month=this_month, year=this_year),
        Budget(category="Utilities", limit=3500.0, month=this_month, year=this_year),
        Budget(category="Subscription", limit=1500.0, month=this_month, year=this_year),
    ]

    for b in budgets:
        db.add(b)

    # 2. Seed Realistic Transactions
    sample_expenses = [
        # Current Month Expenses
        (250.0, "Food", "Lunch at Cafe Barista", today.isoformat()),
        (180.0, "Food", "Coffee & Snacks", (today - timedelta(days=1)).isoformat()),
        (1200.0, "Transport", "Weekly Petrol Tank Refill", (today - timedelta(days=2)).isoformat()),
        (950.0, "Utilities", "Electricity Bill Payment", (today - timedelta(days=3)).isoformat()),
        (3500.0, "Shopping", "New Running Shoes", (today - timedelta(days=5)).isoformat()),
        (499.0, "Subscription", "Netflix Monthly Standard", (today - timedelta(days=6)).isoformat()),
        (199.0, "Subscription", "Spotify Premium", (today - timedelta(days=7)).isoformat()),
        (850.0, "Food", "Family Dinner", (today - timedelta(days=8)).isoformat()),
        (1500.0, "Entertainment", "Weekend Movie & Snacks", (today - timedelta(days=9)).isoformat()),
        (2200.0, "Education", "Udemy Python & AI Masterclass", (today - timedelta(days=10)).isoformat()),
        (150.0, "Food", "Breakfast Sandwich", (today - timedelta(days=11)).isoformat()),
        (320.0, "Transport", "Uber Auto Ride", (today - timedelta(days=12)).isoformat()),
        (1400.0, "Shopping", "Wireless Earbuds", (today - timedelta(days=14)).isoformat()),
        (650.0, "Utilities", "Broadband Internet Bill", (today - timedelta(days=15)).isoformat()),

        # Previous Month Expenses
        (320.0, "Food", "Previous Month Lunch", (prev_month_date - timedelta(days=2)).isoformat()),
        (1100.0, "Transport", "Previous Month Petrol", (prev_month_date - timedelta(days=5)).isoformat()),
        (2800.0, "Shopping", "Clothes Shopping", (prev_month_date - timedelta(days=8)).isoformat()),
        (900.0, "Utilities", "Electricity Bill", (prev_month_date - timedelta(days=10)).isoformat()),
        (499.0, "Subscription", "Netflix Monthly Standard", (prev_month_date - timedelta(days=12)).isoformat()),
        (1200.0, "Entertainment", "Concert Ticket", (prev_month_date - timedelta(days=15)).isoformat()),
    ]

    for amount, category, desc, exp_date in sample_expenses:
        expense = Expense(
            amount=amount,
            category=category,
            description=desc,
            date=exp_date
        )
        db.add(expense)

    db.commit()
    db.close()
    print("[SUCCESS] SpendWise DB successfully seeded with realistic expense transactions & budgets!")


if __name__ == "__main__":
    seed_database()
