import json
import re
import logging
from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.database.models import Habit, HabitLog, GoalAdjustment
from app.services import analytics, streaks, adaptive_goals, daily_goals, coaching, llm_provider
from app.agent.prompts import SYSTEM_PROMPT
from app.agent.tools import TOOL_DEFINITIONS

logger = logging.getLogger(__name__)


# ── Tool Executor ──────────────────────────────────────────────────────────────

def execute_tool(tool_name: str, args: dict, db: Session) -> dict:
    try:
        if tool_name == "create_habit":
            return _create_habit(db, **args)
        elif tool_name == "get_habits":
            return _get_habits(db, **args)
        elif tool_name == "get_habit":
            return _get_habit(db, **args)
        elif tool_name == "update_habit":
            return _update_habit(db, **args)
        elif tool_name == "delete_habit":
            return _delete_habit(db, **args)
        elif tool_name == "log_progress":
            return _log_progress(db, **args)
        elif tool_name == "get_today_goals":
            return _get_today_goals(db)
        elif tool_name == "get_habit_history":
            return _get_habit_history(db, **args)
        elif tool_name == "calculate_streak":
            return _calculate_streak(db, **args)
        elif tool_name == "analyze_progress":
            return _analyze_progress(db, **args)
        elif tool_name == "suggest_daily_goals":
            return daily_goals.suggest_daily_goals(db)
        elif tool_name == "adapt_goal":
            return _adapt_goal(db, **args)
        elif tool_name == "generate_coaching_report":
            return _generate_coaching_report(db, **args)
        else:
            return {"error": f"Unknown tool: {tool_name}"}
    except Exception as e:
        logger.error(f"Tool {tool_name} error: {e}")
        return {"error": str(e)}


def _resolve_habit(db: Session, habit_id=None, habit_name=None, name=None) -> Habit | None:
    search_name = habit_name or name
    if habit_id:
        return db.query(Habit).filter(Habit.id == habit_id).first()
    if search_name:
        h = db.query(Habit).filter(Habit.name.ilike(f"%{search_name}%")).first()
        return h
    return None


def _create_habit(db: Session, name: str, target_value: float, unit: str,
                  frequency: str = "daily", category: str = "Other",
                  description: str = None, difficulty: str = "medium") -> dict:
    existing = db.query(Habit).filter(Habit.name.ilike(name)).first()
    if existing:
        return {"error": f"Habit '{name}' already exists.", "habit_id": existing.id}
    habit = Habit(
        name=name, target_value=target_value, unit=unit,
        frequency=frequency, category=category or "Other",
        description=description, difficulty=difficulty or "medium",
    )
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return {"success": True, "habit_id": habit.id, "name": habit.name,
            "target_value": habit.target_value, "unit": habit.unit}


def _get_habits(db: Session, active: bool = None, category: str = None) -> list:
    q = db.query(Habit)
    if active is not None:
        q = q.filter(Habit.active == active)
    if category:
        q = q.filter(Habit.category.ilike(f"%{category}%"))
    habits = q.all()
    return [{"id": h.id, "name": h.name, "target_value": h.target_value,
             "unit": h.unit, "category": h.category, "difficulty": h.difficulty,
             "active": h.active, "frequency": h.frequency} for h in habits]


def _get_habit(db: Session, habit_id: int = None, name: str = None) -> dict:
    habit = _resolve_habit(db, habit_id=habit_id, name=name)
    if not habit:
        return {"error": "Habit not found"}
    return {"id": habit.id, "name": habit.name, "target_value": habit.target_value,
            "unit": habit.unit, "category": habit.category, "difficulty": habit.difficulty,
            "active": habit.active, "frequency": habit.frequency, "description": habit.description}


def _update_habit(db: Session, habit_id: int, **kwargs) -> dict:
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        return {"error": "Habit not found"}
    for k, v in kwargs.items():
        if v is not None and hasattr(habit, k):
            setattr(habit, k, v)
    db.commit()
    return {"success": True, "habit_id": habit.id, "name": habit.name}


def _delete_habit(db: Session, habit_id: int) -> dict:
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        return {"error": "Habit not found"}
    db.delete(habit)
    db.commit()
    return {"success": True, "deleted": habit.name}


