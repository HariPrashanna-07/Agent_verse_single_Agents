import os
import logging
from groq import Groq
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Do NOT cache the client at module level — re-read the key each time so that
# a .env file created after server start is picked up on the next request.
_client = None
_loaded_key = None


def _get_client() -> Groq:
    global _client, _loaded_key
    # Reload .env every call so a newly created .env is picked up without restart
    load_dotenv(override=True)
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not set — create backend/.env with your key")
    # Only rebuild the client when the key actually changes
    if _client is None or api_key != _loaded_key:
        _client = Groq(api_key=api_key)
        _loaded_key = api_key
    return _client


def get_model() -> str:
    load_dotenv(override=True)
    return os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")


def chat_with_tools(messages: list, tools: list) -> dict:
    model = get_model()
    logger.info(f"[HabitForge] Provider: Groq")
    logger.info(f"[HabitForge] Model: {model}")
    logger.info(f"[HabitForge] Messages in context: {len(messages)}")
    try:
        client = _get_client()
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            tools=tools,
            tool_choice="auto",
            max_tokens=2048,
        )
        tool_count = len(response.choices[0].message.tool_calls or [])
        logger.info(f"[HabitForge] Groq response received")
        logger.info(f"[HabitForge] Tool calls: {tool_count}")
        return {"success": True, "response": response}
    except Exception as e:
        logger.error(f"[HabitForge] Groq error: {e}")
        if "429" in str(e) or "limit" in str(e).lower() or "quota" in str(e).lower():
            fallback_model = "llama-3.1-8b-instant"
            logger.info(f"[HabitForge] Attempting fallback to {fallback_model} due to rate limit/quota...")
            try:
                client = _get_client()
                response = client.chat.completions.create(
                    model=fallback_model,
                    messages=messages,
                    tools=tools,
                    tool_choice="auto",
                    max_tokens=2048,
                )
                tool_count = len(response.choices[0].message.tool_calls or [])
                logger.info(f"[HabitForge] Fallback Groq response received")
                logger.info(f"[HabitForge] Tool calls: {tool_count}")
                return {"success": True, "response": response}
            except Exception as fe:
                logger.error(f"[HabitForge] Fallback model failed: {fe}")
        return {"success": False, "error": str(e)}


def chat_simple(messages: list) -> dict:
    model = get_model()
    logger.info(f"[HabitForge] Sending tool results back to Groq for final answer")
    logger.info(f"[HabitForge] Model: {model} | Messages in context: {len(messages)}")
    try:
        client = _get_client()
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=1024,
        )
        logger.info(f"[HabitForge] Groq final response received")
        return {"success": True, "content": response.choices[0].message.content}
    except Exception as e:
        logger.error(f"[HabitForge] Groq error (final call): {e}")
        if "429" in str(e) or "limit" in str(e).lower() or "quota" in str(e).lower():
            fallback_model = "llama-3.1-8b-instant"
            logger.info(f"[HabitForge] Attempting simple fallback to {fallback_model} due to rate limit/quota...")
            try:
                client = _get_client()
                response = client.chat.completions.create(
                    model=fallback_model,
                    messages=messages,
                    max_tokens=1024,
                )
                logger.info(f"[HabitForge] Fallback final Groq response received")
                return {"success": True, "content": response.choices[0].message.content}
            except Exception as fe:
                logger.error(f"[HabitForge] Fallback model failed on final call: {fe}")
        return {"success": False, "error": str(e)}
