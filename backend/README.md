# IdeaDesk Backend

Simple FastAPI backend for the IdeaDesk Student Project Planner.



This backend receives project details from the frontend, formats them using LangChain, sends them to an LLM through Groq, and returns a structured JSON project plan response.

## Tech Used

- Python
- FastAPI
- LangChain
- Groq


## Setup

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows PowerShell:

```bash
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create your `.env` file:

```bash
copy .env.example .env
```

Open `.env` and add your Groq API key:

```text
GROQ_API_KEY=your_real_groq_key_here
GROQ_MODEL=llama-3.1-8b-instant
USE_MOCK_LLM=false
```


## Run The Backend

From inside the `backend` folder, run:

```bash
uvicorn main:app --reload
```

The API will run at:

```text
http://localhost:8000
```

Open the automatic API docs here:

```text
http://localhost:8000/docs
```

## Endpoint

### POST `/api/plans/generate`

Request body:

```json
{
  "projectIdea": "A rough student project idea",
  "skills": "Python, SQL, HTML, CSS",
  "technologies": "JavaScript, FastAPI",
  "goal": "Build a useful university project",
  "projectType": "Web App",
  "timeline": "Semester"
}
```

Response body:

```json
{
  "improvedIdea": "...",
  "mainFeatures": [],
  "suggestedTechStack": [],
  "teamRoles": [],
  "skillGaps": [],
  "milestones": [],
  "portfolioKit": {
    "projectPitch": "...",
    "readmeOutline": [],
    "nextBestStep": "..."
  }
}
```

## Frontend Connection

The frontend should send a POST request to:

```text
http://localhost:8000/api/plans/generate
```

The backend returns structured JSON data that is rendered into project planning cards on the frontend.