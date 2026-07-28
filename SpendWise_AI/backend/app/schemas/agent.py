from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ChatMessage(BaseModel):
    role: str = Field(..., description="'user', 'assistant', or 'system'")
    content: str = Field(..., description="Text content of the message")

class ChatRequest(BaseModel):
    message: str = Field(..., description="User message to the agent")
    history: Optional[List[ChatMessage]] = Field(default=[], description="Previous conversation history")

class ToolCallLog(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    result: Any

class InsightAlert(BaseModel):
    level: str  # "info", "warning", "critical"
    category: Optional[str] = None
    message: str
    action_suggestion: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    tool_calls: List[ToolCallLog] = []
    insights: List[InsightAlert] = []
    success: bool = True
