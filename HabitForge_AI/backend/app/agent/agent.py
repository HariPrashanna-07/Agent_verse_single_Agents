import json
import logging
from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.database.models import Habit, HabitLog, GoalAdjustment
from app.services import analytics, streaks, adaptive_goals, daily_goals, coaching, llm_provider
from app.agent.prompts import SYSTEM_PROMPT
from app.agent.tools import TOOL_DEFINITIONS

logger = logging.getLogger(__name__)

MAX_TOOL_ITERATIONS = 5


# ── Tool Executor ──────────────────────────────────────────────────────────────

def execute_tool(tool_name: str, args: dict, db: Session) -> dict:
    if not isinstance(args, dict):
        args = {}
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
        logger.exception(f"Tool {tool_name} execution failed")
        return {"error": str(e)}


def _resolve_habit(db: Session, habit_id=None, habit_name=None, name=None):
    search_name = habit_name or name
    if habit_id:
        return db.query(Habit).filter(Habit.id == habit_id).first()
    if search_name:
        search_name_lower = search_name.strip().lower()
        all_habits = db.query(Habit).all()
        
        # 1. Exact match
        for h in all_habits:
            if h.name.strip().lower() == search_name_lower:
                return h
                
        # 2. Substring match (bi-directional check)
        matches = []
        for h in all_habits:
            h_name_lower = h.name.strip().lower()
            if search_name_lower in h_name_lower or h_name_lower in search_name_lower:
                matches.append(h)
                
        if len(matches) == 1:
            return matches[0]
        elif len(matches) > 1:
            # Sort by length difference to find the closest match
            matches.sort(key=lambda h: abs(len(h.name) - len(search_name)))
            return matches[0]
            
    return None


def _create_habit(db: Session, name: str = None, target_value: float = None, unit: str = None,
                  frequency: str = "daily", category: str = "Other",
                  description: str = None, difficulty: str = "medium") -> dict:
    if not name or target_value is None or not unit:
        return {"error": "Missing required fields: name, target_value, unit"}
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


def _get_habit(db: Session, habit_id: int = None, name: str = None, habit_name: str = None) -> dict:
    habit = _resolve_habit(db, habit_id=habit_id, habit_name=habit_name or name)
    if not habit:
        return {"error": "Habit not found"}
    return {"id": habit.id, "name": habit.name, "target_value": habit.target_value,
            "unit": habit.unit, "category": habit.category, "difficulty": habit.difficulty,
            "active": habit.active, "frequency": habit.frequency, "description": habit.description}


def _update_habit(db: Session, habit_id: int = None, **kwargs) -> dict:
    if habit_id is None:
        return {"error": "Missing required field: habit_id"}
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        return {"error": "Habit not found"}
    for k, v in kwargs.items():
        if v is not None and hasattr(habit, k):
            setattr(habit, k, v)
    db.commit()
    return {"success": True, "habit_id": habit.id, "name": habit.name}


def _delete_habit(db: Session, habit_id: int = None) -> dict:
    if habit_id is None:
        return {"error": "Missing required field: habit_id"}
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        return {"error": "Habit not found"}
    db.delete(habit)
    db.commit()
    return {"success": True, "deleted": habit.name}


def _log_progress(db: Session, actual_value: float = None, habit_id: int = None,
                  habit_name: str = None, name: str = None, date: str = None, notes: str = None) -> dict:
    habit = _resolve_habit(db, habit_id=habit_id, habit_name=habit_name or name)
    if not habit:
        active_habits = [h.name for h in db.query(Habit).filter(Habit.active == True).all()]
        return {
            "success": False,
            "error": "habit_not_found",
            "requested_habit": habit_name or name or "",
            "available_habits": active_habits
        }

    # Default to full target when user says "I completed X" without specifying amount
    if actual_value is None:
        actual_value = habit.target_value

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


def _get_habit_history(db: Session, habit_id: int = None, habit_name: str = None, name: str = None, days: int = 7) -> list:
    habit = _resolve_habit(db, habit_id=habit_id, habit_name=habit_name or name)
    if not habit:
        return []
    start = date.today() - timedelta(days=days - 1)
    logs = db.query(HabitLog).filter(
        HabitLog.habit_id == habit.id, HabitLog.date >= start
    ).order_by(HabitLog.date.asc()).all()
    return [{"date": str(l.date), "actual_value": l.actual_value,
             "completed": l.completed, "notes": l.notes} for l in logs]


