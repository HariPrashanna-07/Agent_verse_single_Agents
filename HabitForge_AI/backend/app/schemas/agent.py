from pydantic import BaseModel
from typing import List, Optional, Any


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []


class ToolCall(BaseModel):
    tool: str
    status: str = "success"
    result: Optional[Any] = None


class ChatResponse(BaseModel):
    response: str
    tool_calls: List[ToolCall] = []
    insights: List[str] = []
    success: bool = True