def _log_progress(db: Session, actual_value: float, habit_id: int = None,
                  habit_name: str = None, date: str = None, notes: str = None) -> dict:
    habit = _resolve_habit(db, habit_id=habit_id, habit_name=habit_name)
    if not habit:
        return {"error": "Habit not found. Please specify habit_id or habit_name."}

    from datetime import date as date_type
    log_date = date_type.today()
    if date:
        try:
            log_date = date_type.fromisoformat(date)
        except ValueError:
            pass

    existing = db.query(HabitLog).filter(
        HabitLog.habit_id == habit.id, HabitLog.date == log_date
    ).first()

    completed = actual_value >= habit.target_value

    if existing:
        existing.actual_value = actual_value
        existing.completed = completed
        if notes:
            existing.notes = notes
        db.commit()
        return {"success": True, "updated": True, "habit_name": habit.name,
                "actual_value": actual_value, "target_value": habit.target_value,
                "completed": completed, "date": str(log_date)}

    log = HabitLog(habit_id=habit.id, date=log_date, actual_value=actual_value,
                   completed=completed, notes=notes)
    db.add(log)
    db.commit()
    return {"success": True, "habit_name": habit.name, "actual_value": actual_value,
            "target_value": habit.target_value, "completed": completed, "date": str(log_date)}


def _get_today_goals(db: Session) -> list:
    habits = db.query(Habit).filter(Habit.active == True).all()
    today = date.today()
    result = []
    for habit in habits:
        log = db.query(HabitLog).filter(
            HabitLog.habit_id == habit.id, HabitLog.date == today
        ).first()
        streak_data = streaks.calculate_streak(db, habit.id)
        result.append({
            "habit_id": habit.id,
            "name": habit.name,
            "target": habit.target_value,
            "unit": habit.unit,
            "actual": log.actual_value if log else 0,
            "completed": log.completed if log else False,
            "streak": streak_data["current_streak"],
        })
    return result


def _get_habit_history(db: Session, habit_id: int = None, habit_name: str = None, days: int = 7) -> list:
    habit = _resolve_habit(db, habit_id=habit_id, habit_name=habit_name)
    if not habit:
        return []
    start = date.today() - timedelta(days=days - 1)
    logs = db.query(HabitLog).filter(
        HabitLog.habit_id == habit.id, HabitLog.date >= start
    ).order_by(HabitLog.date.asc()).all()
    return [{"date": str(l.date), "actual_value": l.actual_value,
             "completed": l.completed, "notes": l.notes} for l in logs]


def _calculate_streak(db: Session, habit_id: int = None, habit_name: str = None) -> dict:
    habit = _resolve_habit(db, habit_id=habit_id, habit_name=habit_name)
    if not habit:
        return {"error": "Habit not found"}
    return streaks.calculate_streak(db, habit.id)


def _analyze_progress(db: Session, habit_id: int = None, habit_name: str = None, days: int = 7) -> dict:
    habit = _resolve_habit(db, habit_id=habit_id, habit_name=habit_name)
    if not habit:
        return {"error": "Habit not found"}
    return analytics.analyze_progress(db, habit.id, days)


def _adapt_goal(db: Session, new_target: float, reason: str,
                habit_id: int = None, habit_name: str = None) -> dict:
    habit = _resolve_habit(db, habit_id=habit_id, habit_name=habit_name)
    if not habit:
        return {"error": "Habit not found"}

    old_target = habit.target_value
    adjustment_type = "increase" if new_target > old_target else "decrease"

    adj = GoalAdjustment(
        habit_id=habit.id, old_target=old_target,
        new_target=new_target, reason=reason, adjustment_type=adjustment_type,
    )
    db.add(adj)
    habit.target_value = new_target
    db.commit()

    return {"success": True, "habit_name": habit.name, "old_target": old_target,
            "new_target": new_target, "unit": habit.unit, "reason": reason,
            "adjustment_type": adjustment_type}


