import json
import os
from functools import lru_cache

import requests
from dotenv import load_dotenv
from groq import Groq

# 1. Load environment variables from the .env file
load_dotenv()

# Verify key loaded successfully before proceeding
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise ValueError("GROQ_API_KEY not found! Check your .env file in the current directory.")

# Initialize the Groq client with the loaded key
client = Groq(api_key=api_key)


# 2. Fetch LeetCode User Stats via GraphQL API
def fetch_leetcode_profile(username: str) -> dict:
    url = "https://leetcode.com/graphql"

    # GraphQL Query to retrieve problem counts by difficulty & tags
    query = """
    query userPublicProfile($username: String!) {
      matchedUser(username: $username) {
        username
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        tagProblemCounts {
          advanced {
            tagName
            problemsSolved
          }
          intermediate {
            tagName
            problemsSolved
          }
          fundamental {
            tagName
            problemsSolved
          }
        }
      }
    }
    """

    response = requests.post(
        url,
        json={"query": query, "variables": {"username": username}},
        headers={"Content-Type": "application/json"},
        timeout=20,
    )

    if response.status_code == 200:
        data = response.json()
        if data.get("data") and data["data"].get("matchedUser"):
            return data["data"]["matchedUser"]

    raise ValueError(
        f"Could not fetch profile for user '{username}'. Please check if the username is correct."
    )


# Cache profile data so repeated company analyses do not re-query LeetCode.
@lru_cache(maxsize=32)
def get_cached_leetcode_profile(username: str) -> dict:
    return fetch_leetcode_profile(username)


def generate_company_prompt(username: str, company: str, profile_data: dict) -> str:
    profile_summary = json.dumps(profile_data, indent=2, default=str)

    return f"""
You are an elite DSA interview coach and technical recruiter for {company}.
Use the provided LeetCode profile to create a practical, company-specific preparation roadmap.

Requirements:
- Readiness Score (/100)
- Strengths
- Weaknesses
- Missing Topics
- Interview Pattern of the selected company
- Important DSA topics for that company
- Topic priority ranking
- Recommended Easy/Medium/Hard distribution
- 30-day preparation roadmap
- Daily practice goals
- Recommended LeetCode problems by topic
- Revision strategy
- Mock interview strategy
- Final interview readiness assessment

Write the response in polished markdown with these headings:
## Readiness Score
## Strengths
## Weaknesses
## Missing Topics
## Interview Pattern
## Important DSA Topics
## Topic Priority Ranking
## Recommended Difficulty Distribution
## 30-Day Preparation Roadmap
## Daily Practice Goals
## Recommended LeetCode Problems
## Revision Strategy
## Mock Interview Strategy
## Final Readiness Assessment

Also include a section called ## Week 1, ## Week 2, ## Week 3, and ## Week 4 inside the 30-Day Preparation Roadmap.

User: {username}
Company: {company}
Profile Data:
{profile_summary}
"""


def generate_company_analysis(username: str, company: str, profile_data: dict) -> str:
    system_prompt = """
You are a senior software engineering interview mentor who specializes in helping candidates prepare for top-tier companies.
Create actionable, evidence-based roadmaps using LeetCode performance data and company-specific interview patterns.
"""

    user_prompt = generate_company_prompt(username, company, profile_data)

    print(f"Generating {company} roadmap for '{username}' with Groq AI Agent...")

    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.3,
    )

    return chat_completion.choices[0].message.content


# 3. Run the AI Agent
def run_leetcode_agent(username: str) -> str:
    print(f"Fetching LeetCode profile data for '{username}'...")
    profile_data = get_cached_leetcode_profile(username)

    system_prompt = """
    You are an elite Data Structures & Algorithms (DSA) Coach and Tech Interviewer.
    Analyze the user's LeetCode statistics and provide a structured, encouraging, and critical report.

    Structure your response using the following markdown format:
    ## 📊 Profile Summary
    Overview of total problems solved, difficulty distribution, and overall progress.

    ## ⚠️ Skill Gap & Weakness Analysis
    Identify specific missing topics, unbalanced ratios (e.g., too many Easy problems vs Hard), or neglected tags.

    ## 🎯 4-Week Custom Study Plan
    Provide a step-by-step weekly action plan focusing on key topics they need to improve for interview readiness.
    """

    user_prompt = f"Analyze the following LeetCode profile data for user '{username}':\n\n{profile_data}"

    print("Analyzing profile with Groq AI Agent...")

    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.3,
    )

    return chat_completion.choices[0].message.content


# 4. Entry Point
if __name__ == "__main__":
    leetcode_username = input("Enter LeetCode Username: ").strip()

    if not leetcode_username:
        print("Username cannot be empty!")
    else:
        try:
            analysis = run_leetcode_agent(leetcode_username)
            print("\n" + "=" * 60)
            print(f"🤖 LEETCODE AGENT ANALYSIS FOR '{leetcode_username}'")
            print("=" * 60 + "\n")
            print(analysis)
        except Exception as e:
            print(f"\n❌ Error: {e}")
