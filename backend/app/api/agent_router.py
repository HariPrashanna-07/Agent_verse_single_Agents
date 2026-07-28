from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.agent import ChatRequest, ChatResponse
from app.agent.agent import run_agent

router = APIRouter(prefix="/api/agent", tags=["agent"])


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    history = [{"role": m.role, "content": m.content} for m in (request.history or [])]
    result = run_agent(request.message, history, db)
    return result
