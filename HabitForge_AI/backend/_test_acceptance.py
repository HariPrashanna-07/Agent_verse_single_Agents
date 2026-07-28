"""
Focused end-to-end tests for the two acceptance criteria.
Run after rate limit resets: python _test_acceptance.py
"""
import sys, os
sys.path.insert(0, '.')
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from dotenv import load_dotenv
load_dotenv(override=True)

key = os.getenv('GROQ_API_KEY')
model = os.getenv('LLM_MODEL', 'llama-3.3-70b-versatile')

print("=" * 60)
print("[HabitForge] ACCEPTANCE TESTS")
print("[HabitForge] GROQ_API_KEY configured:", "YES" if key else "NO")
print("[HabitForge] Model:", model)
print("=" * 60)

if not key or key == 'YOUR_KEY_HERE':
    print("ERROR: Real GROQ_API_KEY not set.")
    sys.exit(1)

from groq import Groq
from app.agent.prompts import SYSTEM_PROMPT
from app.agent.tools import TOOL_DEFINITIONS

client = Groq(api_key=key)

tests = [
    ("A - struggling habits", "Which habit am I struggling with?", []),
    ("B - log Reading (exact)", "I completed Reading today.", []),
    ("C - log reading (lowercase)", "I completed reading today.", []),
    ("D - log READing (mixed case)", "I completed READing today.", []),
    ("E - nonexistent habit", "I completed a habit called ZZZ999 today.", []),
]

for label, message, history in tests:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for h in history:
        messages.append(h)
    messages.append({"role": "user", "content": message})

    try:
        resp = client.chat.completions.create(
            model=model,
            messages=messages,
            tools=TOOL_DEFINITIONS,
            tool_choice="auto",
            max_tokens=300,
        )
        msg = resp.choices[0].message
        tool_calls = msg.tool_calls or []
        print(f"\nTEST {label}")
        print(f"  Message: \"{message}\"")
        print(f"  Tool calls: {len(tool_calls)}")
        if tool_calls:
            for tc in tool_calls:
                print(f"  Tool selected: {tc.function.name}")
                print(f"  Tool args: {tc.function.arguments}")
        else:
            content = (msg.content or "")[:300].replace('\n', ' ')
            print(f"  Direct response: {content}")
    except Exception as e:
        print(f"\nTEST {label}: ERROR -- {str(e)[:300]}")

print("\n" + "=" * 60)
print("[HabitForge] Acceptance tests complete")
