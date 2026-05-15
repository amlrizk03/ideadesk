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

        user_data = request.model_dump()
        plan = generate_project_plan(user_data)

        print("Project plan generated successfully.")
        return plan

    except ValueError as error:
        print("AI returned invalid data:", error)
        raise HTTPException(
            status_code=502,
            detail="The AI response was not valid. Please try again."
        )

    except Exception as error:
        print("Backend error:", error)
        raise HTTPException(
            status_code=500,
            detail="Something went wrong while generating the project plan."
        )