def _calculate_streak(db: Session, habit_id: int = None, habit_name: str = None, name: str = None) -> dict:
    resolved_name = habit_name or name
    # If no specific habit requested, find the best streak across all habits
    if not habit_id and not resolved_name:
        habits = db.query(Habit).filter(Habit.active == True).all()
        if not habits:
            return {"error": "No active habits found"}
        best = max(habits, key=lambda h: streaks.calculate_streak(db, h.id)["current_streak"])
        result = streaks.calculate_streak(db, best.id)
        result["habit_name"] = best.name
        return result
    habit = _resolve_habit(db, habit_id=habit_id, habit_name=resolved_name)
    if not habit:
        return {"error": "Habit not found"}
    result = streaks.calculate_streak(db, habit.id)
    result["habit_name"] = habit.name
    return result


def _analyze_progress(db: Session, habit_id: int = None, habit_name: str = None, name: str = None, days: int = 7) -> dict:
    try:
        days = int(days)
    except (ValueError, TypeError):
        days = 7

    resolved_name = habit_name or name
    if not habit_id and not resolved_name:
        habits = db.query(Habit).filter(Habit.active == True).all()
        if not habits:
            return {
                "period_days": days,
                "habits": [],
                "weakest_habits": [],
                "struggling_habits": [],
                "error": "No active habits found"
            }
        
        habit_results = []
        struggling = []
        
        for h in habits:
            res = analytics.analyze_progress(db, h.id, days)
            if res:
                rate = res.get("completion_rate", 0.0)
                habit_results.append({
                    "name": h.name,
                    "completion_rate": rate,
                    "completed": res.get("completed_days", 0),
                    "expected": res.get("days_analyzed", days)
                })
                if rate < 50:
                    struggling.append(h.name)
        
        weakest_habits = []
        if habit_results:
            min_rate = min(h["completion_rate"] for h in habit_results)
            weakest_habits = [h["name"] for h in habit_results if h["completion_rate"] == min_rate]
            
        return {
            "period_days": days,
            "habits": habit_results,
            "weakest_habits": weakest_habits,
            "struggling_habits": struggling
        }

    habit = _resolve_habit(db, habit_id=habit_id, habit_name=resolved_name)
    if not habit:
        return {"error": f"Habit '{resolved_name or habit_id}' not found"}
    return analytics.analyze_progress(db, habit.id, days)


def _adapt_goal(db: Session, new_target: float = None, reason: str = None,
                 habit_id: int = None, habit_name: str = None, name: str = None) -> dict:
    if new_target is None or not reason:
        return {"error": "Missing required fields: new_target, reason"}
    habit = _resolve_habit(db, habit_id=habit_id, habit_name=habit_name or name)
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
        "all_habits": [
            {"name": a["habit_name"], "completion_rate": a["completion_rate"],
             "current_streak": a["current_streak"], "trend": a["trend"]}
            for a in analyses
        ],
    }


# ── ReAct Loop ─────────────────────────────────────────────────────────────────

