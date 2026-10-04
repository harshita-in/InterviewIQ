from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any

from ..database import get_db
from ..models import User, InterviewSession, QuestionResponse
from .auth import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin / Recruiter Dashboard"])

@router.get("/stats")
def get_admin_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin authorization required")
    total_candidates = db.query(User).filter(User.role == "candidate").count()
    total_sessions = db.query(InterviewSession).count()
    completed_sessions = db.query(InterviewSession).filter(InterviewSession.status == "completed").all()

    if completed_sessions:
        avg_overall = round(sum(s.overall_score for s in completed_sessions) / len(completed_sessions), 1)
        avg_tech = round(sum(s.technical_score for s in completed_sessions) / len(completed_sessions), 1)
        avg_comm = round(sum(s.communication_score for s in completed_sessions) / len(completed_sessions), 1)
        avg_conf = round(sum(s.confidence_score for s in completed_sessions) / len(completed_sessions), 1)
        
        placement_ready = sum(1 for s in completed_sessions if s.overall_score >= 75)
        moderate = sum(1 for s in completed_sessions if 50 <= s.overall_score < 75)
        needs_work = sum(1 for s in completed_sessions if s.overall_score < 50)
    else:
        avg_overall = 0.0
        avg_tech = 0.0
        avg_comm = 0.0
        avg_conf = 0.0
        placement_ready = 0
        moderate = 0
        needs_work = 0

    return {
        "total_candidates": max(total_candidates, 1),
        "total_interviews": total_sessions,
        "completed_interviews": len(completed_sessions),
        "averages": {
            "overall": avg_overall,
            "technical": avg_tech,
            "communication": avg_comm,
            "confidence": avg_conf
        },
        "readiness_distribution": {
            "placement_ready": placement_ready,
            "moderate": moderate,
            "needs_work": needs_work
        }
    }

@router.get("/candidates")
def get_all_candidates_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin authorization required")
    candidates = db.query(User).all()
    result = []
    
    for c in candidates:
        sessions = db.query(InterviewSession).filter(InterviewSession.user_id == c.id).order_by(InterviewSession.created_at.desc()).all()
        last_score = sessions[0].overall_score if sessions else 0.0
        status = "Placement Ready" if last_score >= 75 else ("Developing" if last_score >= 50 else "Not Evaluated" if not sessions else "Needs Practice")
        
        result.append({
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "college": c.college,
            "branch": c.branch,
            "roll_number": c.roll_number or "N/A",
            "target_role": c.target_role,
            "interviews_count": len(sessions),
            "latest_score": last_score,
            "status": status,
            "last_active": sessions[0].created_at if sessions else c.created_at
        })

    return result
