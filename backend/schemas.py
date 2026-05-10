from typing import List, Optional

from pydantic import BaseModel, Field


class PlanRequest(BaseModel):
    projectIdea: str = Field(..., min_length=1)
    skills: Optional[str] = ""
    technologies: Optional[str] = ""
    goal: Optional[str] = ""
    projectType: Optional[str] = ""
    timeline: Optional[str] = ""


class PortfolioKit(BaseModel):
    projectPitch: str
    readmeOutline: List[str]
    nextBestStep: str


class PlanResponse(BaseModel):
    improvedIdea: str
    mainFeatures: List[str]
    suggestedTechStack: List[str]
    teamRoles: List[str]
    skillGaps: List[str]
    milestones: List[str]
    portfolioKit: PortfolioKit