def run_agent(message: str, history: list, db: Session) -> dict:
    tool_calls_log = []

    # Build message list: system prompt + last 8 history turns + current message
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for h in history[-8:]:
        messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": message})

    logger.info(f"[HabitForge] User message: {message[:80]}")
    logger.info(f"[HabitForge] History messages: {len(history)}")
    logger.info(f"[HabitForge] Calling Groq...")

    response_text = None

    # ReAct loop: Groq reasons → may call tools → reasons again → final answer
    for iteration in range(MAX_TOOL_ITERATIONS):
        groq_result = llm_provider.chat_with_tools(messages, TOOL_DEFINITIONS)

        if not groq_result["success"]:
            logger.error(f"[HabitForge] Groq failed: {groq_result.get('error')}")
            logger.error(f"[HabitForge] Activating deterministic fallback")
            response_text = _deterministic_fallback(message, db)
            break

        resp_msg = groq_result["response"].choices[0].message
        tool_count = len(resp_msg.tool_calls or [])
        logger.info(f"[HabitForge] Groq success: YES")
        logger.info(f"[HabitForge] Groq content received: {'YES' if resp_msg.content else 'NO'}")
        logger.info(f"[HabitForge] Tool calls: {tool_count}")

        # No tool calls → Groq produced a direct conversational answer — return it as-is
        if not resp_msg.tool_calls:
            response_text = resp_msg.content or "I'm here to help with your habits."
            logger.info(f"[HabitForge] Final Groq response received (no tools path)")
            logger.info(f"[HabitForge] Returning conversational Groq response (no tools)")
            break

        # Groq wants to call tools — append assistant turn with tool_calls
        messages.append({
            "role": "assistant",
            "content": resp_msg.content or "",
            "tool_calls": [
                {"id": tc.id, "type": "function",
                 "function": {"name": tc.function.name, "arguments": tc.function.arguments}}
                for tc in resp_msg.tool_calls
            ],
        })

        # Execute every tool call in this iteration
        for tc in resp_msg.tool_calls:
            tool_name = tc.function.name
            args = {}
            if tc.function.arguments:
                try:
                    parsed = json.loads(tc.function.arguments)
                    if isinstance(parsed, dict):
                        args = parsed
                except Exception:
                    logger.warning(f"Failed to parse tool arguments: {tc.function.arguments}")

            logger.info(f"[HabitForge] Tool: {tool_name}")
            logger.info(f"[HabitForge] Tool args: {json.dumps(args)}")
            result = execute_tool(tool_name, args, db)
            status = "error" if "error" in result else "success"
            tool_calls_log.append({"tool": tool_name, "status": status, "result": result})
            logger.info(f"[HabitForge] Tool result ({tool_name}): {json.dumps(result)}")

            messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "name": tool_name,
                "content": json.dumps(result),
            })

        logger.info(f"[HabitForge] Sending tool result back to Groq")
        # Loop continues — Groq sees tool results and either calls more tools or gives final answer

    # Loop exhausted without a final answer — ask Groq one more time without tools
    if response_text is None:
        logger.info(f"[HabitForge] Max iterations reached — requesting final answer from Groq")
        final = llm_provider.chat_simple(messages)
        if final["success"]:
            response_text = final["content"] or "I've processed your request."
        else:
            logger.error(f"[HabitForge] Final Groq call failed: {final.get('error')}")
            response_text = _fallback_from_tool_results(tool_calls_log)

    # Proactive insights — deduplicated
    insights = []
    try:
        raw_insights = coaching.generate_insights(db)
        insights = [i["message"] for i in _deduplicate_insights(raw_insights)[:3]]
    except Exception:
        pass

    # Defensive regex cleaner to prevent any raw function-call XML syntax leakage from reaching the UI
    import re
    if response_text:
        original_response = response_text
        response_text = re.sub(r'<function=[^>]+>.*?</function>', '', response_text, flags=re.DOTALL)
        response_text = re.sub(r'<function=[^>]+>', '', response_text)
        response_text = re.sub(r'</function>', '', response_text)
        response_text = response_text.strip()
        if response_text != original_response.strip():
            logger.warning(f"[HabitForge] Cleaned raw function call leakage from response: {original_response}")

    return {
        "response": response_text,
        "tool_calls": tool_calls_log,
        "insights": insights,
        "success": True,
    }


# ── Insight Deduplication ──────────────────────────────────────────────────────

def _deduplicate_insights(insights: list) -> list:
    """STRUGGLING (< 40%) subsumes GOAL_TOO_DIFFICULT (< 50%) — same root problem."""
    seen = {}
    result = []
    dominated_by = {"STRUGGLING": {"GOAL_TOO_DIFFICULT"}}

    for insight in insights:
        habit_id = insight.get("habit_id")
        itype = insight.get("type")
        if habit_id not in seen:
            seen[habit_id] = set()
        if itype in seen[habit_id]:
            continue
        result.append(insight)
        seen[habit_id].add(itype)
        for dominated in dominated_by.get(itype, set()):
            seen[habit_id].add(dominated)

    return result


# ── Deterministic Fallback (Groq unavailable only) ────────────────────────────

