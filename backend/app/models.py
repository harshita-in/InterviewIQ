import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    role = Column(String(20), default="candidate") # "candidate" or "admin" / "interviewer"
    college = Column(String(150), default="Engineering Institute")
    branch = Column(String(100), default="Computer Science")
    roll_number = Column(String(50), nullable=True)
    target_role = Column(String(100), default="Software Development Engineer")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("InterviewSession", back_populates="user", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    skills = Column(Text, default="[]")  # JSON string list
    experience_years = Column(Float, default=0.0)
    projects_summary = Column(Text, default="")
    raw_text = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="resumes")


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(String(50), primary_key=True, index=True) # UUID string
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role_title = Column(String(100), nullable=False)
    round_type = Column(String(50), default="Technical") # Technical, HR, Mix, Coding
    difficulty = Column(String(50), default="Fresher")    # Fresher, Mid, Senior
    status = Column(String(30), default="in_progress")   # in_progress, completed
    total_questions = Column(Integer, default=5)
    
    # Aggregated Evaluation Scores
    overall_score = Column(Float, default=0.0)
    technical_score = Column(Float, default=0.0)
    communication_score = Column(Float, default=0.0)
    confidence_score = Column(Float, default=0.0)
    
    summary_feedback = Column(Text, default="")
    strengths = Column(Text, default="[]")       # JSON string list
    weaknesses = Column(Text, default="[]")      # JSON string list
    recommendations = Column(Text, default="[]") # JSON string list
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="sessions")
    questions = relationship("QuestionResponse", back_populates="session", cascade="all, delete-orphan", order_by="QuestionResponse.question_index")


class QuestionResponse(Base):
    __tablename__ = "question_responses"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(50), ForeignKey("interview_sessions.id"), nullable=False)
    question_index = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=False)
    category = Column(String(50), default="Technical") # Technical, HR, Coding, Behavioral
    expected_concepts = Column(Text, default="[]") # JSON string list
    
    user_answer = Column(Text, default="")
    audio_duration_seconds = Column(Float, default=0.0)
    
    # Per-Question Evaluation
    technical_score = Column(Float, default=0.0)
    communication_score = Column(Float, default=0.0)
    confidence_score = Column(Float, default=0.0)
    feedback = Column(Text, default="")
    ideal_answer = Column(Text, default="")
    
    # Speech NLP metrics (filler count, wpm, sentiment)
    speech_metrics = Column(Text, default="{}") # JSON string
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    session = relationship("InterviewSession", back_populates="questions")
