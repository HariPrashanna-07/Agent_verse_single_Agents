"""
Core AI service wrapping Groq API and LLM invocation for structured meeting analysis.
"""

import os
import json
import re
from typing import Dict, Any, List
from groq import Groq
from dotenv import load_dotenv

load_dotenv()


class AIServiceError(Exception):
    """Custom exception raised when LLM processing fails."""
    pass


SYSTEM_PROMPT = """You are an expert executive meeting assistant and organizational strategist.
Your task is to analyze meeting transcripts/notes and output a comprehensive structured analysis.

You MUST respond strictly in valid JSON format with the exact keys specified below.
Do not wrap your response in triple backticks unless required by JSON compliance, and ensure no extraneous conversational text is returned.

JSON Structure Schema:
{
  "meeting_summary": "High-level, executive summary of the meeting context and outcomes (2-4 paragraphs).",
  "discussion_points": [
    "Point 1 detail...",
    "Point 2 detail..."
  ],
  "decisions": [
    "Decision 1 made...",
    "Decision 2 made..."
  ],
  "action_items": [
    {
      "task": "Description of task",
      "owner": "Name of assigned person or 'Unassigned'",
      "deadline": "Deadline date/timeframe or 'TBD'"
    }
  ],
  "risks": [
    "Risk or blocker 1...",
    "Risk or blocker 2..."
  ],
  "follow_up_email": {
    "subject": "Clear Email Subject",
    "body": "Professional draft email summarizing meeting outcomes, next steps, and appreciation."
  },
  "next_meeting_agenda": [
    "Agenda item 1",
    "Agenda item 2"
  ]
}
"""


class MeetingAIService:
    """Service handler for Groq API meeting processing."""

    def __init__(self, api_key: str = None):
        """
        Initializes Groq client using provided key or environment variable.
        """
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise AIServiceError("Groq API key is missing. Please set GROQ_API_KEY in .env file or UI settings.")
        
        self.client = Groq(api_key=self.api_key)
        self.model_name = "llama-3.3-70b-versatile"

    def analyze_transcript(self, raw_text: str) -> Dict[str, Any]:
        """
        Calls Groq Llama-3.3-70B model to analyze transcript text.
        
        Args:
            raw_text (str): Meeting text payload.
            
        Returns:
            Dict[str, Any]: Parsed structured output.
        """
        try:
            user_message = f"Please process the following meeting transcript:\n\n{raw_text}"

            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.2,
                max_tokens=4096,
                response_format={"type": "json_object"}
            )

            content = response.choices[0].message.content
            return self._parse_json_response(content)

        except Exception as e:
            raise AIServiceError(f"Failed to analyze meeting text: {str(e)}")

    def _parse_json_response(self, content: str) -> Dict[str, Any]:
        """
        Safely parses JSON responses from the model.
        """
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", content, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(0))
                except json.JSONDecodeError:
                    pass
            raise AIServiceError("The AI model returned an invalid JSON schema.")


def format_markdown_report(data: Dict[str, Any]) -> str:
    """
    Formats the structured AI data into a clean Markdown string matching required output layout.
    
    Args:
        data (Dict[str, Any]): Structured data dictionary.
        
    Returns:
        str: Markdown representation.
    """
    md = []
    
    # Meeting Summary
    md.append("# Meeting Summary\n")
    md.append(f"{data.get('meeting_summary', 'No summary available.')}\n\n")

    # Key Discussion Points
    md.append("## Key Discussion Points\n")
    for pt in data.get("discussion_points", []):
        md.append(f"* {pt}")
    md.append("\n")

    # Decisions Made
    md.append("## Decisions Made\n")
    for dec in data.get("decisions", []):
        md.append(f"* {dec}")
    md.append("\n")

    # Action Items Table
    md.append("## Action Items\n")
    actions = data.get("action_items", [])
    if actions:
        md.append("| Task | Owner | Deadline |")
        md.append("|---|---|---|")
        for item in actions:
            task = item.get("task", "-").replace("|", "-")
            owner = item.get("owner", "Unassigned").replace("|", "-")
            deadline = item.get("deadline", "TBD").replace("|", "-")
            md.append(f"| {task} | {owner} | {deadline} |")
    else:
        md.append("_No action items identified._")
    md.append("\n\n")

    # Risks
    md.append("## Risks\n")
    risks = data.get("risks", [])
    if risks:
        for r in risks:
            md.append(f"* {r}")
    else:
        md.append("_No critical risks or blockers identified._")
    md.append("\n\n")

    # Follow-up Email
    email = data.get("follow_up_email", {})
    md.append("## Follow-up Email\n")
    md.append(f"**Subject:** {email.get('subject', 'Meeting Follow-up')}\n\n")
    md.append(f"```text\n{email.get('body', '')}\n```\n\n")

    # Next Meeting Agenda
    md.append("## Next Meeting Agenda\n")
    agenda = data.get("next_meeting_agenda", [])
    if agenda:
        for item in agenda:
            md.append(f"* {item}")
    else:
        md.append("_To be determined._")

    return "\n".join(md)