from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    PageBreak,
    Table,
    TableStyle,
)

OUTPUT_PATH = r"c:\ESDM-Virtual-Lab\pdfs\ESDM_Virtual_Lab_Project_Report.pdf"
REPORT_TITLE = "Design and Development of ESDM Virtual Lab - Role-Based Learning Platform"
SHORT_TITLE = "ESDM Virtual Lab - Role-Based Learning Platform"


def make_styles():
    styles = getSampleStyleSheet()

    styles.add(
        ParagraphStyle(
            name="CenterTitle",
            parent=styles["Title"],
            fontName="Times-Bold",
            fontSize=18,
            leading=24,
            alignment=TA_CENTER,
            spaceAfter=12,
        )
    )

    styles.add(
        ParagraphStyle(
            name="CenterBody",
            parent=styles["Normal"],
            fontName="Times-Roman",
            fontSize=12,
            leading=18,
            alignment=TA_CENTER,
        )
    )

    styles.add(
        ParagraphStyle(
            name="BodyJustify",
            parent=styles["Normal"],
            fontName="Times-Roman",
            fontSize=12,
            leading=19,
            alignment=TA_JUSTIFY,
        )
    )

    styles.add(
        ParagraphStyle(
            name="SectionHeading",
            parent=styles["Heading1"],
            fontName="Times-Bold",
            fontSize=15,
            leading=20,
            spaceAfter=8,
        )
    )

    styles.add(
        ParagraphStyle(
            name="SubHeading",
            parent=styles["Heading2"],
            fontName="Times-Bold",
            fontSize=13,
            leading=18,
            spaceBefore=6,
            spaceAfter=6,
        )
    )

    styles.add(
        ParagraphStyle(
            name="BulletBody",
            parent=styles["Normal"],
            fontName="Times-Roman",
            fontSize=12,
            leading=18,
            alignment=TA_LEFT,
            leftIndent=18,
            bulletIndent=8,
            spaceBefore=2,
            spaceAfter=2,
        )
    )

    styles.add(
        ParagraphStyle(
            name="SmallCenter",
            parent=styles["Normal"],
            fontName="Times-Italic",
            fontSize=10,
            leading=14,
            alignment=TA_CENTER,
        )
    )

    return styles


def header_footer(canvas, doc):
    page = canvas.getPageNumber()
    if page >= 5:
        canvas.setFont("Times-Roman", 10)
        canvas.drawString(doc.leftMargin, A4[1] - 1.5 * cm, SHORT_TITLE)
        canvas.drawRightString(A4[0] - doc.rightMargin, A4[1] - 1.5 * cm, str(page - 4))


def add_cover(story, s):
    story.append(Spacer(1, 1.0 * cm))
    story.append(Paragraph("SCTR's Pune Institute of Computer Technology, Dhankawadi, Pune", s["CenterBody"]))
    story.append(Spacer(1, 1.2 * cm))
    story.append(Paragraph("A PROJECT REPORT ON", s["CenterBody"]))
    story.append(Spacer(1, 0.8 * cm))
    story.append(Paragraph(REPORT_TITLE, s["CenterTitle"]))
    story.append(Spacer(1, 1.0 * cm))
    story.append(Paragraph("SUBMITTED BY", s["CenterBody"]))
    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph("Name: Vivek Jitendra Patil", s["CenterBody"]))
    story.append(Paragraph("Class: TEXI", s["CenterBody"]))
    story.append(Paragraph("Roll No: 33347", s["CenterBody"]))
    story.append(Spacer(1, 0.9 * cm))
    story.append(Paragraph("Under the guidance of", s["CenterBody"]))
    story.append(Spacer(1, 0.2 * cm))
    story.append(Paragraph("Mrs. Swapnaja R. Hiray", s["CenterBody"]))
    story.append(Spacer(1, 4.6 * cm))
    story.append(Paragraph("DEPARTMENT OF INFORMATION TECHNOLOGY", s["CenterBody"]))
    story.append(Paragraph("ACADEMIC YEAR 2025-26", s["CenterBody"]))
    story.append(PageBreak())


