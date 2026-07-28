"""
PDF Generation module using ReportLab to export clean, professional meeting reports.
"""

import io
from typing import Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable


class PDFExportError(Exception):
    """Custom exception raised when PDF generation fails."""
    pass


def generate_pdf_report(data: Dict[str, Any]) -> bytes:
    """
    Generates a professional downloadable PDF report from meeting analysis data.
    
    Args:
        data (Dict[str, Any]): Structured AI output dictionary.
        
    Returns:
        bytes: Binary PDF stream data.
    """
    try:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40
        )

        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#1E293B'),
            spaceAfter=15
        )
        
        section_style = ParagraphStyle(
            'SectionHeader',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=14,
            leading=18,
            textColor=colors.HexColor('#334155'),
            spaceBefore=12,
            spaceAfter=6
        )

        body_style = ParagraphStyle(
            'BodyTextCustom',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#475569'),
            spaceAfter=6
        )

        bullet_style = ParagraphStyle(
            'BulletCustom',
            parent=body_style,
            leftIndent=15,
            firstLineIndent=-10,
            spaceAfter=4
        )

        email_style = ParagraphStyle(
            'EmailBody',
            parent=body_style,
            fontName='Courier',
            fontSize=9,
            leading=12,
            backColor=colors.HexColor('#F8FAFC'),
            borderColor=colors.HexColor('#E2E8F0'),
            borderWidth=1,
            borderPadding=8,
            spaceAfter=10
        )

        elements = []

        # Document Header
        elements.append(Paragraph("Executive Meeting Intelligence Report", title_style))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#4F46E5'), spaceAfter=15))

        # 1. Summary
        elements.append(Paragraph("Meeting Summary", section_style))
        elements.append(Paragraph(data.get("meeting_summary", "N/A"), body_style))
        elements.append(Spacer(1, 10))

        # 2. Key Discussion Points
        elements.append(Paragraph("Key Discussion Points", section_style))
        for pt in data.get("discussion_points", []):
            elements.append(Paragraph(f"• {pt}", bullet_style))
        elements.append(Spacer(1, 10))

        # 3. Decisions Made
        elements.append(Paragraph("Decisions Made", section_style))
        for dec in data.get("decisions", []):
            elements.append(Paragraph(f"• {dec}", bullet_style))
        elements.append(Spacer(1, 10))

        # 4. Action Items Table
        elements.append(Paragraph("Action Items", section_style))
        actions = data.get("action_items", [])
        
        table_data = [["Task", "Owner", "Deadline"]]
        if actions:
            for act in actions:
                task = Paragraph(act.get("task", "-"), body_style)
                owner = Paragraph(act.get("owner", "Unassigned"), body_style)
                deadline = Paragraph(act.get("deadline", "TBD"), body_style)
                table_data.append([task, owner, deadline])
        else:
            table_data.append(["No action items detected", "-", "-"])

        action_table = Table(table_data, colWidths=[280, 120, 132])
        action_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4F46E5')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
            ('TOPPADDING', (0, 0), (-1, 0), 6),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F8FAFC')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        elements.append(action_table)
        elements.append(Spacer(1, 12))

        # 5. Risks & Blockers
        elements.append(Paragraph("Risks & Blockers", section_style))
        risks = data.get("risks", [])
        if risks:
            for r in risks:
                elements.append(Paragraph(f"• {r}", bullet_style))
        else:
            elements.append(Paragraph("No critical risks noted.", body_style))
        elements.append(Spacer(1, 10))

        # 6. Follow-Up Email
        elements.append(Paragraph("Follow-up Email Draft", section_style))
        email = data.get("follow_up_email", {})
        elements.append(Paragraph(f"<b>Subject:</b> {email.get('subject', 'Meeting Follow-up')}", body_style))
        elements.append(Spacer(1, 4))
        email_body_formatted = email.get("body", "").replace("\n", "<br/>")
        elements.append(Paragraph(email_body_formatted, email_style))
        elements.append(Spacer(1, 10))

        # 7. Next Agenda
        elements.append(Paragraph("Next Meeting Agenda", section_style))
        agenda = data.get("next_meeting_agenda", [])
        if agenda:
            for item in agenda:
                elements.append(Paragraph(f"• {item}", bullet_style))
        else:
            elements.append(Paragraph("To be determined.", body_style))

        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

    except Exception as e:
        raise PDFExportError(f"Failed to generate PDF document: {str(e)}")