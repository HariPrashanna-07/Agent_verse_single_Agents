"""
Utility functions for text processing, validation, and analytics generation.
"""

from typing import Dict, Any, List
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go


def validate_transcript_input(text: str) -> bool:
    """
    Validates if the provided transcript text is non-empty and meets minimum word count.
    
    Args:
        text (str): The transcript string.
        
    Returns:
        bool: True if valid, False otherwise.
    """
    if not text or not text.strip():
        return False
    words = text.strip().split()
    return len(words) >= 10


def calculate_metrics(structured_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes statistical metrics from structured meeting output.
    
    Args:
        structured_data (Dict[str, Any]): Parsed meeting structured elements.
        
    Returns:
        Dict[str, Any]: Calculated numerical metrics.
    """
    action_items = structured_data.get("action_items", [])
    decisions = structured_data.get("decisions", [])
    risks = structured_data.get("risks", [])
    discussion_points = structured_data.get("discussion_points", [])

    owners = set()
    for item in action_items:
        owner = item.get("owner", "").strip()
        if owner and owner.lower() not in ["unassigned", "n/a", "none"]:
            owners.add(owner)

    return {
        "total_actions": len(action_items),
        "total_decisions": len(decisions),
        "total_risks": len(risks),
        "total_points": len(discussion_points),
        "assigned_owners_count": len(owners)
    }


def create_owner_workload_chart(action_items: List[Dict[str, str]]) -> go.Figure:
    """
    Generates a Plotly horizontal bar chart showing action items per owner.
    
    Args:
        action_items (List[Dict[str, str]]): List of action items containing 'owner'.
        
    Returns:
        go.Figure: Plotly chart figure.
    """
    if not action_items:
        fig = go.Figure()
        fig.update_layout(
            template="plotly_dark",
            annotations=[{
                "text": "No Action Items Available",
                "xref": "paper",
                "yref": "paper",
                "showarrow": False,
                "font": {"size": 16}
            }]
        )
        return fig

    df = pd.DataFrame(action_items)
    if "owner" not in df.columns or df.empty:
        df = pd.DataFrame([{"owner": "Unassigned"}])
    
    df["owner"] = df["owner"].replace("", "Unassigned").fillna("Unassigned")
    counts = df["owner"].value_counts().reset_index()
    counts.columns = ["Owner", "Count"]

    fig = px.bar(
        counts,
        x="Count",
        y="Owner",
        orientation="h",
        title="Action Item Assignment Distribution",
        color="Count",
        color_continuous_scale="Viridis"
    )
    fig.update_layout(
        template="plotly_dark",
        plot_bgcolor="rgba(0,0,0,0)",
        paper_bgcolor="rgba(0,0,0,0)",
        margin=dict(l=20, r=20, t=40, b=20),
        xaxis_title="Number of Tasks",
        yaxis_title="Owner"
    )
    return fig