def _deterministic_fallback(message: str, db: Session) -> str:
    """Used ONLY when Groq API call fails. Handles the most common intents without LLM."""
    msg = message.lower()

    if any(w in msg for w in ["streak", "longest streak", "best streak", "consecutive"]):
        habits = db.query(Habit).filter(Habit.active == True).all()
        if habits:
            best = max(habits, key=lambda h: streaks.calculate_streak(db, h.id)["current_streak"])
            s = streaks.calculate_streak(db, best.id)
            return (f"Your longest current streak is {best.name} at {s['current_streak']} days "
                    f"(best ever: {s['best_streak']} days).")

    if any(w in msg for w in ["how am i doing", "this week", "performance", "weekly", "overall"]):
        result = _generate_coaching_report(db)
        if "overall_completion_rate" in result:
            return (f"This week: {result['overall_completion_rate']}% overall completion. "
                    f"Strongest: {result['strongest_habit']}. "
                    f"Needs attention: {result['weakest_habit']}. "
                    f"Best streak: {result['best_streak']} days ({result['best_streak_habit']}).")

    if any(w in msg for w in ["struggling", "struggle", "weak", "worst", "lowest", "improve", "doing worst", "doing worst at", "doing the worst"]):
        habits = db.query(Habit).filter(Habit.active == True).all()
        if not habits:
            return "You don't have any active habits configured."
        
        analyses = []
        for h in habits:
            res = analytics.analyze_progress(db, h.id, 7)
            if res:
                analyses.append(res)
        
        if not analyses:
            return "I couldn't find any progress data for your habits."
        
        min_rate = min(a["completion_rate"] for a in analyses)
        weakest_analyses = [a for a in analyses if a["completion_rate"] == min_rate]
        names = [a["habit_name"] for a in weakest_analyses]
        
        better_habits = [a for a in analyses if a["completion_rate"] > min_rate]
        better_str = ""
        if better_habits:
            better_names = [a["habit_name"] for a in better_habits]
            better_str = f" {' and '.join(better_names) if len(better_names) <= 2 else ', '.join(better_names[:-1]) + ', and ' + better_names[-1]} is performing better."

        if len(names) > 1:
            names_str = " and ".join([", ".join(names[:-1]), names[-1]]) if len(names) > 2 else " and ".join(names)
            return (f"Your weakest habits over the last 7 days are {names_str}, both with {min_rate}% completion.{better_str} "
                    f"I'd focus on {names[0]} first and temporarily reduce the target if the current goal feels difficult to maintain.")
        else:
            return (f"You're struggling most with {names[0]} with {min_rate}% completion over the last 7 days.{better_str} "
                    f"I'd focus on this first and temporarily reduce the target if the current goal feels difficult to maintain.")

    if any(w in msg for w in ["schedul", "time manag", "organize", "plan my", "confusion", "confus", "daily time"]):
        habits = _get_habits(db, active=True)
        if habits:
            names = ", ".join(h["name"] for h in habits[:5])
            return (f"I can help you organize your day around your habits: {names}. "
                    f"What time window are you available today?")
        return "I can help you plan your day. What time are you available?"

    if any(w in msg for w in ["completed", "logged", "finished", "did"]):
        habits = db.query(Habit).filter(Habit.active == True).all()
        for h in habits:
            if h.name.lower() in msg:
                res = _log_progress(db, habit_name=h.name)
                if res.get("success"):
                    return f"Progress recorded for {h.name} ({res.get('actual_value')} {h.unit}). Keep it up!"

    if any(w in msg for w in ["what should i", "focus today", "daily plan", "suggest", "focus on today", "what to do today"]):
        goals = daily_goals.suggest_daily_goals(db)
        if goals:
            lines = ["Here's what I'd suggest focusing on today:"]
            for g in goals[:5]:
                lines.append(f"- {g['habit_name']}: {g['suggested_target']} {g['unit']}")
            return "\n".join(lines)

    return ("I'm having trouble connecting to the AI service right now. "
            "Try asking: 'How am I doing this week?' or 'What should I focus on today?'")


def _fallback_from_tool_results(tool_calls: list) -> str:
    """Build a plain-text response from tool results when Groq's final call also fails."""
    parts = []
    for tc in tool_calls:
        name = tc["tool"]
        result = tc["result"]
        if name == "create_habit" and "habit_id" in result:
            parts.append(f"Created habit {result['name']} — target: {result['target_value']} {result['unit']} daily.")
        elif name == "log_progress" and result.get("success"):
            icon = "Completed!" if result["completed"] else f"Logged {result['actual_value']}/{result['target_value']}"
            parts.append(f"{icon} Progress recorded for {result['habit_name']}.")
        elif name == "calculate_streak":
            parts.append(f"{result.get('habit_name', 'Habit')} streak: {result.get('current_streak', 0)} days current, {result.get('best_streak', 0)} days best.")
        elif name == "analyze_progress":
            parts.append(
                f"{result.get('habit_name', 'Habit')} ({result.get('days_analyzed', 7)} days): "
                f"Completion {result.get('completion_rate', 0)}%, streak {result.get('current_streak', 0)} days, trend: {result.get('trend', 'unknown')}."
            )
        elif name == "suggest_daily_goals" and isinstance(result, list):
            lines = ["Today's Recommended Goals:"]
            for g in result[:5]:
                lines.append(f"- {g['habit_name']}: {g['suggested_target']} {g['unit']} ({g['priority']} priority)")
            parts.append("\n".join(lines))
        elif name == "get_habits" and isinstance(result, list):
            lines = [f"Your Habits ({len(result)}):"]
            for h in result:
                lines.append(f"- {h['name']}: {h['target_value']} {h['unit']} {h['frequency']}")
            parts.append("\n".join(lines))
        elif name == "adapt_goal" and result.get("success"):
            parts.append(f"Updated {result['habit_name']} target: {result['old_target']} to {result['new_target']} {result['unit']}.")
        elif name == "generate_coaching_report":
            parts.append(
                f"Weekly Report: Overall completion {result.get('overall_completion_rate', 0)}%. "
                f"Strongest: {result.get('strongest_habit', 'N/A')}. "
                f"Needs attention: {result.get('weakest_habit', 'N/A')}."
            )
    return "\n\n".join(parts) if parts else "Done! Let me know if you need anything else."
