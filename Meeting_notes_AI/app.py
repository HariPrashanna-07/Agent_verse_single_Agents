"""
Streamlit main application entry point for Meeting Notes AI Agent.
"""

import os
import streamlit as st
from dotenv import load_dotenv

from ai_service import MeetingAIService, format_markdown_report, AIServiceError
from file_handler import process_uploaded_file, FileExtractionError
from pdf_export import generate_pdf_report, PDFExportError
from utils import validate_transcript_input, calculate_metrics, create_owner_workload_chart

load_dotenv()

# Streamlit Page Config
st.set_page_config(
    page_title="Meeting Notes AI Agent",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Load CSS
def load_css(file_path: str):
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

load_css("styles/style.css")

# Session State Initialization
if "analysis_result" not in st.session_state:
    st.session_state["analysis_result"] = None
if "transcript_text" not in st.session_state:
    st.session_state["transcript_text"] = ""


def main():
    # Sidebar
    st.sidebar.markdown(
        """
        <div class="sidebar-branding">
            <h2>🤖 AI Agent</h2>
            <div class="sidebar-title">Meeting Notes Intelligence</div>
        </div>
        """,
        unsafe_allow_html=True
    )
    st.sidebar.divider()

    # API Key Handling
    env_api_key = os.getenv("GROQ_API_KEY", "")
    user_api_key = st.sidebar.text_input("Groq API Key", value=env_api_key, type="password")

    navigation = st.sidebar.radio(
        "Navigation",
        ["Dashboard & Processing", "Generated Report", "Analytics & Insights"]
    )

    st.sidebar.divider()
    st.sidebar.info("Powered by Groq & Llama-3.3-70B")

    # Main Header
    st.title("📋 Meeting Notes AI Agent")
    st.caption("Autonomous assistant for transcript analysis, action tracking, email synthesis, and report generation.")

    # TAB 1: Dashboard & Input Processing
    if navigation == "Dashboard & Processing":
        st.subheader("Transcript Input")

        input_method = st.radio("Choose Input Method", ["Upload File (.txt, .pdf, .docx)", "Paste Raw Transcript"], horizontal=True)

        extracted_text = ""

        if input_method == "Upload File (.txt, .pdf, .docx)":
            uploaded_file = st.file_uploader("Upload Meeting File", type=["txt", "pdf", "docx"])
            if uploaded_file is not None:
                try:
                    with st.spinner("Parsing document content..."):
                        extracted_text = process_uploaded_file(uploaded_file)
                        st.success(f"Successfully extracted {len(extracted_text.split())} words from {uploaded_file.name}")
                except FileExtractionError as e:
                    st.error(str(e))
        else:
            extracted_text = st.text_area("Paste Transcript / Notes Here", height=250, value=st.session_state.get("transcript_text", ""))

        if extracted_text:
            st.session_state["transcript_text"] = extracted_text

        st.divider()

        if st.button("⚡ Run Autonomous Agent", type="primary", use_container_width=True):
            current_text = st.session_state.get("transcript_text", "")
            
            if not validate_transcript_input(current_text):
                st.warning("Please provide a valid transcript with at least 10 words.")
                return

            if not user_api_key:
                st.error("Groq API key is missing. Please set it in the sidebar or .env file.")
                return

            try:
                progress_bar = st.progress(10, text="Initializing Agent Workflow...")
                
                ai_service = MeetingAIService(api_key=user_api_key)
                progress_bar.progress(40, text="Sending context to Llama-3.3 70B model...")

                results = ai_service.analyze_transcript(current_text)
                progress_bar.progress(80, text="Structuring JSON payload & extracting metrics...")

                st.session_state["analysis_result"] = results
                progress_bar.progress(100, text="Analysis Complete!")
                st.success("Analysis executed successfully! Switch tabs to view results or analytics.")

            except AIServiceError as e:
                st.error(f"AI Processing Failed: {str(e)}")
            except Exception as e:
                st.error(f"An unexpected error occurred: {str(e)}")

        # Dashboard Highlights if result exists
        if st.session_state["analysis_result"]:
            st.divider()
            st.subheader("Quick Overview")
            metrics = calculate_metrics(st.session_state["analysis_result"])
            col1, col2, col3, col4 = st.columns(4)

            with col1:
                st.markdown(f"""<div class="metric-card"><div class="card-header">Action Items</div><div class="card-value">{metrics['total_actions']}</div></div>""", unsafe_allow_html=True)
            with col2:
                st.markdown(f"""<div class="metric-card"><div class="card-header">Decisions</div><div class="card-value">{metrics['total_decisions']}</div></div>""", unsafe_allow_html=True)
            with col3:
                st.markdown(f"""<div class="metric-card"><div class="card-header">Risks</div><div class="card-value">{metrics['total_risks']}</div></div>""", unsafe_allow_html=True)
            with col4:
                st.markdown(f"""<div class="metric-card"><div class="card-header">Assigned Owners</div><div class="card-value">{metrics['assigned_owners_count']}</div></div>""", unsafe_allow_html=True)

    # TAB 2: Generated Report
    elif navigation == "Generated Report":
        st.subheader("Generated Meeting Analysis")

        result = st.session_state.get("analysis_result")
        if not result:
            st.info("No analysis found. Please upload/paste a transcript and run the agent from Dashboard.")
            return

        # Export Button Row
        col_export_pdf, col_export_md = st.columns([1, 1])

        with col_export_pdf:
            try:
                pdf_bytes = generate_pdf_report(result)
                st.download_button(
                    label="📄 Download PDF Report",
                    data=pdf_bytes,
                    file_name="Meeting_Analysis_Report.pdf",
                    mime="application/pdf",
                    use_container_width=True
                )
            except PDFExportError as e:
                st.error(str(e))

        with col_export_md:
            markdown_payload = format_markdown_report(result)
            st.download_button(
                label="📝 Download Markdown (.md)",
                data=markdown_payload,
                file_name="Meeting_Analysis_Report.md",
                mime="text/markdown",
                use_container_width=True
            )

        st.divider()

        # Render Content Sections
        st.markdown(f"### Meeting Summary\n{result.get('meeting_summary', '')}")
        
        col_left, col_right = st.columns(2)
        with col_left:
            st.markdown("### Key Discussion Points")
            for pt in result.get("discussion_points", []):
                st.markdown(f"* {pt}")

        with col_right:
            st.markdown("### Decisions Made")
            for dec in result.get("decisions", []):
                st.markdown(f"* {dec}")

        st.divider()
        st.markdown("### Action Items")
        actions = result.get("action_items", [])
        if actions:
            st.table(actions)
        else:
            st.write("No action items.")

        st.markdown("### Risks & Blockers")
        for r in result.get("risks", []):
            st.markdown(f"* {r}")

        st.divider()
        st.markdown("### Follow-up Email")
        email = result.get("follow_up_email", {})
        st.text_input("Email Subject", value=email.get("subject", ""), disabled=True)
        st.text_area("Email Body", value=email.get("body", ""), height=200, disabled=True)

        st.markdown("### Next Meeting Agenda")
        for item in result.get("next_meeting_agenda", []):
            st.markdown(f"* {item}")

    # TAB 3: Analytics & Insights
    elif navigation == "Analytics & Insights":
        st.subheader("Meeting Insights & Action Item Distribution")

        result = st.session_state.get("analysis_result")
        if not result:
            st.info("No analysis found. Run the agent first to view analytics.")
            return

        actions = result.get("action_items", [])
        fig = create_owner_workload_chart(actions)
        st.plotly_chart(fig, use_container_width=True)


if __name__ == "__main__":
    main()