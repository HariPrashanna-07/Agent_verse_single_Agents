import sys, os
sys.path.insert(0, '.')
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from dotenv import load_dotenv
load_dotenv(override=True)

key = os.getenv('GROQ_API_KEY')
model = os.getenv('LLM_MODEL', 'llama-3.3-70b-versatile')

print("=" * 60)
print("[HabitForge] ENV CHECK")
print("[HabitForge] GROQ_API_KEY configured:", "YES" if key else "NO")
print("[HabitForge] LLM Model:", model)
if key:
    print("[HabitForge] Key prefix:", key[:8] + "...")
print("=" * 60)

if not key or key == 'YOUR_KEY_HERE':
    print("ERROR: Real GROQ_API_KEY not set.")
    sys.exit(1)

from groq import Groq
try:
    client = Groq(api_key=key)
    resp = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": "Say OK"}],
        max_tokens=10,
    )
    print("\n[HabitForge] Groq connection: SUCCESS")
    print("[HabitForge] Response:", resp.choices[0].message.content)
except Exception as e:
    print("\n[HabitForge] Groq connection: FAILED --", e)
    sys.exit(1)

print("\n" + "=" * 60)
print("[HabitForge] AGENT TESTS (Groq reasoning only, no DB)")
print("=" * 60)

from app.agent.prompts import SYSTEM_PROMPT
from app.agent.tools import TOOL_DEFINITIONS

tests = [
    ("A", "how can i improve my time management", []),
    ("B", "i have a doubt from this website", [
        {"role": "user", "content": "how can i improve my time management"},
        {"role": "assistant", "content": "I can help you schedule your day around your habits. What time window are you available?"}
    ]),
    ("C", "Can you explain what today's goals means?", []),
    ("D", "I feel unmotivated today", []),
    ("E", "How am I doing this week?", []),
    ("F", "What's my longest streak?", []),
    ("G", "I completed reading today", []),
    ("H2", "I'm free between 6 PM and 10 PM", [
        {"role": "user", "content": "I'm struggling to manage my habits."},
        {"role": "assistant", "content": "I understand. Let's work on a plan. What time are you free today?"}
    ]),
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
        print(f"\nTEST {label}: \"{message[:60]}\"")
        print(f"  History turns: {len(history)}")
        print(f"  Tool calls: {len(tool_calls)}")
        if tool_calls:
            for tc in tool_calls:
                print(f"  Tool selected: {tc.function.name} args={tc.function.arguments[:80]}")
            print(f"  Engine: Groq + Tool")
        else:
            content = (msg.content or "")[:250].replace('\n', ' ')
            print(f"  Direct response: {content}")
            print(f"  Engine: Groq (conversational, no tool)")
    except Exception as e:
        print(f"\nTEST {label}: ERROR -- {str(e)[:200]}")

print("\n" + "=" * 60)
print("[HabitForge] Tests complete")
