import json
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..models import User, Resume
from ..schemas import ResumeParseResponse
from ..services.resume_parser import extract_text_from_pdf, parse_resume_content
from .auth import get_current_user

router = APIRouter(prefix="/resume", tags=["Resume"])

@router.post("/upload", response_model=ResumeParseResponse)
async def upload_resume(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    text_content = ""
    filename = "manual_profile_text.txt"

    if file:
        filename = file.filename
        content = await file.read()
        if filename.lower().endswith(".pdf"):
            text_content = extract_text_from_pdf(content)
        else:
            try:
                text_content = content.decode("utf-8")
            except Exception:
                text_content = str(content)
    elif raw_text:
        text_content = raw_text
    else:
        raise HTTPException(status_code=400, detail="Please upload a PDF resume or provide text")

    parsed = parse_resume_content(text_content)

    resume_entry = Resume(
        user_id=current_user.id,
        filename=filename,
        skills=json.dumps(parsed["skills"]),
        experience_years=parsed["experience_years"],
        projects_summary=parsed["projects_summary"],
        raw_text=text_content
    )
    db.add(resume_entry)
    db.commit()
    db.refresh(resume_entry)

    return {
        "id": resume_entry.id,
        "filename": filename,
        "skills": parsed["skills"],
        "experience_years": parsed["experience_years"],
        "projects_summary": parsed["projects_summary"],
        "extracted_text_preview": parsed["preview"]
    }

@router.get("/latest", response_model=Optional[ResumeParseResponse])
def get_latest_resume(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).first()
    if not resume:
        return None

    skills = []
    try:
        skills = json.loads(resume.skills)
    except Exception:
        skills = []

    return {
        "id": resume.id,
        "filename": resume.filename,
        "skills": skills,
        "experience_years": resume.experience_years,
        "projects_summary": resume.projects_summary,
        "extracted_text_preview": (resume.raw_text[:500] + "...") if resume.raw_text else ""
    }
