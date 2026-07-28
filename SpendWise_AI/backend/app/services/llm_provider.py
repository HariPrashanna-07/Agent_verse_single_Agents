import os
import json
import logging
import re
from typing import List, Dict, Any

from dotenv import load_dotenv
from groq import Groq


# Load environment variables from .env
load_dotenv()

logger = logging.getLogger("spendwise.llm")


# ============================================================
# GROQ CLIENT
# ============================================================

def get_llm_client():
    """
    Create and return the Groq client.

    SpendWise uses Groq exclusively as its LLM provider.
    """

    groq_key = os.getenv("GROQ_API_KEY")
    model = os.getenv(
        "LLM_MODEL",
        "llama-3.3-70b-versatile"
    )

    if not groq_key:
        logger.error("GROQ_API_KEY is not configured.")
        return None, None

    try:
        client = Groq(api_key=groq_key)
        return client, model

    except Exception as e:
        logger.error(f"Failed to initialize Groq client: {e}")
        return None, None


# ============================================================
# CALL GROQ WITH TOOLS
# ============================================================

def call_llm_with_tools(
    messages: List[Dict[str, Any]],
    tools: List[Dict[str, Any]]
) -> Dict[str, Any]:

    client, model = get_llm_client()

    if client and model:
        try:
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                tools=tools,
                tool_choice="auto",
                temperature=0.1
            )

            choice = response.choices[0]
            message = choice.message

            tool_calls = []

            if message.tool_calls:
                for tc in message.tool_calls:

                    arguments = tc.function.arguments

                    # Groq normally returns arguments as a JSON string.
                    if isinstance(arguments, str):
                        try:
                            arguments = json.loads(arguments)
                        except json.JSONDecodeError:
                            logger.error(
                                f"Invalid tool arguments returned by Groq: "
                                f"{tc.function.arguments}"
                            )
                            arguments = {}

                    tool_calls.append({
                        "id": tc.id,
                        "name": tc.function.name,
                        "arguments": arguments
                    })

            return {
                "content": message.content or "",
                "tool_calls": tool_calls,
                "provider_used": "groq"
            }

        except Exception as e:
            logger.error(f"Error calling Groq API: {e}")

            # Development fallback
            return deterministic_fallback_nlp(messages)

    # No API key / Groq client unavailable
    logger.warning(
        "Groq client unavailable. "
        "Using deterministic fallback NLP engine."
    )

    return deterministic_fallback_nlp(messages)


# ============================================================
# DETERMINISTIC FALLBACK
# ============================================================