def add_certificate(story, s):
    story.append(Paragraph("DEPARTMENT OF INFORMATION TECHNOLOGY", s["CenterBody"]))
    story.append(Paragraph("SCTR's Pune Institute of Computer Technology", s["CenterBody"]))
    story.append(Paragraph("Dhankawadi, Pune, Maharashtra 411043", s["CenterBody"]))
    story.append(Spacer(1, 0.8 * cm))
    story.append(Paragraph("CERTIFICATE", s["CenterTitle"]))

    txt = (
        "This is to certify that the curriculum-based project report entitled "
        f"<b>{REPORT_TITLE}</b>, submitted by <b>Vivek Jitendra Patil</b> "
        "(Roll No: 33347), has been satisfactorily completed under the guidance of "
        "<b>Mrs. Swapnaja R. Hiray</b> towards the partial fulfillment of Third Year "
        "Information Technology, Semester VI, Academic Year 2025-26 of Savitribai "
        "Phule Pune University."
    )
    story.append(Spacer(1, 0.6 * cm))
    story.append(Paragraph(txt, s["BodyJustify"]))
    story.append(Spacer(1, 4.2 * cm))

    sign_table = Table(
        [
            [
                "Mrs. Swapnaja R. Hiray\nProject Guide\nPICT, Pune",
                "(Dr.) Emmanuel M.\nHead\nDepartment of Information Technology\nPICT, Pune",
            ]
        ],
        colWidths=[7.5 * cm, 8.0 * cm],
    )
    sign_table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, -1), "Times-Roman"),
                ("FONTSIZE", (0, 0), (-1, -1), 11),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    story.append(sign_table)
    story.append(Spacer(1, 1.3 * cm))
    story.append(Paragraph("Place: Pune", s["CenterBody"]))
    story.append(Paragraph(f"Date: {datetime.now().strftime('%d %B %Y')}", s["CenterBody"]))
    story.append(PageBreak())


def add_ack(story, s):
    story.append(Paragraph("ACKNOWLEDGEMENT", s["CenterTitle"]))
    text = (
        "I would like to express my sincere gratitude to everyone who supported the successful completion "
        "of this project report. I am deeply thankful to my guide, Mrs. Swapnaja R. Hiray, for her "
        "continuous encouragement, technical guidance, and timely feedback throughout the development "
        "of the ESDM Virtual Lab system. Her mentorship helped me approach the project in a disciplined, "
        "industry-oriented manner."
        "<br/><br/>"
        "I also thank the faculty of the Department of Information Technology, PICT, for providing a strong "
        "academic foundation and the opportunity to execute this role-based, full-stack application as part "
        "of curriculum-based learning."
        "<br/><br/>"
        "This project helped me strengthen my practical understanding of backend API design, mobile app "
        "development, role-based access, cloud integrations, and real-world deployment considerations."
    )
    story.append(Paragraph(text, s["BodyJustify"]))
    story.append(Spacer(1, 4.5 * cm))
    story.append(Paragraph("Name: Vivek Jitendra Patil", s["CenterBody"]))
    story.append(Paragraph("Roll No: 33347", s["CenterBody"]))
    story.append(PageBreak())


def add_contents(story, s):
    story.append(Paragraph("Contents", s["CenterTitle"]))
    lines = [
        "1. Introduction .............................................................................. 1",
        "2. Problem Statement .................................................................... 3",
        "3. Objectives and Scope ................................................................. 5",
        "   3.1 Objectives",
        "   3.2 Scope",
        "4. Methodological Details .............................................................. 8",
        "   4.1 Designing and Developing Role-Based E-Learning Platform",
        "   4.2 Deployment and Integration Workflow",
        "5. Modern Engineering Tools Used ............................................. 13",
        "6. Outcome / Result of Project Work .......................................... 15",
    ]
    for line in lines:
        story.append(Paragraph(line, s["CenterBody"]))
        story.append(Spacer(1, 0.15 * cm))
    story.append(PageBreak())


def add_intro(story, s):
    story.append(Paragraph("1. Introduction", s["SectionHeading"]))
    text = (
        "The ESDM Virtual Lab project was designed as a role-based digital learning platform to support "
        "teaching, assessment, and content distribution for Electronics System Design and Manufacturing "
        "(ESDM) coursework. The platform combines a Node.js and Express backend with a MongoDB data "
        "layer and an Expo React Native frontend that serves both Teacher and Student roles through "
        "dedicated interfaces."
        "<br/><br/>"
        "The project architecture was planned to cover the complete academic workflow: secure authentication, "
        "class-wise assignment publishing, quiz creation through Excel upload, quiz activation and attempt "
        "tracking, digital notes and video resources, diagram sharing, and profile management."
        "<br/><br/>"
        "Compared with conventional classroom workflows where resources are scattered across messaging apps, "
        "emails, and manual records, this virtual lab provides a unified and trackable system with clear role "
        "boundaries and centralised data access."
    )
    story.append(Paragraph(text, s["BodyJustify"]))
    story.append(PageBreak())


