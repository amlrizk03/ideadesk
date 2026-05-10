from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from llm_service import generate_project_plan
from schemas import PlanRequest, PlanResponse


app = FastAPI(
    title="IdeaDesk API",
    description="Backend for generating student project plans with LangChain and Groq.",
    version="1.0.0",
)

allowed_origins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:5501",
    "http://127.0.0.1:5501",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "IdeaDesk API is running."}


@app.post("/api/plans/generate", response_model=PlanResponse)
def generate_plan(request: PlanRequest):
    try:
        print("Generating project plan...")
        plan = generate_project_plan(request.model_dump())
        print("Project plan generated successfully.")
        return plan
    except ValueError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error
    except Exception as error:
        print("IdeaDesk backend error:", repr(error))
        raise HTTPException(
            status_code=500,
            detail=(
                "The project plan could not be generated. "
                "Check that the backend is running, your Groq API key is valid, "
                "and your Groq account has available request quota."
            ),
        ) from error
