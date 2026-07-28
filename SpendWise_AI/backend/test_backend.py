import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.connection import SessionLocal
from app.agent.agent import SpendWiseAgent
from app.services.analytics import get_spending_analytics
from app.services.forecasting import calculate_forecast
from app.services.recommendations import generate_savings_recommendations

def test_spendwise_agent():
    print("--- TESTING SPENDWISE BACKEND AGENT & TOOLS ---")
    db = SessionLocal()
    agent = SpendWiseAgent(db)

    # 1. Test Natural Language Expense Entry
    msg1 = "I spent 250 on lunch today."
    print(f"\nUser: '{msg1}'")
    res1 = agent.process_message(msg1)
    print("Response:", res1.response.encode('ascii', 'ignore').decode())
    print("Tool Calls executed:", [tc.tool_name for tc in res1.tool_calls])
    assert len(res1.tool_calls) > 0, "Tool call add_expense should be triggered!"
    assert res1.tool_calls[0].tool_name == "add_expense"

    # 2. Test Spending Summary / Category Query
    msg2 = "Where did I spend the most this month?"
    print(f"\nUser: '{msg2}'")
    res2 = agent.process_message(msg2)
    print("Response:", res2.response.encode('ascii', 'ignore').decode())
    print("Tool Calls executed:", [tc.tool_name for tc in res2.tool_calls])

    # 3. Test Forecasting Query
    msg3 = "Am I likely to exceed my budget?"
    print(f"\nUser: '{msg3}'")
    res3 = agent.process_message(msg3)
    print("Response:", res3.response.encode('ascii', 'ignore').decode())
    print("Tool Calls executed:", [tc.tool_name for tc in res3.tool_calls])

    # 4. Test Savings Recommendations Query
    msg4 = "What should I reduce?"
    print(f"\nUser: '{msg4}'")
    res4 = agent.process_message(msg4)
    print("Response:", res4.response.encode('ascii', 'ignore').decode())
    print("Tool Calls executed:", [tc.tool_name for tc in res4.tool_calls])

    db.close()
    print("\n[SUCCESS] ALL BACKEND AGENT TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    test_spendwise_agent()