def add_problem_statement(story, s):
    story.append(Paragraph("2. Problem Statement", s["SectionHeading"]))
    p1 = (
        "Traditional lab and coursework management in many institutes depends on fragmented tools and manual "
        "processes. This creates delays, data inconsistency, and weak visibility into student progress. For ESDM "
        "subjects specifically, students need access to assignments, notes, diagram references, and quizzes in a "
        "structured manner, while teachers need streamlined content publishing and monitoring capabilities."
    )
    story.append(Paragraph(p1, s["BodyJustify"]))
    story.append(Spacer(1, 0.3 * cm))

    bullets = [
        "No single platform to manage assignments, quizzes, diagrams, notes, and video links together.",
        "Difficulty in enforcing role-based access between students and teachers.",
        "Manual quiz workflows without bulk question upload and activation control.",
        "Lack of class/batch-based filtering for educational resources.",
        "No integrated dashboard view for engagement and performance indicators.",
        "High operational overhead while tracking profile updates and learning artifacts.",
    ]
    for b in bullets:
        story.append(Paragraph(b, s["BulletBody"], bulletText="•"))

    story.append(Spacer(1, 0.4 * cm))
    p2 = (
        "The ESDM Virtual Lab addresses these challenges by introducing a secure, API-driven, role-aware learning "
        "ecosystem that supports both mobile usability and backend extensibility."
    )
    story.append(Paragraph(p2, s["BodyJustify"]))
    story.append(PageBreak())


def add_objectives_scope(story, s):
    story.append(Paragraph("3. Objectives and Scope", s["SectionHeading"]))
    story.append(Paragraph("3.1 Objectives", s["SubHeading"]))

    objectives = [
        "To build a role-based educational platform for Student, Teacher, and Admin-enabled architecture.",
        "To implement secure authentication and protected API access using JWT.",
        "To provide teacher workflows for creating assignments, quizzes, notes, diagrams, and video resources.",
        "To provide student workflows for viewing resources and submitting quiz responses.",
        "To support Excel-based quiz ingestion to reduce manual content entry effort.",
        "To expose dashboard endpoints for analytical summaries of learning activity.",
        "To integrate cloud media storage and file workflows for scalable content handling.",
    ]
    idx = 1
    for obj in objectives:
        story.append(Paragraph(f"{idx}. {obj}", s["BodyJustify"]))
        idx += 1

    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph("3.2 Scope", s["SubHeading"]))

    scope = (
        "The scope includes backend API implementation, MongoDB schema design, role-based middleware, and "
        "a complete mobile frontend for teacher and student operations. Covered modules include authentication, "
        "profile management, assignment workflows, quiz lifecycle (creation, activation, attempt, submission), "
        "notes, diagrams, videos, student analytics, and dashboard metrics."
        "<br/><br/>"
        "The scope excludes enterprise-scale load testing, advanced AI recommendation systems, and comprehensive "
        "offline synchronization."
    )
    story.append(Paragraph(scope, s["BodyJustify"]))
    story.append(PageBreak())


