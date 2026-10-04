import uuid
import json
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from ..database import get_db
from ..models import User, Resume, InterviewSession, QuestionResponse
from ..schemas import (
    InterviewStartRequest,
    AnswerSubmitRequest,
    QuestionEvaluation,
    SessionReportResponse
)
from ..services.interview_ai import (
    generate_interview_questions,
    evaluate_candidate_answer,
    aggregate_session_report
)
from .auth import get_current_user

router = APIRouter(prefix="/interviews", tags=["Interviews"])

@router.post("/start")
async def start_interview_session(
    req: InterviewStartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session_id = str(uuid.uuid4())
    
    # Check resume context if requested
    skills = []
    projects = ""
    if req.use_resume_context:
        latest_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).first()
        if latest_resume:
            try:
                skills = json.loads(latest_resume.skills)
                projects = latest_resume.projects_summary
            except Exception:
                pass

    # Generate questions
    questions_data = await generate_interview_questions(
        role_title=req.role_title,
        round_type=req.round_type,
        difficulty=req.difficulty,
        total_questions=req.total_questions,
        skills=skills,
        projects_summary=projects
    )

    # Save session
    session = InterviewSession(
        id=session_id,
        user_id=current_user.id,
        role_title=req.role_title,
        round_type=req.round_type,
        difficulty=req.difficulty,
        status="in_progress",
        total_questions=len(questions_data)
    )
    db.add(session)

    # Save questions
    for q in questions_data:
        qr = QuestionResponse(
            session_id=session_id,
            question_index=q["question_index"],
            question_text=q["question_text"],
            category=q.get("category", req.round_type),
            expected_concepts=json.dumps(q.get("expected_concepts", []))
        )
        db.add(qr)

    db.commit()

    return {
        "session_id": session_id,
        "role_title": session.role_title,
        "round_type": session.round_type,
        "difficulty": session.difficulty,
        "total_questions": len(questions_data),
        "questions": [
            {
                "question_index": q["question_index"],
                "question_text": q["question_text"],
                "category": q.get("category", req.round_type)
            }
            for q in questions_data
        ]
    }

