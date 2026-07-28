import re

import streamlit as st

from backend import (
    generate_company_analysis,
    get_cached_leetcode_profile,
    run_leetcode_agent,
)

st.set_page_config(
    page_title="LeetCode AI Coach",
    page_icon="🚀",
    layout="wide",
)

st.markdown(
    """
<style>
.main{
    background:#0f172a;
}
.block-container{
    padding-top:2rem;
}
.stButton>button{
    width:100%;
    height:50px;
    border-radius:10px;
    font-size:18px;
    background:#f59e0b;
    color:white;
}
</style>
""",
    unsafe_allow_html=True,
)

st.title("🚀 AI LeetCode Coach")

st.write(
    """
Get an AI-powered review of your LeetCode profile and a company-specific interview roadmap.

✔ Skill Gap Analysis
✔ Interview Readiness
✔ Weekly Study Plan
✔ Company-Specific Preparation
"""
)

username = st.text_input("LeetCode Username", placeholder="Enter username...")

with st.sidebar:
    st.header("🧠 Interview Preparation")
    st.write("Generate a tailored roadmap for your target company.")
    company = st.selectbox(
        "Select Company",
        [
            "Amazon",
            "Google",
            "Microsoft",
            "Adobe",
            "Uber",
            "Atlassian",
            "Meta",
            "Apple",
            "Netflix",
        ],
        key="company_selector",
    )
    if st.button("Generate Company Roadmap", use_container_width=True, key="company_button"):
        if username.strip() == "":
            st.warning("Enter a username before generating a company roadmap.")
        else:
            with st.spinner(f"Building a {company} roadmap..."):
                profile_data = get_cached_leetcode_profile(username.strip())
                analysis = generate_company_analysis(username.strip(), company, profile_data)
            st.session_state["company_analysis"] = analysis
            st.session_state["selected_company"] = company
            st.session_state["analysis_username"] = username.strip()
            st.success("Company roadmap generated successfully.")


def display_company_dashboard(analysis: str, company: str) -> None:
    st.subheader(f"{company} Preparation Roadmap")

    readiness_score = extract_readiness_score(analysis)
    dsa_coverage = min(100, max(25, readiness_score - 8))
    interview_readiness = min(100, max(30, readiness_score + 5))

    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Overall Readiness", f"{readiness_score}/100")
        st.progress(readiness_score / 100)
    with col2:
        st.metric("DSA Coverage", f"{dsa_coverage}/100")
        st.progress(dsa_coverage / 100)
    with col3:
        st.metric("Interview Readiness", f"{interview_readiness}/100")
        st.progress(interview_readiness / 100)

    st.divider()
    st.markdown(analysis)

    st.divider()
    st.subheader("Weekly Breakdown")
    week_headings = ["Week 1", "Week 2", "Week 3", "Week 4"]
    for week_heading in week_headings:
        section_content = extract_section(analysis, week_heading)
        if section_content:
            with st.expander(week_heading, expanded=False):
                st.markdown(section_content)


def extract_section(markdown: str, heading: str) -> str:
    pattern = rf"^##\s+{re.escape(heading)}\s*$([\s\S]*?)(?=^##\s+|\Z)"
    match = re.search(pattern, markdown, re.MULTILINE)
    if match:
        return match.group(1).strip()
    return ""


def extract_readiness_score(markdown: str) -> int:
    match = re.search(r"readiness score\s*[:\-]?\s*(\d{1,3})", markdown, re.IGNORECASE)
    if match:
        return max(0, min(100, int(match.group(1))))
    return 60


profile_tab, company_tab = st.tabs(["Profile Analysis", "Company Preparation"])

with profile_tab:
    if st.button("Generate Report", key="profile_button"):
        if username == "":
            st.warning("Enter a username")
        else:
            with st.spinner("AI is analyzing your profile..."):
                report = run_leetcode_agent(username)
            st.session_state["profile_report"] = report

    if "profile_report" in st.session_state:
        st.divider()
        st.markdown(st.session_state["profile_report"])

with company_tab:
    st.subheader("Company Preparation")
    st.write("Use your saved LeetCode profile to generate a company-focused interview roadmap.")

    if "company_analysis" in st.session_state:
        display_company_dashboard(
            st.session_state["company_analysis"],
            st.session_state.get("selected_company", "Target Company"),
        )
    else:
        st.info("Generate a company roadmap from the sidebar to see your personalized preparation plan.")
