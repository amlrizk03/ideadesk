import json
import os

from dotenv import load_dotenv
from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq


load_dotenv()


prompt_template_str = """
You are IdeaDesk, a university project planning assistant.
Return one valid JSON object only.

Main goal:
Turn the student's rough project idea into a clear, realistic, beginner-friendly
project plan that a university student or small student team can actually build.

Language rules:
- The backend detected the response language as: {response_language}.
- Write all explanation text in {response_language}.
- If the language is Turkish, use natural Turkish.
- Do not mix languages.
- Do not use Portuguese, Spanish, French, or any other language.
- Keep technology names, platform names, resource titles, and URLs in their normal form.
- Examples of names that should not be translated: HTML, CSS, JavaScript, Python,
  FastAPI, Flask, SQLite, PostgreSQL, GitHub, DataCamp, W3Schools, MDN.

Scope rules:
- Keep the plan realistic for the selected timeline and the student's current skills.
- Prefer simple first-version features over a large professional system.
- Do not suggest advanced tools unless the student already knows them or the project needs them.
- For a short project, prefer HTML, CSS, JavaScript, Python, FastAPI or Flask, and SQLite.
- Do not suggest microservices, Docker, Kubernetes, complex AI systems, or paid APIs unless clearly needed.

Improved idea rules:
- Write exactly 1 short sentence.
- Keep it between 15 and 25 words.
- Explain the project concept clearly.
- Do not copy the student's raw idea word for word.

Project description rules:
- Write 2 to 3 complete sentences.
- Explain what the project is, who will use it, what problem it solves, and why it is useful.
- Keep it realistic and beginner-friendly.
- Put the longer explanation here, not in improvedIdea.

Main feature rules:
- Create exactly 5 main features.
- Each feature must be specific, useful, and buildable.
- Each feature should be 6 to 14 words.
- Do not write very short features like "Login", "Dashboard", or "Database".
- Start each feature with an action verb when possible.
- Keep features realistic for the selected timeline.

Timeline rules:
- If timeline is "1 Week", create exactly 4 milestones that fit one week only.
- If timeline is "1 Month", create exactly 4 milestones, one for each week.
- If timeline is "Semester", create 8 to 10 milestones.
- Never create milestones beyond the selected timeline.
- For "1 Month", never mention Week 5, Week 6, Week 7, or anything after Week 4.
- For "1 Week", never mention Week 2 or anything after Week 1.
- If the language is Turkish, use "Gün" and "Hafta".
- If the language is English, use "Day" and "Week".

Milestone format:
- For "1 Week":
  - English: "Day 1-2 - ...", "Day 3-4 - ...", "Day 5-6 - ...", "Day 7 - ..."
  - Turkish: "Gün 1-2 - ...", "Gün 3-4 - ...", "Gün 5-6 - ...", "Gün 7 - ..."
- For "1 Month":
  - English: "Week 1 - ...", "Week 2 - ...", "Week 3 - ...", "Week 4 - ..."
  - Turkish: "Hafta 1 - ...", "Hafta 2 - ...", "Hafta 3 - ...", "Hafta 4 - ..."
- Each milestone must describe a real deliverable, not a vague activity.

Team role rules:
- Use 3 to 5 team roles.
- If the language is English, choose from:
  "Project Manager", "Frontend Developer", "Backend Developer",
  "Full-Stack Developer", "Database Administrator", "UI/UX Designer", "QA / Tester".
- If the language is Turkish, choose from:
  "Proje Yöneticisi", "Frontend Geliştirici", "Backend Geliştirici",
  "Tam Yığın Geliştirici", "Veritabanı Sorumlusu", "Arayüz Tasarımcısı", "Test Sorumlusu".

Skill gap rules:
- Compare the student's current skills and known technologies with the suggested tech stack.
- List only real gaps the student needs for this project.
- Use 3 to 6 skill gaps maximum.
- Each skill gap must have one matching learningResources item.

Learning resource rules:
- Create one learning resource for each skill gap.
- Use beginner-friendly resources.
- Use these resource choices when relevant:
  - HTML: W3Schools, HTML Tutorial, https://www.w3schools.com/html/
  - CSS: W3Schools, CSS Tutorial, https://www.w3schools.com/css/
  - CSS Flexbox: W3Schools, CSS Flexbox Tutorial, https://www.w3schools.com/css/css3_flexbox.asp
  - JavaScript: W3Schools, JavaScript Tutorial, https://www.w3schools.com/js/
  - JavaScript: MDN, JavaScript Guide, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide
  - Python: W3Schools, Python Tutorial, https://www.w3schools.com/python/
  - FastAPI: FastAPI Official Docs, FastAPI Tutorial, https://fastapi.tiangolo.com/tutorial/
  - Flask: Flask Official Docs, Flask Quickstart, https://flask.palletsprojects.com/en/stable/quickstart/
  - SQL: DataCamp, Introduction to SQL, https://www.datacamp.com/courses/introduction-to-sql
  - SQL: W3Schools, SQL Tutorial, https://www.w3schools.com/sql/
  - GitHub: GitHub Official Docs, GitHub Docs - Getting Started, https://docs.github.com/en/get-started
  - Web security: MDN, Web Security, https://developer.mozilla.org/en-US/docs/Web/Security
  - Deployment: Render Official Docs, Deploy a Web Service, https://render.com/docs/web-services
- Do not invent fake URLs.
- If no listed resource matches, use the official documentation for the relevant technology.
- If the language is Turkish, difficulty must be "Başlangıç", "Orta", or "İleri".
- If the language is English, difficulty must be "Beginner", "Intermediate", or "Advanced".

Student input:
Project idea: {project_idea}
Current skills: {skills}
Technologies known: {technologies}
Project goal: {goal}
Project type: {project_type}
Timeline: {timeline}

Return valid JSON only.
Do not use markdown.
Do not include explanations outside the JSON.
Do not wrap the JSON in code fences.
Do not add extra keys.
Do not remove any required keys.
Your response must start with {{ and end with }}.

The JSON must exactly match this structure:
{{
  "improvedIdea": "string",
  "projectDescription": "string",
  "mainFeatures": ["string"],
  "suggestedTechStack": ["string"],
  "teamRoles": ["string"],
  "skillGaps": ["string"],
  "milestones": ["string"],
  "learningResources": [
    {{
      "gap": "string",
      "whyItMatters": "string",
      "platform": "string",
      "resourceTitle": "string",
      "resourceUrl": "string",
      "difficulty": "string",
      "estimatedTime": "string",
      "nextStep": "string"
    }}
  ],
  "portfolioKit": {{
    "projectPitch": "string",
    "readmeOutline": ["string"],
    "nextBestStep": "string"
  }}
}}

"""

