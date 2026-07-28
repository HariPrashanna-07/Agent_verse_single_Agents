from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.agent import ChatRequest, ChatResponse
from app.agent.agent import run_agent
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/agent", tags=["agent"])


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    try:
        history = [{"role": m.role, "content": m.content} for m in (request.history or [])]
        result = run_agent(request.message, history, db)
        return result
    except Exception as e:
        logger.exception("HabitForge agent execution failed")
        fallback_msg = (
            "I'm having trouble connecting to the AI service right now. "
            "Try asking: 'How am I doing this week?' or 'What should I focus on today?'"
        )
        return {
            "response": fallback_msg,
            "tool_calls": [],
            "insights": [],
            "success": False
        }

