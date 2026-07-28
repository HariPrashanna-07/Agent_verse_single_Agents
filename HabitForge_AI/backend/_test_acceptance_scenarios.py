import os
import sys
import json
import time
sys.path.insert(0, '.')
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from dotenv import load_dotenv
load_dotenv(override=True)

import logging
logging.basicConfig(level=logging.INFO, format='%(message)s')

from app.database.connection import SessionLocal, init_db
from app.database.models import Habit
from app.agent.agent import run_agent

# Initialize test database
init_db()
db = SessionLocal()

print("=" * 70)
print("RUNNING ALL 8 ACCEPTANCE TESTS (WITH RATE-LIMIT DELAY)")
print("=" * 70)

# Check database state before Test 1
tm_before = db.query(Habit).filter(Habit.name.ilike("%Time Management%")).first()
print(f"Time Management habit exists BEFORE tests: {'YES' if tm_before else 'NO'}")

scenarios = [
    (1, "I am weak in time management so how can I improve this problem", 0, "conversational advice on time management"),
    (2, "How can I improve my time management?", 0, "conversational coaching"),
    (3, "Which habit am I struggling with?", 1, "analyze_progress"),
    (4, "What's my longest streak?", 1, "calculate_streak"),
    (5, "I completed Reading today.", 1, "log_progress"),
    (6, "Create a 30-minute daily Reading habit.", 1, "create_habit"),
    (7, "I feel unmotivated today.", 0, "conversational coaching"),
    (8, "How can I balance exercise and studying?", 0, "conversational coaching")
]

results = []

for num, query, expected_tools, description in scenarios:
    print(f"\n--- TEST {num}: \"{query}\" (Expected Tools: {expected_tools}) ---")
    try:
        # Run agent on query
        test_db = SessionLocal()
        result = run_agent(query, [], test_db)
        test_db.close()
        
        success = result.get("success", False)
        tool_calls = result.get("tool_calls", [])
        tool_names = [t["tool"] for t in tool_calls]
        response = result.get("response", "")
        
        # Verify tool counts
        tool_match = len(tool_calls) == expected_tools
        if expected_tools == 1 and len(tool_calls) > 0:
            tool_match = True  # At least one tool call is fine
            
        # Check raw function call leakages
        leak_detected = "<function" in response or "</function>" in response
        
        print(f"  SUCCESS: {success}")
        print(f"  Tools Selected: {tool_names} (Count: {len(tool_calls)})")
        print(f"  Expected Tools match: {tool_match}")
        print(f"  Raw syntax leak detected: {leak_detected}")
        print(f"  Response: {response[:300]}")
        
        passed = success and tool_match and not leak_detected
        results.append(passed)
        
    except Exception as e:
        print(f"  ERROR: {e}")
        results.append(False)
        
    # Wait to avoid TPM rate limit on free tier Groq
    if num < len(scenarios):
        print("  Waiting 15 seconds to prevent rate-limit (TPM)...")
        time.sleep(15)

# Check database state after Test 1
tm_after = db.query(Habit).filter(Habit.name.ilike("%Time Management%")).first()
print("\n" + "=" * 70)
print(f"Time Management habit exists AFTER tests: {'YES' if tm_after else 'NO'}")
db.close()

passed_count = sum(results)
total_count = len(results)
print(f"Acceptance Scenarios Passed: {passed_count}/{total_count}")
if passed_count == total_count and not tm_after:
    print("ALL SCENARIOS AND SIDE-EFFECT TESTS PASSED SUCCESSFULLY!")
else:
    print("SOME TEST SCENARIOS FAILED.")
    sys.exit(1)
