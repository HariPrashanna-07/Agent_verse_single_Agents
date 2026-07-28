from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.agent import ChatRequest, ChatResponse
from app.agent.agent import SpendWiseAgent

router = APIRouter(prefix="/api/agent", tags=["Agent"])

@router.post("/chat", response_model=ChatResponse)
def agent_chat(request: ChatRequest, db: Session = Depends(get_db)):
    try:
        agent = SpendWiseAgent(db)
        history_dicts = [{"role": h.role, "content": h.content} for h in request.history]
        response = agent.process_message(request.message, history_dicts)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")
