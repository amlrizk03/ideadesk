import json
import os

from dotenv import load_dotenv
from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq


load_dotenv()


prompt_template_str = """
You are a helpful university project mentor.

Turn the student's rough project idea into a clear, realistic, beginner-friendly
project plan. Generate a fresh plan based on the exact user input. Do not copy
the user's idea word-for-word; rewrite it into a more polished project concept.

Use the student's current skills and known technologies when suggesting the
tech stack. Avoid overly advanced tools unless necessary. Keep the plan practical
for the selected project type and timeline.

Keep the plan practical for the selected project type and timeline.

If the user writes in Turkish, return the entire JSON content in Turkish.
If the user writes in English, return the entire JSON content in English.
Match the language of the user's project idea.


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

The JSON must exactly match this structure:
{{
  "improvedIdea": "string",
  "mainFeatures": ["string"],
  "suggestedTechStack": ["string"],
  "teamRoles": ["string"],
  "skillGaps": ["string"],
  "milestones": ["string"],
  "portfolioKit": {{
    "projectPitch": "string",
    "readmeOutline": ["string"],
    "nextBestStep": "string"
  }}
}}
"""

prompt_template = PromptTemplate.from_template(prompt_template_str)


def _get_model():
    return ChatGroq(
        model=os.getenv("GROQ_MODEL", "llama-3.1-8b-instant"),
        temperature=0.7,
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
            f"A practical {project_type.lower()} concept based on the student's idea, "
            f"scoped for a {timeline.lower()} timeline and focused on one clear user problem."
        ),
        "mainFeatures": [
            "Clear dashboard for the main workflow",
            "Input form for collecting important user information",
            "Organized results or management area",
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

    prompt = prompt_template.format(
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
