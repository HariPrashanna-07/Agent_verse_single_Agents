from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.database.models import Expense
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseOut

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])

@router.get("", response_model=List[ExpenseOut])
def get_all_expenses(
    category: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Expense)
    if category and category != "All":
        query = query.filter(Expense.category == category)
    if start_date:
        query = query.filter(Expense.date >= start_date)
    if end_date:
        query = query.filter(Expense.date <= end_date)
    if search:
        query = query.filter(Expense.description.ilike(f"%{search}%"))
    
    return query.order_by(Expense.date.desc(), Expense.id.desc()).all()

@router.post("", response_model=ExpenseOut)
def create_expense(expense_in: ExpenseCreate, db: Session = Depends(get_db)):
    expense = Expense(
        amount=expense_in.amount,
        category=expense_in.category,
        description=expense_in.description,
        date=expense_in.date
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

@router.put("/{expense_id}", response_model=ExpenseOut)
def update_expense(expense_id: int, expense_in: ExpenseUpdate, db: Session = Depends(get_db)):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    if expense_in.amount is not None:
        expense.amount = expense_in.amount
    if expense_in.category is not None:
        expense.category = expense_in.category
    if expense_in.description is not None:
        expense.description = expense_in.description
    if expense_in.date is not None:
        expense.date = expense_in.date

    db.commit()
    db.refresh(expense)
    return expense

@router.delete("/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()
    return {"message": "Expense deleted successfully"}