def deterministic_fallback_nlp(
    messages: List[Dict[str, Any]]
) -> Dict[str, Any]:

    """
    Rule-based fallback used when Groq is unavailable.

    This is NOT the primary SpendWise AI agent.
    The normal application should use Groq for reasoning
    and tool selection.

    This fallback mainly supports basic testing and
    hackathon demo recovery.
    """

    last_user_msg = ""

    # Find latest user message
    for message in reversed(messages):
        if message.get("role") == "user":
            last_user_msg = message.get("content", "")
            break

    text = last_user_msg.lower()

    tool_calls = []

    # ========================================================
    # EXPENSE CREATION
    # ========================================================

    # Supports:
    # ₹250
    # ₹ 250
    # Rs 250
    # Rs. 250
    # 250 rs
    # 250 rupees
    # INR 250

    amount_match = re.search(
        r'(?:₹|rs\.?|inr)?\s*'
        r'(\d+(?:\.\d{1,2})?)'
        r'\s*(?:rs|rupees|₹)?',
        text,
        re.IGNORECASE
    )

    expense_keywords = [
        "spent",
        "paid",
        "bought",
        "cost",
        "purchased",
        "expense",
        "for coffee",
        "on lunch",
        "on bus"
    ]

    query_keywords = [
        "how much",
        "what",
        "where",
        "compare",
        "forecast",
        "reduce"
    ]

    is_expense_entry = any(
        keyword in text
        for keyword in expense_keywords
    )

    is_query = any(
        keyword in text
        for keyword in query_keywords
    )

    if amount_match and is_expense_entry and not is_query:

        amount = float(amount_match.group(1))

        category = "Other"
        description = "Expense"

        # ----------------------------------------------------
        # Food
        # ----------------------------------------------------

        food_keywords = [
            "lunch",
            "food",
            "dinner",
            "breakfast",
            "pizza",
            "coffee",
            "snacks"
        ]

        if any(keyword in text for keyword in food_keywords):

            category = "Food"

            if "lunch" in text:
                description = "Lunch"

            elif "pizza" in text:
                description = "Pizza"

            elif "coffee" in text:
                description = "Coffee"

            elif "breakfast" in text:
                description = "Breakfast"

            elif "dinner" in text:
                description = "Dinner"

            else:
                description = "Food & Snacks"

        # ----------------------------------------------------
        # Transport
        # ----------------------------------------------------

        elif any(
            keyword in text
            for keyword in [
                "bus",
                "petrol",
                "uber",
                "cab",
                "travel",
                "transport"
            ]
        ):

            category = "Transport"

            if "bus" in text:
                description = "Bus travel"

            elif "petrol" in text:
                description = "Petrol"

            elif "uber" in text:
                description = "Uber"

            elif "cab" in text:
                description = "Cab"

            else:
                description = "Transport"

        # ----------------------------------------------------
        # Utilities
        # ----------------------------------------------------

        elif any(
            keyword in text
            for keyword in [
                "electricity",
                "bill",
                "water",
                "power"
            ]
        ):

            category = "Utilities"

            if "electricity" in text:
                description = "Electricity bill"

            elif "water" in text:
                description = "Water bill"

            else:
                description = "Utility Bill"

        # ----------------------------------------------------
        # Education
        # ----------------------------------------------------

        elif any(
            keyword in text
            for keyword in [
                "book",
                "course"
            ]
        ):

            category = "Education"

            if "book" in text:
                description = "Book purchase"

            else:
                description = "Education"

        # ----------------------------------------------------
        # Subscription
        # ----------------------------------------------------

        elif any(
            keyword in text
            for keyword in [
                "netflix",
                "subscription",
                "spotify"
            ]
        ):

            category = "Subscription"

            if "netflix" in text:
                description = "Netflix"

            elif "spotify" in text:
                description = "Spotify"

            else:
                description = "Subscription"

        # ----------------------------------------------------
        # Shopping
        # ----------------------------------------------------

        elif any(
            keyword in text
            for keyword in [
                "shirt",
                "clothes",
                "shopping",
                "headphones",
                "shoes"
            ]
        ):

            category = "Shopping"
            description = "Shopping"

        # ----------------------------------------------------
        # Entertainment
        # ----------------------------------------------------

        elif any(
            keyword in text
            for keyword in [
                "movie",
                "cinema",
                "game",
                "concert"
            ]
        ):

            category = "Entertainment"
            description = "Entertainment"

        # ----------------------------------------------------
        # Healthcare
        # ----------------------------------------------------

        elif any(
            keyword in text
            for keyword in [
                "medicine",
                "hospital",
                "doctor",
                "pharmacy"
            ]
        ):

            category = "Healthcare"
            description = "Healthcare"

        # ----------------------------------------------------
        # Date
        # ----------------------------------------------------

        date_value = "today"

        if "yesterday" in text:
            date_value = "yesterday"

        # ----------------------------------------------------
        # Tool Call
        # ----------------------------------------------------

        tool_calls.append({
            "id": "fallback_call_1",
            "name": "add_expense",
            "arguments": {
                "amount": amount,
                "description": description,
                "category": category,
                "date": date_value
            }
        })

    # ========================================================
    # HIGHEST SPENDING CATEGORY
    # ========================================================

    elif (
        "where" in text
        and (
            "most" in text
            or "largest" in text
            or "highest" in text
        )
    ):

        tool_calls.append({
            "id": "fallback_call_2",
            "name": "get_spending_summary",
            "arguments": {
                "period": "this_month"
            }
        })

    # ========================================================
    # FORECAST / BUDGET RISK
    # ========================================================

    elif (
        "exceed" in text
        or "forecast" in text
        or (
            "budget" in text
            and (
                "likely" in text
                or "going to" in text
                or "look" in text
            )
        )
    ):

        tool_calls.append({
            "id": "fallback_call_3",
            "name": "forecast_expenses",
            "arguments": {}
        })

    # ========================================================
    # SAVINGS / RECOMMENDATIONS
    # ========================================================

    elif any(
        keyword in text
        for keyword in [
            "reduce",
            "save",
            "cut",
            "recommend"
        ]
    ):

        tool_calls.append({
            "id": "fallback_call_4",
            "name": "generate_report",
            "arguments": {}
        })

    # ========================================================
    # SPENDING QUERY
    # ========================================================

    elif (
        "how much" in text
        or "spending" in text
    ):

        period = "this_month"

        if "today" in text:
            period = "today"

        elif "yesterday" in text:
            period = "yesterday"

        elif "last week" in text:
            period = "last_week"

        elif "week" in text:
            period = "this_week"

        elif "last month" in text:
            period = "last_month"

        tool_calls.append({
            "id": "fallback_call_5",
            "name": "get_expenses_by_period",
            "arguments": {
                "period": period
            }
        })

    # ========================================================
    # FALLBACK RESPONSE
    # ========================================================

    return {
        "content": "",
        "tool_calls": tool_calls,
        "provider_used": "deterministic_fallback"
    }