@router.get("/{session_id}")
def get_session_details(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    questions = db.query(QuestionResponse).filter(QuestionResponse.session_id == session_id).order_by(QuestionResponse.question_index).all()
    
    return {
        "session_id": session.id,
        "role_title": session.role_title,
        "round_type": session.round_type,
        "difficulty": session.difficulty,
        "status": session.status,
        "total_questions": session.total_questions,
        "overall_score": session.overall_score,
        "questions": [
            {
                "question_index": q.question_index,
                "question_text": q.question_text,
                "category": q.category,
                "answered": bool(q.user_answer and q.user_answer.strip()),
                "user_answer": q.user_answer,
                "technical_score": q.technical_score,
                "communication_score": q.communication_score,
                "confidence_score": q.confidence_score,
                "feedback": q.feedback,
                "ideal_answer": q.ideal_answer
            }
            for q in questions
        ]
    }

@router.post("/{session_id}/answer", response_model=QuestionEvaluation)
async def submit_answer(
    session_id: str,
    req: AnswerSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    q = db.query(QuestionResponse).filter(
        QuestionResponse.session_id == session_id,
        QuestionResponse.question_index == req.question_index
    ).first()

    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    expected_concepts = []
    try:
        expected_concepts = json.loads(q.expected_concepts)
    except Exception:
        pass

    eval_result = await evaluate_candidate_answer(
        question_text=q.question_text,
        category=q.category,
        expected_concepts=expected_concepts,
        user_answer=req.user_answer,
        audio_duration_seconds=req.audio_duration_seconds
    )

    q.user_answer = req.user_answer
    q.audio_duration_seconds = req.audio_duration_seconds
    q.technical_score = eval_result["technical_score"]
    q.communication_score = eval_result["communication_score"]
    q.confidence_score = eval_result["confidence_score"]
    q.feedback = eval_result["feedback"]
    q.ideal_answer = eval_result["ideal_answer"]
    q.speech_metrics = json.dumps(eval_result.get("speech_metrics", {}))

    db.commit()

    return {
        "question_index": q.question_index,
        "technical_score": q.technical_score,
        "communication_score": q.communication_score,
        "confidence_score": q.confidence_score,
        "feedback": q.feedback,
        "ideal_answer": q.ideal_answer,
        "speech_metrics": eval_result.get("speech_metrics", {})
    }

@router.post("/{session_id}/complete", response_model=SessionReportResponse)
def complete_interview(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    questions = db.query(QuestionResponse).filter(QuestionResponse.session_id == session_id).order_by(QuestionResponse.question_index).all()
    
    responses_data = []
    for q in questions:
        responses_data.append({
            "technical_score": q.technical_score or 30.0,
            "communication_score": q.communication_score or 30.0,
            "confidence_score": q.confidence_score or 30.0
        })

    report = aggregate_session_report(responses_data)

    session.status = "completed"
    session.overall_score = report["overall_score"]
    session.technical_score = report["technical_score"]
    session.communication_score = report["communication_score"]
    session.confidence_score = report["confidence_score"]
    session.summary_feedback = report["summary_feedback"]
    session.strengths = json.dumps(report["strengths"])
    session.weaknesses = json.dumps(report["weaknesses"])
    session.recommendations = json.dumps(report["recommendations"])
    session.completed_at = datetime.datetime.utcnow()

    db.commit()

    breakdown = []
    for q in questions:
        metrics = {}
        try:
            metrics = json.loads(q.speech_metrics)
        except Exception:
            pass

        breakdown.append({
            "question_index": q.question_index,
            "question_text": q.question_text,
            "category": q.category,
            "user_answer": q.user_answer,
            "technical_score": q.technical_score,
            "communication_score": q.communication_score,
            "confidence_score": q.confidence_score,
            "feedback": q.feedback,
            "ideal_answer": q.ideal_answer,
            "speech_metrics": metrics
        })

    return {
        "session_id": session.id,
        "role_title": session.role_title,
        "round_type": session.round_type,
        "difficulty": session.difficulty,
        "status": session.status,
        "overall_score": session.overall_score,
        "technical_score": session.technical_score,
        "communication_score": session.communication_score,
        "confidence_score": session.confidence_score,
        "total_questions": session.total_questions,
        "summary_feedback": session.summary_feedback,
        "strengths": report["strengths"],
        "weaknesses": report["weaknesses"],
        "recommendations": report["recommendations"],
        "questions_breakdown": breakdown,
        "created_at": session.created_at,
        "completed_at": session.completed_at
    }

@router.get("/{session_id}/report", response_model=SessionReportResponse)
def get_session_report(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    questions = db.query(QuestionResponse).filter(QuestionResponse.session_id == session_id).order_by(QuestionResponse.question_index).all()
    
    strengths = []
    weaknesses = []
    recommendations = []
    try:
        strengths = json.loads(session.strengths)
        weaknesses = json.loads(session.weaknesses)
        recommendations = json.loads(session.recommendations)
    except Exception:
        pass

    breakdown = []
    for q in questions:
        metrics = {}
        try:
            metrics = json.loads(q.speech_metrics)
        except Exception:
            pass

        breakdown.append({
            "question_index": q.question_index,
            "question_text": q.question_text,
            "category": q.category,
            "user_answer": q.user_answer,
            "technical_score": q.technical_score,
            "communication_score": q.communication_score,
            "confidence_score": q.confidence_score,
            "feedback": q.feedback,
            "ideal_answer": q.ideal_answer,
            "speech_metrics": metrics
        })

    return {
        "session_id": session.id,
        "role_title": session.role_title,
        "round_type": session.round_type,
        "difficulty": session.difficulty,
        "status": session.status,
        "overall_score": session.overall_score,
        "technical_score": session.technical_score,
        "communication_score": session.communication_score,
        "confidence_score": session.confidence_score,
        "total_questions": session.total_questions,
        "summary_feedback": session.summary_feedback or "Completed session.",
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": recommendations,
        "questions_breakdown": breakdown,
        "created_at": session.created_at,
        "completed_at": session.completed_at
    }

@router.get("/history/all")
def get_user_interview_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == current_user.id
    ).order_by(InterviewSession.created_at.desc()).all()

    return [
        {
            "session_id": s.id,
            "role_title": s.role_title,
            "round_type": s.round_type,
            "difficulty": s.difficulty,
            "status": s.status,
            "overall_score": s.overall_score,
            "technical_score": s.technical_score,
            "communication_score": s.communication_score,
            "confidence_score": s.confidence_score,
            "total_questions": s.total_questions,
            "created_at": s.created_at,
            "completed_at": s.completed_at
        }
        for s in sessions
    ]