def add_methodology(story, s):
    story.append(Paragraph("4. Methodological Details", s["SectionHeading"]))
    story.append(Paragraph("4.1 Designing and Developing Role-Based E-Learning Platform", s["SubHeading"]))

    text = (
        "The project followed an iterative development model. Each module was implemented in phases: data model "
        "design, API development, middleware integration, frontend screen implementation, end-to-end testing, and "
        "refinement."
    )
    story.append(Paragraph(text, s["BodyJustify"]))

    story.append(Paragraph("4.1.1 Backend Architecture (Node.js, Express, MongoDB)", s["SubHeading"]))
    backend_points = [
        "Express server with modular routes for auth, profile, assignments, quizzes, notes, videos, diagrams, students, and dashboards.",
        "MongoDB models designed for users, assignments, quizzes, quiz attempts, notes, video links, and diagrams.",
        "JWT-protected middleware to secure role-restricted endpoints.",
        "Cloudinary integration for media and document handling.",
        "Excel parsing in quiz module for bulk question import.",
    ]
    for bp in backend_points:
        story.append(Paragraph(bp, s["BulletBody"], bulletText="•"))

    story.append(Paragraph("4.1.2 Student Module (Expo React Native)", s["SubHeading"]))
    student_points = [
        "Dedicated student drawer navigation with dashboard, assignments, quizzes, notes, diagrams, videos, and profile views.",
        "Access to active quizzes with submit flow and score-oriented result handling.",
        "Batch-filtered access to learning resources published by teachers.",
    ]
    for sp in student_points:
        story.append(Paragraph(sp, s["BulletBody"], bulletText="•"))

    story.append(PageBreak())

    story.append(Paragraph("4.1.3 Teacher Module (Expo React Native)", s["SubHeading"]))
    teacher_points = [
        "Teacher dashboard with key academic indicators and quick-access actions.",
        "Content creation workflows for assignments, notes, quizzes, videos, and diagrams.",
        "Quiz activation and status control to govern student availability windows.",
        "Student listing and profile/analytics views for performance observation.",
    ]
    for tp in teacher_points:
        story.append(Paragraph(tp, s["BulletBody"], bulletText="•"))

    story.append(Paragraph("4.1.4 API Service and Frontend Integration", s["SubHeading"]))
    integ = (
        "Axios-based service modules were created for assignment, quiz, dashboard, student, video, and diagram APIs. "
        "Authentication tokens were persisted in AsyncStorage and attached to protected requests. This modular service "
        "layer reduced coupling between UI screens and transport logic, improving maintainability."
    )
    story.append(Paragraph(integ, s["BodyJustify"]))

    story.append(Paragraph("4.2 Deployment and Integration Workflow", s["SubHeading"]))
    dep = (
        "The frontend and backend were designed for independent deployment with clear API contracts. The backend can run "
        "via Node.js process management and connect to MongoDB Atlas, while the frontend uses Expo tooling for Android, iOS, "
        "and web previews. Deployment readiness included environment variable management, CORS configuration, and endpoint "
        "validation using Postman-style testing flows."
    )
    story.append(Paragraph(dep, s["BodyJustify"]))
    story.append(PageBreak())


def add_tools_section(story, s):
    story.append(Paragraph("5. Modern Engineering Tools Used", s["SectionHeading"]))

    data = [
        ["Category", "Tool / Technology", "Purpose"],
        ["Frontend Framework", "Expo Router (React Native)", "Mobile application with role-based navigation"],
        ["Backend Runtime", "Node.js + Express", "REST API implementation"],
        ["Database", "MongoDB + Mongoose", "Persistent storage and schema modeling"],
        ["Authentication", "JWT", "Secure role-based endpoint protection"],
        ["Cloud Media", "Cloudinary + Multer", "File upload and media hosting"],
        ["Spreadsheet Parsing", "xlsx", "Quiz question import through Excel files"],
        ["API Client", "Axios", "Frontend to backend communication"],
        ["State Persistence", "AsyncStorage", "Token and session data storage"],
        ["Charts", "react-native-chart-kit", "Dashboard visualization"],
        ["Version Control", "Git & GitHub", "Source management and collaboration"],
        ["IDE / Editor", "VS Code", "Development and debugging"],
        ["API Testing", "Postman", "Endpoint verification"],
    ]

    table = Table(data, colWidths=[3.6 * cm, 5.0 * cm, 7.3 * cm], repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),
                ("FONTNAME", (0, 0), (-1, 0), "Times-Bold"),
                ("FONTNAME", (0, 1), (-1, -1), "Times-Roman"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.whitesmoke, colors.lightcyan]),
            ]
        )
    )
    story.append(table)
    story.append(Spacer(1, 0.4 * cm))
    story.append(
        Paragraph(
            "The project stack was chosen to balance rapid iteration, modular architecture, and deployment flexibility for an academic environment.",
            s["BodyJustify"],
        )
    )
    story.append(PageBreak())


