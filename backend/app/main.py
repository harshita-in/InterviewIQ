import datetime
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import engine, Base, SessionLocal
from .models import User, Resume, InterviewSession, QuestionResponse
from .routes.auth import router as auth_router, get_password_hash
from .routes.resume import router as resume_router
from .routes.interviews import router as interviews_router
from .routes.admin import router as admin_router

# Initialize tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="InterviewIQ – AI-Based Mock Interview and Performance Analyzer API"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(resume_router, prefix=settings.API_V1_STR)
app.include_router(interviews_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def seed_demo_data():
    """Seeds initial team candidate data from project presentation if empty."""
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        if user_count == 0:
            demo_users = [
                User(
                    name="Harshita Shrivastava",
                    email="harshita@aiml.edu",
                    hashed_password=get_password_hash("password123"),
                    role="candidate",
                    college="Engineering Institute",
                    branch="Computer Science",
                    roll_number="AIML-2026",
                    target_role="Machine Learning Engineer"
                ),
                User(
                    name="Ankush Tyagi",
                    email="ankush@aiml.edu",
                    hashed_password=get_password_hash("password123"),
                    role="candidate",
                    college="Engineering Institute",
                    branch="Computer Science",
                    roll_number="2401431530009",
                    target_role="Full Stack Developer"
                ),
                User(
                    name="Sofiya",
                    email="sofiya@aiml.edu",
                    hashed_password=get_password_hash("password123"),
                    role="candidate",
                    college="Engineering Institute",
                    branch="Computer Science",
                    roll_number="2401431530057",
                    target_role="Data Scientist"
                ),
                User(
                    name="Bhawana",
                    email="bhawana@aiml.edu",
                    hashed_password=get_password_hash("password123"),
                    role="candidate",
                    college="Engineering Institute",
                    branch="Computer Science",
                    roll_number="2401431530019",
                    target_role="AI Software Engineer"
                ),
                User(
                    name="Academic Evaluator / Recruiter",
                    email="admin@aiml.edu",
                    hashed_password=get_password_hash("admin123"),
                    role="admin",
                    college="Engineering Institute",
                    branch="Computer Science",
                    roll_number="FACULTY-01",
                    target_role="Project Evaluator"
                ),
            ]
            for u in demo_users:
                db.add(u)
            db.commit()

            # Seed a sample completed interview session for Harshita
            session_id = "demo-session-harshita-01"
            harshita = db.query(User).filter(User.email == "harshita@aiml.edu").first()
            if harshita:
                sample_session = InterviewSession(
                    id=session_id,
                    user_id=harshita.id,
                    role_title="Machine Learning Engineer",
                    round_type="Technical",
                    difficulty="Fresher",
                    status="completed",
                    total_questions=3,
                    overall_score=86.5,
                    technical_score=88.0,
                    communication_score=85.0,
                    confidence_score=87.0,
                    summary_feedback="Excellent grasp of core ML architectures. Demonstrated strong command over Transformer self-attention and data balancing techniques. Cadence and speech clarity were commendable.",
                    strengths=json.dumps([
                        "In-depth explanation of Transformer multi-head attention and Q, K, V mathematical vectors.",
                        "Clear articulation of SMOTE and class-weight balancing algorithms.",
                        "Confident speech cadence with negligible hesitation markers."
                    ]),
                    weaknesses=json.dumps([
                        "Could discuss real-time latency implications of large Transformer models on edge devices."
                    ]),
                    recommendations=json.dumps([
                        "Deep dive into TensorRT and ONNX runtime quantization for deployment rounds.",
                        "Continue practicing behavioral STAR responses for leadership rounds."
                    ]),
                    completed_at=datetime.datetime.utcnow()
                )
                db.add(sample_session)

                # Seed sample questions
                q1 = QuestionResponse(
                    session_id=session_id,
                    question_index=1,
                    question_text="How does the Self-Attention mechanism in Transformer architectures work compared to traditional RNNs?",
                    category="Deep Learning & NLP",
                    expected_concepts=json.dumps(["Query, Key, Value vectors", "Parallelization vs sequential recurrence", "Long-range dependency capture"]),
                    user_answer="In Transformers, self-attention allows all tokens to attend to each other simultaneously using Query, Key, and Value matrices. Unlike RNNs which suffer from sequential bottlenecks and vanishing gradients over long sequences, Transformers calculate pairwise attention weights using scaled dot-product attention in parallel.",
                    technical_score=92.0,
                    communication_score=90.0,
                    confidence_score=91.0,
                    feedback="Spot-on explanation. Clearly contrasted sequential computation vs parallelized attention matrix operations.",
                    ideal_answer="Self-attention projects input tokens into Query, Key, and Value spaces. Scaled dot-product softmax((Q*K^T)/sqrt(d_k))*V computes semantic relationships across the entire sequence concurrently, solving RNN sequential bottlenecks.",
                    speech_metrics=json.dumps({"word_count": 52, "wpm": 135, "filler_count": 0, "confidence_score": 91.0, "sentiment": "Highly Articulate & Confident"})
                )
                q2 = QuestionResponse(
                    session_id=session_id,
                    question_index=2,
                    question_text="How do you handle severe class imbalance in a classification dataset?",
                    category="Data Preprocessing",
                    expected_concepts=json.dumps(["SMOTE / Oversampling", "Undersampling", "Class weights", "Focal loss"]),
                    user_answer="For imbalanced data, we can use resampling techniques like SMOTE for minority classes or Random Undersampling. Algorithmic methods include adjusting class weights in the cross-entropy loss function or adopting Focal Loss.",
                    technical_score=85.0,
                    communication_score=82.0,
                    confidence_score=84.0,
                    feedback="Good overview of both sampling and cost-sensitive loss approaches.",
                    ideal_answer="Best practices combine stratified sampling, synthetic oversampling (SMOTE), weighted loss penalty on minority misclassifications, and evaluating with PR-AUC / F1 instead of simple accuracy.",
                    speech_metrics=json.dumps({"word_count": 42, "wpm": 128, "filler_count": 1, "confidence_score": 84.0, "sentiment": "Professional & Confident"})
                )
                db.add(q1)
                db.add(q2)
                db.commit()

    finally:
        db.close()

@app.get("/")
def root():
    return {
        "project": "InterviewIQ",
        "tagline": "AI-Based Mock Interview and Performance Analyzer",
        "type": "Full-Stack AI Application",
        "status": "Online",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.datetime.utcnow().isoformat()}
