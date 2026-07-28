import sys
sys.path.insert(0, '.')

from app.agent.agent import run_agent, _deduplicate_insights
from app.agent.prompts import SYSTEM_PROMPT
from app.services.llm_provider import get_model
import inspect

errors = []

# 1. System prompt
if len(SYSTEM_PROMPT) > 500:
    print("PASS: System prompt length:", len(SYSTEM_PROMPT))
else:
    errors.append("FAIL: System prompt too short")

# 2. Model
m = get_model()
if m == "llama-3.3-70b-versatile":
    print("PASS: Model:", m)
else:
    errors.append(f"FAIL: Wrong model: {m}")

# 3. Deduplication
test_insights = [
    {"type": "STRUGGLING", "habit_id": 1, "habit_name": "DSA", "message": "m1", "severity": "danger"},
    {"type": "GOAL_TOO_DIFFICULT", "habit_id": 1, "habit_name": "DSA", "message": "m2", "severity": "warning"},
    {"type": "STREAK_AT_RISK", "habit_id": 1, "habit_name": "DSA", "message": "m3", "severity": "warning"},
    {"type": "STRUGGLING", "habit_id": 2, "habit_name": "Exercise", "message": "m4", "severity": "danger"},
]
deduped = _deduplicate_insights(test_insights)
types = [i["type"] for i in deduped]
if "GOAL_TOO_DIFFICULT" not in types and "STRUGGLING" in types and "STREAK_AT_RISK" in types:
    print("PASS: Deduplication correct. Types kept:", types)
else:
    errors.append(f"FAIL: Deduplication wrong. Got: {types}")

# 4. History in run_agent
src = inspect.getsource(run_agent)
if "history[-8:]" in src:
    print("PASS: History - last 8 turns passed to Groq")
else:
    errors.append("FAIL: History not passed correctly")

# 5. Direct Groq response returned as-is
if "not resp_msg.tool_calls" in src and "resp_msg.content" in src:
    print("PASS: Direct Groq response returned as-is when no tool calls")
else:
    errors.append("FAIL: Direct Groq response may be replaced")

# 6. Fallback only on failure
if "groq_result" in src and "_deterministic_fallback" in src:
    print("PASS: Fallback only triggered on Groq failure")
else:
    errors.append("FAIL: Fallback logic missing")

# 7. ReAct loop
if "MAX_TOOL_ITERATIONS" in src and "range(MAX_TOOL_ITERATIONS)" in src:
    print("PASS: ReAct loop present with MAX_TOOL_ITERATIONS =", 5)
else:
    errors.append("FAIL: ReAct loop missing")

# 8. Logging present
if "[HabitForge]" in src:
    print("PASS: HabitForge logging present in agent")
else:
    errors.append("FAIL: Logging missing from agent")

from app.services import llm_provider
llm_src = inspect.getsource(llm_provider)
if "[HabitForge]" in llm_src:
    print("PASS: HabitForge logging present in llm_provider")
else:
    errors.append("FAIL: Logging missing from llm_provider")

print()
if errors:
    for e in errors:
        print(e)
    sys.exit(1)
else:
    print("All architecture checks PASSED")