def _generate_coaching_report(db: Session, days: int = 7) -> dict:
    habits = db.query(Habit).filter(Habit.active == True).all()
    if not habits:
        return {"message": "No active habits found."}

    analyses = [analytics.analyze_progress(db, h.id, days) for h in habits]
    analyses = [a for a in analyses if a]

    if not analyses:
        return {"message": "No data available."}

    strongest = max(analyses, key=lambda x: x["completion_rate"])
    weakest = min(analyses, key=lambda x: x["completion_rate"])
    best_streak_habit = max(analyses, key=lambda x: x["current_streak"])
    overall_rate = sum(a["completion_rate"] for a in analyses) / len(analyses)
    struggling = [a for a in analyses if a["completion_rate"] < 50]

    return {
        "overall_completion_rate": round(overall_rate, 1),
        "strongest_habit": strongest["habit_name"],
        "weakest_habit": weakest["habit_name"],
        "best_streak": best_streak_habit["current_streak"],
        "best_streak_habit": best_streak_habit["habit_name"],
        "struggling_habits": [s["habit_name"] for s in struggling],
        "days_analyzed": days,
    }


# ── Deterministic Fallback ─────────────────────────────────────────────────────

def _fallback_parse(message: str) -> tuple[str, dict] | tuple[None, None]:
    msg = message.lower()

    # Create habit
    m = re.search(r"(?:practice|do|start|track|add|create)\s+([\w\s]+?)\s+for\s+(\d+)\s+(minutes?|hours?|pages?|times?|reps?)", msg)
    if m or "want to" in msg and any(w in msg for w in ["minutes", "hours", "pages"]):
        if m:
            name_raw = m.group(1).strip()
            val = float(m.group(2))
            unit = m.group(3).rstrip("s") + ("s" if not m.group(3).endswith("s") else "")
        else:
            nums = re.findall(r"(\d+)\s*(minutes?|hours?|pages?)", msg)
            if not nums:
                return None, None
            val, unit = float(nums[0][0]), nums[0][1]
            name_raw = "New Habit"
        category_map = {"dsa": "Learning", "cod": "Learning", "read": "Reading",
                        "exercise": "Fitness", "run": "Fitness", "meditat": "Mindfulness",
                        "english": "Personal", "yoga": "Fitness"}
        category = next((v for k, v in category_map.items() if k in name_raw.lower()), "Other")
        return "create_habit", {"name": name_raw.title(), "target_value": val, "unit": unit, "category": category}

    # Log progress
    m = re.search(r"(?:practiced?|did|completed?|exercised?|ran|read|meditated?)\s+(?:[\w\s]+?)\s+for\s+(\d+)\s+(minutes?|hours?|pages?)", msg)
    if m:
        val = float(m.group(1))
        # Try to find habit name
        habit_name = None
        for kw in ["dsa", "exercise", "reading", "meditation", "english"]:
            if kw in msg:
                habit_name = kw
                break
        return "log_progress", {"actual_value": val, "habit_name": habit_name}

    # Streak
    if "streak" in msg:
        for kw in ["dsa", "exercise", "reading", "meditation", "english"]:
            if kw in msg:
                return "calculate_streak", {"habit_name": kw}
        return "calculate_streak", {}

    # Analysis
    if any(w in msg for w in ["how am i doing", "consistent", "analysis", "analyze", "performance"]):
        for kw in ["dsa", "exercise", "reading", "meditation", "english"]:
            if kw in msg:
                return "analyze_progress", {"habit_name": kw}
        return "generate_coaching_report", {}

    # Today / daily plan
    if any(w in msg for w in ["today", "focus", "daily plan", "what should i"]):
        return "suggest_daily_goals", {}

    # Get habits
    if any(w in msg for w in ["my habits", "list habits", "show habits", "all habits"]):
        return "get_habits", {"active": True}

    # Adapt goal
    if any(w in msg for w in ["reduce", "lower", "decrease", "adjust", "change", "increase"]) and \
       any(w in msg for w in ["target", "goal", "minutes", "pages"]):
        return "analyze_progress", {}

    return None, None


# ── Main Agent ─────────────────────────────────────────────────────────────────