prompt_template = PromptTemplate.from_template(prompt_template_str)


def _detect_response_language(text):
    lowered = (text or "").lower()
    turkish_markers = [
        "ı",
        "ğ",
        "ü",
        "ş",
        "ö",
        "ç",
        "bir",
        "için",
        "istiyorum",
        "geliştirmek",
        "bana",
        "olsun",
        "hangi",
        "söylesin",
        "bütçe",
    ]

    if any(marker in lowered for marker in turkish_markers):
        return "Turkish"

    return "English"


def _get_model():
    return ChatGroq(
        model=os.getenv("GROQ_MODEL", "llama-3.1-8b-instant"),
        temperature=0.3,
        timeout=30,
        max_retries=0,
    )


def _strip_code_fences(text):
    cleaned = text.strip()

    if cleaned.startswith("```json"):
        cleaned = cleaned.removeprefix("```json").strip()
    elif cleaned.startswith("```"):
        cleaned = cleaned.removeprefix("```").strip()

    if cleaned.endswith("```"):
        cleaned = cleaned.removesuffix("```").strip()

    return cleaned


def _mock_project_plan(user_input):
    """Small fallback only for testing when USE_MOCK_LLM=true."""

    project_type = user_input.get("projectType") or "project"
    timeline = user_input.get("timeline") or "selected timeline"
    technologies = user_input.get("technologies") or "your known technologies"

    return {
        "improvedIdea": (
            f"A practical {project_type.lower()} that turns the student's idea into one clear, buildable first version."
        ),
        "projectDescription": (
            f"This project is scoped for a {timeline.lower()} timeline and focuses on solving one clear user problem. "
            "It keeps the first version realistic by using familiar tools and a small set of useful features."
        ),
        "mainFeatures": [
            "Clear dashboard for the main workflow",
            "Input form for collecting important user information",
            "Organized results or management area",
            "Simple editing flow for improving generated outputs",
            "Portfolio-ready project summary",
        ],
        "suggestedTechStack": [
            "Frontend: HTML, CSS, JavaScript",
            "Backend: Python FastAPI",
            f"Use known technologies where helpful: {technologies}",
        ],
        "teamRoles": [
            "Project planner",
            "Frontend developer",
            "Backend developer",
            "Documentation and presentation owner",
        ],
        "skillGaps": [
            "Connecting frontend forms to backend APIs",
            "Handling loading and error states",
            "Structuring JSON responses",
            "Preparing a clean README and demo",
        ],
        "milestones": [
            "Define project scope and user stories",
            "Design the main screens",
            "Build the frontend interface",
            "Connect the backend endpoint",
            "Test and prepare the final presentation",
        ],
        "learningResources": [
            {
                "gap": "SQL & Databases",
                "whyItMatters": "Many student projects need a database to store and organize information.",
                "platform": "DataCamp",
                "resourceTitle": "Introduction to SQL",
                "resourceUrl": "https://campus.datacamp.com/courses/introduction-to-sql",
                "difficulty": "Beginner",
                "estimatedTime": "6-8 hours",
                "nextStep": "Practice SELECT, WHERE, ORDER BY, and JOIN queries.",
            },
            {
                "gap": "HTML & CSS",
                "whyItMatters": "A clear frontend needs good page structure and styling.",
                "platform": "W3Schools",
                "resourceTitle": "HTML and CSS Tutorials",
                "resourceUrl": "https://www.w3schools.com/",
                "difficulty": "Beginner",
                "estimatedTime": "4-6 hours",
                "nextStep": "Build one simple page with a form, buttons, and cards.",
            },
        ],

        "portfolioKit": {
            "projectPitch": "A focused student project designed to solve one clear problem with a realistic first version.",
            "readmeOutline": [
                "Project title",
                "Problem statement",
                "Features",
                "Tech stack",
                "How to run",
                "Screenshots",
                "Future improvements",
            ],
            "nextBestStep": "Write three user stories and sketch the first screen before coding more features.",
        },
    }


def generate_project_plan(user_input):
    if os.getenv("USE_MOCK_LLM", "false").lower() == "true":
        return _mock_project_plan(user_input)

    response_language = _detect_response_language(user_input.get("projectIdea", ""))

    prompt = prompt_template.format(
        response_language=response_language,
        project_idea=user_input.get("projectIdea", ""),
        skills=user_input.get("skills") or "Not provided",
        technologies=user_input.get("technologies") or "Not provided",
        goal=user_input.get("goal") or "Not provided",
        project_type=user_input.get("projectType") or "General project",
        timeline=user_input.get("timeline") or "Not provided",
    )

    response = _get_model().invoke(prompt)
    response_text = _strip_code_fences(response.content)

    try:
        return json.loads(response_text)
    except json.JSONDecodeError as error:
        raise ValueError("The AI response was not valid JSON. Please try again.") from error
