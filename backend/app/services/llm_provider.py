import os
import logging
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

_client = None


def get_client() -> Groq:
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not set")
        _client = Groq(api_key=api_key)
    return _client


def get_model() -> str:
    return os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")


def chat_with_tools(messages: list, tools: list) -> dict:
    try:
        client = get_client()
        response = client.chat.completions.create(
            model=get_model(),
            messages=messages,
            tools=tools,
            tool_choice="auto",
            max_tokens=2048,
        )
        return {"success": True, "response": response}
    except Exception as e:
        logger.error(f"Groq API error: {e}")
        return {"success": False, "error": str(e)}


def chat_simple(messages: list) -> dict:
    try:
        client = get_client()
        response = client.chat.completions.create(
            model=get_model(),
            messages=messages,
            max_tokens=1024,
        )
        return {"success": True, "content": response.choices[0].message.content}
    except Exception as e:
        logger.error(f"Groq API error: {e}")
        return {"success": False, "error": str(e)}
