from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# Auth Schemas
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "candidate"
    college: Optional[str] = "Engineering Institute"
    branch: Optional[str] = "Computer Science"
    roll_number: Optional[str] = None
    target_role: Optional[str] = "Software Development Engineer"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    college: Optional[str]
    branch: Optional[str]
    roll_number: Optional[str]
    target_role: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Resume Schemas
class ResumeParseResponse(BaseModel):
    id: Optional[int] = None
    filename: str
    skills: List[str]
    experience_years: float
    projects_summary: str
    extracted_text_preview: str

# Interview Schemas
class InterviewStartRequest(BaseModel):
    role_title: str
    round_type: str = "Technical" # Technical, HR, Mix, Coding
    difficulty: str = "Fresher"    # Fresher, Mid, Senior
    total_questions: int = 5
    use_resume_context: bool = True
    custom_topics: Optional[str] = None

class QuestionItem(BaseModel):
    question_index: int
    question_text: str
    category: str
    expected_concepts: List[str]

class AnswerSubmitRequest(BaseModel):
    question_index: int
    user_answer: str
    audio_duration_seconds: Optional[float] = 0.0
    speech_detected_words: Optional[int] = 0

class QuestionEvaluation(BaseModel):
    question_index: int
    technical_score: float
    communication_score: float
    confidence_score: float
    feedback: str
    ideal_answer: str
    speech_metrics: Dict[str, Any]

class SessionReportResponse(BaseModel):
    session_id: str
    role_title: str
    round_type: str
    difficulty: str
    status: str
    overall_score: float
    technical_score: float
    communication_score: float
    confidence_score: float
    total_questions: int
    summary_feedback: str
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]
    questions_breakdown: List[Dict[str, Any]]
    created_at: datetime
    completed_at: Optional[datetime]