def run_agent(message: str, history: list, db: Session) -> dict:
    tool_calls_log = []
    tool_results = {}

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for h in history[-6:]:  # Keep last 6 turns for context
        messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": message})

    # Try Groq with tool calling
    groq_result = llm_provider.chat_with_tools(messages, TOOL_DEFINITIONS)

    if groq_result["success"]:
        response_obj = groq_result["response"]
        msg = response_obj.choices[0].message

        # Execute tool calls from LLM
        if msg.tool_calls:
            tool_messages = list(messages)
            tool_messages.append({"role": "assistant", "content": msg.content or "", "tool_calls": [
                {"id": tc.id, "type": "function",
                 "function": {"name": tc.function.name, "arguments": tc.function.arguments}}
                for tc in msg.tool_calls
            ]})

            for tc in msg.tool_calls:
                tool_name = tc.function.name
                try:
                    args = json.loads(tc.function.arguments)
                except Exception:
                    args = {}

                result = execute_tool(tool_name, args, db)
                tool_calls_log.append({"tool": tool_name, "status": "success" if "error" not in result else "error", "result": result})
                tool_results[tool_name] = result

                tool_messages.append({
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": json.dumps(result),
                })

            # Get final response
            final = llm_provider.chat_simple(tool_messages)
            response_text = final.get("content", "I've processed your request.") if final["success"] else _fallback_response(tool_calls_log, tool_results)
        else:
            response_text = msg.content or "I'm here to help with your habits."

    else:
        # Deterministic fallback
        tool_name, args = _fallback_parse(message)
        if tool_name:
            result = execute_tool(tool_name, args or {}, db)
            tool_calls_log.append({"tool": tool_name, "status": "success", "result": result})
            tool_results[tool_name] = result
            response_text = _fallback_response(tool_calls_log, tool_results)
        else:
            response_text = "I'm your HabitForge coach. Try asking about your habits, logging progress, or checking your streaks."

    # Proactive insights
    insights = []
    try:
        raw_insights = coaching.generate_insights(db)
        insights = [i["message"] for i in raw_insights[:3]]
    except Exception:
        pass

    return {
        "response": response_text,
        "tool_calls": tool_calls_log,
        "insights": insights,
        "success": True,
    }


def _fallback_response(tool_calls: list, results: dict) -> str:
    parts = []
    for tc in tool_calls:
        name = tc["tool"]
        result = tc["result"]
        if name == "create_habit" and "habit_id" in result:
            parts.append(f"✅ Created habit **{result['name']}** — target: {result['target_value']} {result['unit']} daily.")
        elif name == "log_progress" and result.get("success"):
            status = "✅ Completed!" if result["completed"] else f"📝 Logged ({result['actual_value']}/{result['target_value']} {result.get('unit','')})"
            parts.append(f"{status} Progress recorded for **{result['habit_name']}**.")
        elif name == "calculate_streak":
            parts.append(f"🔥 **{result.get('habit_name','Habit')}** streak: {result.get('current_streak',0)} days current, {result.get('best_streak',0)} days best.")
        elif name == "analyze_progress":
            parts.append(
                f"📊 **{result.get('habit_name','Habit')}** ({result.get('days_analyzed',7)} days): "
                f"Completion {result.get('completion_rate',0)}%, avg {result.get('average_actual',0)} {result.get('unit','')}, "
                f"streak {result.get('current_streak',0)} days, trend: {result.get('trend','unknown')}."
            )
        elif name == "suggest_daily_goals" and isinstance(result, list):
            lines = ["**Today's Recommended Goals:**"]
            for g in result[:5]:
                lines.append(f"• {g['habit_name']}: {g['suggested_target']} {g['unit']} ({g['priority']} priority) — {g['reason']}")
            parts.append("\n".join(lines))
        elif name == "get_habits" and isinstance(result, list):
            lines = [f"**Your Habits ({len(result)}):**"]
            for h in result:
                lines.append(f"• {h['name']}: {h['target_value']} {h['unit']} {h['frequency']}")
            parts.append("\n".join(lines))
        elif name == "adapt_goal" and result.get("success"):
            parts.append(f"✅ Updated **{result['habit_name']}** target: {result['old_target']} → {result['new_target']} {result['unit']}.")
        elif name == "generate_coaching_report":
            parts.append(
                f"📋 **Weekly Report**: Overall completion {result.get('overall_completion_rate',0)}%. "
                f"Strongest: {result.get('strongest_habit','N/A')}. "
                f"Needs attention: {result.get('weakest_habit','N/A')}."
            )
    return "\n\n".join(parts) if parts else "Done! Let me know if you need anything else."
