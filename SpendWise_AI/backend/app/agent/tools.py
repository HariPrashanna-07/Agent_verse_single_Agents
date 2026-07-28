from datetime import date, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.database.models import Expense, Budget
from app.services.analytics import get_spending_analytics, compare_spending_periods
from app.services.forecasting import calculate_forecast
from app.services.budget_monitor import evaluate_budget_risks
from app.services.recommendations import generate_savings_recommendations

# 12 Agent Tool JSON Schemas for LLM Tool Calling
AGENT_TOOLS_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "add_expense",
            "description": "Add a new expense transaction to the database. Use this tool whenever the user mentions spending money.",
            "parameters": {
                "type": "object",
                "properties": {
                    "amount": {"type": "number", "description": "The exact monetary amount spent in numerical format (e.g. 250.0)"},
                    "description": {"type": "string", "description": "Item or service description (e.g., 'Lunch', 'Bus travel', 'Electricity bill')"},
                    "category": {
                        "type": "string",
                        "enum": ["Food", "Transport", "Shopping", "Utilities", "Entertainment", "Education", "Healthcare", "Rent", "Subscription", "Other"],
                        "description": "Expense category derived from context."
                    },
                    "date": {"type": "string", "description": "Date of expense in YYYY-MM-DD format. Use 'today', 'yesterday', or ISO date string."}
                },
                "required": ["amount", "description", "category"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_expenses",
            "description": "Retrieve filtered list of expenses from the database.",
            "parameters": {
                "type": "object",
                "properties": {
                    "start_date": {"type": "string", "description": "Start date YYYY-MM-DD"},
                    "end_date": {"type": "string", "description": "End date YYYY-MM-DD"},
                    "category": {"type": "string", "description": "Category filter"},
                    "limit": {"type": "integer", "description": "Max items to return (default 20)"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_expense",
            "description": "Update an existing expense by ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "expense_id": {"type": "integer", "description": "ID of the expense to edit"},
                    "amount": {"type": "number"},
                    "description": {"type": "string"},
                    "category": {"type": "string"},
                    "date": {"type": "string"}
                },
                "required": ["expense_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "delete_expense",
            "description": "Delete an expense by ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "expense_id": {"type": "integer", "description": "ID of the expense to delete"}
                },
                "required": ["expense_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_expenses_by_period",
            "description": "Get expenses for a predefined human time period ('today', 'yesterday', 'this_week', 'last_week', 'this_month', 'last_month').",
            "parameters": {
                "type": "object",
                "properties": {
                    "period": {"type": "string", "enum": ["today", "yesterday", "this_week", "last_week", "this_month", "last_month"]}
                },
                "required": ["period"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_category_spending",
            "description": "Get total spending for a specific category or all categories for a given month and year.",
            "parameters": {
                "type": "object",
                "properties": {
                    "category": {"type": "string", "description": "Specific category or null for all"},
                    "month": {"type": "integer", "description": "Month number 1-12"},
                    "year": {"type": "integer", "description": "Four digit year"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "set_budget",
            "description": "Set or update monthly budget limit for overall spending or a specific category.",
            "parameters": {
                "type": "object",
                "properties": {
                    "limit": {"type": "number", "description": "Monthly budget limit amount"},
                    "category": {"type": "string", "description": "Category name, or null/omitted for overall budget"},
                    "month": {"type": "integer"},
                    "year": {"type": "integer"}
                },
                "required": ["limit"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_budget",
            "description": "Get stored monthly budget settings and current spending status.",
            "parameters": {
                "type": "object",
                "properties": {
                    "month": {"type": "integer"},
                    "year": {"type": "integer"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_spending_summary",
            "description": "Get complete calculated spending analytics including total spent, highest category, largest transaction, daily average.",
            "parameters": {
                "type": "object",
                "properties": {
                    "period": {"type": "string", "default": "this_month"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "compare_spending",
            "description": "Compare spending between two time periods (e.g. 'this_month' vs 'last_month').",
            "parameters": {
                "type": "object",
                "properties": {
                    "period1": {"type": "string", "default": "this_month"},
                    "period2": {"type": "string", "default": "last_month"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "forecast_expenses",
            "description": "Calculate deterministic month-end spending forecast based on current daily spending rate.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "generate_report",
            "description": "Generate a comprehensive financial health report including analytics, budget status, forecast, and personalized savings recommendations.",
            "parameters": {
                "type": "object",
                "properties": {
                    "month": {"type": "integer"},
                    "year": {"type": "integer"}
                }
            }
        }
    }
]

# Tool Execution Dispatcher
def execute_agent_tool(db: Session, tool_name: str, args: Dict[str, Any]) -> Dict[str, Any]:
    today = date.today()
    
    if tool_name == "add_expense":
        raw_date = args.get("date", "today")
        if str(raw_date).lower() == "today":
            exp_date = today.isoformat()
        elif str(raw_date).lower() == "yesterday":
            exp_date = (today - timedelta(days=1)).isoformat()
        else:
            exp_date = str(raw_date)

        expense = Expense(
            amount=float(args["amount"]),
            category=args.get("category", "Other"),
            description=args.get("description", "Expense"),
            date=exp_date
        )
        db.add(expense)
        db.commit()
        db.refresh(expense)

        # Re-evaluate budget risks
        risks = evaluate_budget_risks(db)

        return {
            "status": "success",
            "action": "add_expense",
            "expense": {
                "id": expense.id,
                "amount": expense.amount,
                "category": expense.category,
                "description": expense.description,
                "date": expense.date
            },
            "proactive_risks": risks,
            "confirmation": f"Successfully recorded ₹{expense.amount:,.2f} for '{expense.description}' under category '{expense.category}' on {expense.date}."
        }

    elif tool_name == "get_expenses":
        query = db.query(Expense)
        if args.get("category"):
            query = query.filter(Expense.category == args["category"])
        if args.get("start_date"):
            query = query.filter(Expense.date >= args["start_date"])
        if args.get("end_date"):
            query = query.filter(Expense.date <= args["end_date"])
        
        limit = args.get("limit", 20)
        expenses = query.order_by(Expense.date.desc()).limit(limit).all()

        return {
            "status": "success",
            "count": len(expenses),
            "expenses": [
                {"id": e.id, "amount": e.amount, "category": e.category, "description": e.description, "date": e.date}
                for e in expenses
            ]
        }

    elif tool_name == "update_expense":
        exp_id = args["expense_id"]
        exp = db.query(Expense).filter(Expense.id == exp_id).first()
        if not exp:
            return {"status": "error", "message": f"Expense with ID {exp_id} not found."}
        
        if "amount" in args and args["amount"] is not None:
            exp.amount = float(args["amount"])
        if "category" in args and args["category"]:
            exp.category = args["category"]
        if "description" in args and args["description"]:
            exp.description = args["description"]
        if "date" in args and args["date"]:
            exp.date = args["date"]

        db.commit()
        db.refresh(exp)
        return {"status": "success", "expense": {"id": exp.id, "amount": exp.amount, "category": exp.category, "description": exp.description, "date": exp.date}}

    elif tool_name == "delete_expense":
        exp_id = args["expense_id"]
        exp = db.query(Expense).filter(Expense.id == exp_id).first()
        if not exp:
            return {"status": "error", "message": f"Expense with ID {exp_id} not found."}
        db.delete(exp)
        db.commit()
        return {"status": "success", "message": f"Expense ID {exp_id} successfully deleted."}

    elif tool_name == "get_expenses_by_period":
        period = args.get("period", "this_month")
        analytics = get_spending_analytics(db, period)
        return {"status": "success", "period": period, "data": analytics}

    elif tool_name == "get_category_spending":
        m = args.get("month") or today.month
        y = args.get("year") or today.year
        cat = args.get("category")
        
        analytics = get_spending_analytics(db, "this_month")
        if cat:
            amt = analytics["category_totals"].get(cat, 0.0)
            return {"status": "success", "category": cat, "amount": amt, "month": m, "year": y}
        return {"status": "success", "category_totals": analytics["category_totals"], "month": m, "year": y}

    elif tool_name == "set_budget":
        limit = float(args["limit"])
        cat = args.get("category")
        cat = None if cat and str(cat).lower() in ["overall", "total", "none", "null"] else cat
        m = args.get("month") or today.month
        y = args.get("year") or today.year

        existing = db.query(Budget).filter(
            Budget.category == cat,
            Budget.month == m,
            Budget.year == y
        ).first()

        if existing:
            existing.limit = limit
            b_obj = existing
        else:
            b_obj = Budget(category=cat, limit=limit, month=m, year=y)
            db.add(b_obj)

        db.commit()
        db.refresh(b_obj)

        risks = evaluate_budget_risks(db, m, y)
        target_name = f"category '{cat}'" if cat else "overall monthly"
        return {
            "status": "success",
            "budget": {"id": b_obj.id, "category": b_obj.category, "limit": b_obj.limit, "month": b_obj.month, "year": b_obj.year},
            "proactive_risks": risks,
            "confirmation": f"Successfully set {target_name} budget limit to ₹{limit:,.2f} for {m}/{y}."
        }

    elif tool_name == "get_budget":
        m = args.get("month") or today.month
        y = args.get("year") or today.year
        budgets = db.query(Budget).filter(Budget.month == m, Budget.year == y).all()
        analytics = get_spending_analytics(db, "this_month")
        
        result_budgets = []
        for b in budgets:
            spent = analytics["total_spent"] if b.category is None else analytics["category_totals"].get(b.category, 0.0)
            rem = b.limit - spent
            pct = (spent / b.limit * 100.0) if b.limit > 0 else 0.0
            result_budgets.append({
                "id": b.id,
                "category": b.category or "Overall",
                "limit": b.limit,
                "spent": round(spent, 2),
                "remaining": round(rem, 2),
                "percentage_used": round(pct, 1),
                "is_exceeded": spent > b.limit
            })

        return {"status": "success", "month": m, "year": y, "budgets": result_budgets}

    elif tool_name == "get_spending_summary":
        period = args.get("period", "this_month")
        analytics = get_spending_analytics(db, period)
        return {"status": "success", "summary": analytics}

    elif tool_name == "compare_spending":
        p1 = args.get("period1", "this_month")
        p2 = args.get("period2", "last_month")
        comparison = compare_spending_periods(db, p1, p2)
        return {"status": "success", "comparison": comparison}

    elif tool_name == "forecast_expenses":
        forecast = calculate_forecast(db)
        return {"status": "success", "forecast": forecast}

    elif tool_name == "generate_report":
        m = args.get("month") or today.month
        y = args.get("year") or today.year
        analytics = get_spending_analytics(db, "this_month")
        comparison = compare_spending_periods(db, "this_month", "last_month")
        forecast = calculate_forecast(db, m, y)
        recommendations = generate_savings_recommendations(db, "this_month")
        risks = evaluate_budget_risks(db, m, y)

        return {
            "status": "success",
            "report": {
                "month": m,
                "year": y,
                "analytics": analytics,
                "comparison": comparison,
                "forecast": forecast,
                "recommendations": recommendations,
                "active_warnings": risks
            }
        }

    else:
        return {"status": "error", "message": f"Unknown tool '{tool_name}'"}
