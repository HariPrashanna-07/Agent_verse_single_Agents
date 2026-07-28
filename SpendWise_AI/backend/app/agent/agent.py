import json
import logging
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.agent.prompts import SPENDWISE_SYSTEM_PROMPT
from app.agent.tools import AGENT_TOOLS_SCHEMAS, execute_agent_tool
from app.services.llm_provider import call_llm_with_tools
from app.services.budget_monitor import evaluate_budget_risks
from app.schemas.agent import ChatResponse, ToolCallLog, InsightAlert

logger = logging.getLogger("spendwise.agent")

class SpendWiseAgent:
    def __init__(self, db: Session):
        self.db = db

    def process_message(self, message: str, history: List[Dict[str, str]] = None) -> ChatResponse:
        history = history or []

        # Construct messages payload with system prompt
        messages = [{"role": "system", "content": SPENDWISE_SYSTEM_PROMPT}]
        for h in history:
            messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
        messages.append({"role": "user", "content": message})

        executed_tool_logs: List[ToolCallLog] = []
        proactive_insights: List[InsightAlert] = []

        # First turn: call LLM with available tools
        llm_result = call_llm_with_tools(messages, AGENT_TOOLS_SCHEMAS)

        tool_calls = llm_result.get("tool_calls", [])

        if tool_calls:
            for tc in tool_calls:
                tool_name = tc["name"]
                tool_args = tc["arguments"]

                logger.info(f"Agent executing tool '{tool_name}' with args: {tool_args}")
                
                # Execute tool
                tool_response = execute_agent_tool(self.db, tool_name, tool_args)

                executed_tool_logs.append(ToolCallLog(
                    tool_name=tool_name,
                    arguments=tool_args,
                    result=tool_response
                ))

                # Collect any proactive risks returned by the tool
                if "proactive_risks" in tool_response:
                    for r in tool_response["proactive_risks"]:
                        proactive_insights.append(InsightAlert(
                            level=r.get("level", "info"),
                            category=r.get("category"),
                            message=r.get("message", ""),
                            action_suggestion=r.get("action_suggestion")
                        ))

                # Append assistant tool call and tool result to messages for second turn LLM generation
                messages.append({
                    "role": "assistant",
                    "content": None,
                    "tool_calls": [{
                        "id": tc.get("id", "call_1"),
                        "type": "function",
                        "function": {
                            "name": tool_name,
                            "arguments": json.dumps(tool_args)
                        }
                    }]
                })
                messages.append({
                    "role": "tool",
                    "tool_call_id": tc.get("id", "call_1"),
                    "content": json.dumps(tool_response)
                })

            # Second turn: get final natural language explanation from LLM based on tool observation
            final_llm_result = call_llm_with_tools(messages, AGENT_TOOLS_SCHEMAS)
            final_text = final_llm_result.get("content")

            # Fallback formatting if final_text is empty
            if not final_text:
                res_texts = []
                for log in executed_tool_logs:
                    res_texts.append(log.result.get("confirmation") or log.result.get("message") or f"Executed {log.tool_name} successfully.")
                final_text = " ".join(res_texts)
        else:
            final_text = llm_result.get("content", "I am ready to help manage your expenses. You can record transactions, set budgets, or ask about your spending trends.")

        # Autonomous budget evaluation if not already fetched
        if not proactive_insights:
            evaluated_risks = evaluate_budget_risks(self.db)
            for r in evaluated_risks:
                proactive_insights.append(InsightAlert(
                    level=r.get("level", "info"),
                    category=r.get("category"),
                    message=r.get("message", ""),
                    action_suggestion=r.get("action_suggestion")
                ))

        return ChatResponse(
            response=final_text,
            tool_calls=executed_tool_logs,
            insights=proactive_insights,
            success=True
        )