def add_outcomes(story, s):
    story.append(Paragraph("6. Outcome / Result of Project Work", s["SectionHeading"]))
    story.append(Paragraph("6.1 Technical Outcomes", s["SubHeading"]))

    outcomes = [
        "Developed and integrated a complete role-based learning platform for ESDM coursework.",
        "Implemented secure login and protected API access paths for multiple user roles.",
        "Enabled teacher-driven academic content publishing and class-targeted distribution.",
        "Implemented quiz lifecycle with Excel import, activation control, and student submission tracking.",
        "Delivered dashboard and analytics endpoints for performance visibility.",
        "Integrated cloud workflows and modular API services for maintainable growth.",
    ]
    for oc in outcomes:
        story.append(Paragraph(oc, s["BulletBody"], bulletText="•"))

    story.append(Spacer(1, 0.25 * cm))
    story.append(Paragraph("6.2 Module-Wise Summary", s["SubHeading"]))

    summary = [
        ["Module", "Primary Users", "Key Deliverables"],
        ["Authentication & Profile", "Student, Teacher", "Login, register, profile update, password flow"],
        ["Assignments", "Teacher, Student", "Create/view assignments, class-wise publishing"],
        ["Quizzes", "Teacher, Student", "Excel upload, activation, attempt, submit, score tracking"],
        ["Notes / Videos / Diagrams", "Teacher, Student", "Resource management with batch-based visibility"],
        ["Students & Dashboard", "Teacher", "Student listing, analytics and overview metrics"],
    ]

    table = Table(summary, colWidths=[4.3 * cm, 3.8 * cm, 7.8 * cm], repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                ("FONTNAME", (0, 0), (-1, 0), "Times-Bold"),
                ("FONTNAME", (0, 1), (-1, -1), "Times-Roman"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    story.append(table)
    story.append(PageBreak())

    story.append(Paragraph("6.3 Learning Outcomes", s["SubHeading"]))
    learning = [
        "Strengthened practical understanding of full-stack architecture across backend APIs and mobile clients.",
        "Gained experience in role-based data access and middleware-oriented security design.",
        "Improved skill in schema modeling for educational workflows and entity relationships.",
        "Practiced modular API service abstraction and multi-screen navigation in Expo Router.",
        "Developed stronger debugging, integration testing, and deployment-readiness practices.",
    ]
    for ln in learning:
        story.append(Paragraph(ln, s["BulletBody"], bulletText="•"))

    story.append(Spacer(1, 0.35 * cm))
    story.append(Paragraph("6.4 Screenshots of Project Outputs", s["SubHeading"]))
    story.append(
        Paragraph(
            "The following pages are reserved for screenshots of key interfaces such as login, teacher dashboard, student home, quiz flow, and analytics modules.",
            s["BodyJustify"],
        )
    )

    for page_title in [
        "Project Screenshots - Authentication and Navigation",
        "Project Screenshots - Teacher Modules",
        "Project Screenshots - Student Modules",
        "Project Screenshots - Dashboards and Analytics",
    ]:
        story.append(PageBreak())
        story.append(Spacer(1, 2.0 * cm))
        story.append(Paragraph(page_title, s["CenterTitle"]))
        story.append(Spacer(1, 1.0 * cm))

        placeholder = Table(
            [["Insert screenshots here"], [""], [""]],
            colWidths=[15.0 * cm],
            rowHeights=[1.2 * cm, 6.2 * cm, 6.2 * cm],
        )
        placeholder.setStyle(
            TableStyle(
                [
                    ("GRID", (0, 0), (-1, -1), 1, colors.grey),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("FONTNAME", (0, 0), (-1, -1), "Times-Italic"),
                    ("FONTSIZE", (0, 0), (-1, -1), 12),
                ]
            )
        )
        story.append(placeholder)

    story.append(PageBreak())
    story.append(Spacer(1, 8 * cm))
    story.append(Paragraph("- End of Project Report -", s["CenterTitle"]))


def build_report():
    styles = make_styles()
    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=A4,
        leftMargin=2.2 * cm,
        rightMargin=2.2 * cm,
        topMargin=2.2 * cm,
        bottomMargin=2.2 * cm,
    )

    story = []
    add_cover(story, styles)
    add_certificate(story, styles)
    add_ack(story, styles)
    add_contents(story, styles)
    add_intro(story, styles)
    add_problem_statement(story, styles)
    add_objectives_scope(story, styles)
    add_methodology(story, styles)
    add_tools_section(story, styles)
    add_outcomes(story, styles)

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(f"Generated: {OUTPUT_PATH}")


if __name__ == "__main__":
    build_report()
