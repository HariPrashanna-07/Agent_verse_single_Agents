"""
Full end-to-end agent test - runs complete ReAct loop with DB.
Run after rate limit resets: python _test_e2e.py
"""
import sys, os, json
sys.path.insert(0, '.')
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from dotenv import load_dotenv
load_dotenv(override=True)

import logging
logging.basicConfig(level=logging.INFO, format='%(message)s')

from app.database.connection import SessionLocal, init_db
init_db()

from app.agent.agent import run_agent

db = SessionLocal()

tests = [
    ("A", "Which habit am I struggling with?"),
    ("B", "I completed Reading today."),
    ("C", "I completed reading today."),
    ("D", "I completed a habit called ZZZ999 today."),
]

print("=" * 60)
print("END-TO-END AGENT TESTS")
print("=" * 60)

for label, message in tests:
    print(f"\n--- TEST {label}: \"{message}\" ---")
    try:
        result = run_agent(message, [], db)
        print(f"  SUCCESS: {result['success']}")
        print(f"  Tool calls: {[t['tool'] for t in result.get('tool_calls', [])]}")
        print(f"  Tool statuses: {[t['status'] for t in result.get('tool_calls', [])]}")
        if result.get('tool_calls'):
            for tc in result['tool_calls']:
                print(f"  Tool result ({tc['tool']}): {json.dumps(tc['result'])[:200]}")
        print(f"  Response: {result.get('response', '')[:300]}")
    except Exception as e:
        print(f"  ERROR: {e}")

db.close()
print("\n" + "=" * 60)
print("E2E tests complete")
