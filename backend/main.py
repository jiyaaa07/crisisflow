import os
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

load_dotenv()

app = FastAPI(title="CrisisFlow API", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL = "gemini-3.5-flash"  # Keep the model that was working in this project.


class ReportInput(BaseModel):
    message: str = Field(min_length=5, max_length=3000)


class IncidentAnalysis(BaseModel):
    incident_type: Literal[
        "Flood", "Fire", "Medical", "Infrastructure",
        "Building Collapse", "Other"
    ]
    location: str
    people_affected: int = Field(ge=0)
    people_trapped: int = Field(ge=0)
    vulnerable_people: bool
    immediate_threat: bool
    infrastructure_damage: bool
    urgency: Literal["Critical", "High", "Medium", "Low"]
    resource_required: str
    summary: str
    evidence: list[str]
    missing_information: list[str]


class IncidentAnalysisResponse(BaseModel):
    success: bool
    incident: IncidentAnalysis
    priority_score: int
    priority: Literal["Critical", "High", "Medium", "Low"]
    recommended_action: str
    ai_model: str
    verification_status: str


def calculate_priority(data: IncidentAnalysis):
    score = 0
    if data.immediate_threat:
        score += 30
    score += min(data.people_affected * 2, 20)
    score += min(data.people_trapped * 7, 20)
    if data.vulnerable_people:
        score += 15
    if data.infrastructure_damage:
        score += 10
    score += {"Critical": 5, "High": 4, "Medium": 2, "Low": 0}[data.urgency]
    score = min(score, 100)
    if score >= 80:
        priority = "Critical"
    elif score >= 60:
        priority = "High"
    elif score >= 35:
        priority = "Medium"
    else:
        priority = "Low"
    return score, priority


@app.get("/")
def home():
    return {"message": "CrisisFlow API is running", "status": "online"}


@app.get("/health")
def health():
    return {"status": "healthy", "model": MODEL, "api_key_configured": bool(API_KEY)}


@app.post("/analyze", response_model=IncidentAnalysisResponse)
def analyze_report(report: ReportInput):
    if not API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key missing. Check backend/.env")

    prompt = f"""
You are the report-analysis engine for CrisisFlow, a disaster emergency coordination prototype.
Analyze the incoming report. Extract only information supported by the report. Do not invent a location, number of people, injuries, or damage.
If location is unknown, return exactly "Unknown". If a number of affected people is not stated, return 0.
Treat vulnerable people as true only when explicitly indicated. Distinguish reported events from verified facts.
Original emergency report:
{report.message}
"""

    try:
        client = genai.Client(api_key=API_KEY)
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=IncidentAnalysis,
                temperature=0.1,
            ),
        )
        if not response.text:
            raise ValueError("Gemini returned an empty response.")
        analysis = IncidentAnalysis.model_validate_json(response.text)
        score, priority = calculate_priority(analysis)
        return {
            "success": True,
            "incident": analysis.model_dump(),
            "priority_score": score,
            "priority": priority,
            "recommended_action": analysis.resource_required,
            "ai_model": MODEL,
            "verification_status": "Unverified - Human review required",
        }
    except Exception as error:
        error_text = str(error)
        print(f"Gemini error ({type(error).__name__}): {error_text}", flush=True)
        # Return a useful status without exposing credentials or internal details.
        if "429" in error_text or "RESOURCE_EXHAUSTED" in error_text:
            raise HTTPException(status_code=503, detail="Gemini rate limit reached. Wait briefly and try again.") from error
        if "503" in error_text or "UNAVAILABLE" in error_text:
            raise HTTPException(status_code=503, detail="Gemini is temporarily unavailable. Please retry shortly.") from error
        raise HTTPException(status_code=502, detail="AI analysis failed. Check backend logs and Gemini API access.") from error
