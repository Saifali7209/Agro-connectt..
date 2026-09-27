from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import require_roles
from ..models import AiAnalysis, User
from ..schemas import ExpertSubmitRequest

router = APIRouter(prefix="/expert", tags=["expert"])


@router.get("/reviews/pending")
def pending_queue(user: User = Depends(require_roles("expert")), db: Session = Depends(get_db)):
    rows = db.query(AiAnalysis).filter(AiAnalysis.status == "pending_review").order_by(AiAnalysis.created_at.asc()).all()
    return [
        {
            "id": a.id, "farmer_id": a.farmer_id, "crop": a.crop_name,
            "diagnosis": a.diagnosis, "confidence": a.confidence, "created_at": a.created_at.isoformat(),
        }
        for a in rows
    ]


@router.get("/reviews/{analysis_id}")
def review_case(analysis_id: int, user: User = Depends(require_roles("expert"))
                 , db: Session = Depends(get_db)):
    a = db.query(AiAnalysis).get(analysis_id)
    if not a:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found.")
    return {
        "id": a.id, "farmer_id": a.farmer_id, "crop": a.crop_name, "diagnosis": a.diagnosis,
        "confidence": a.confidence, "status": a.status, "expert_notes": a.expert_notes,
        "created_at": a.created_at.isoformat(),
    }


@router.post("/reviews/{analysis_id}/submit")
def submit_review(analysis_id: int, payload: ExpertSubmitRequest, user: User = Depends(require_roles("expert")), db: Session = Depends(get_db)):
    a = db.query(AiAnalysis).get(analysis_id)
    if not a:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found.")
    if payload.condition:
        a.diagnosis = payload.condition
    notes_parts = [p for p in [
        f"Severity: {payload.severity}" if payload.severity else None,
        payload.advice,
        f"Follow-up: {payload.follow_up_days} days" if payload.follow_up_days else None,
    ] if p]
    a.expert_notes = " | ".join(notes_parts)
    a.expert_id = user.id
    a.status = "reviewed"
    db.commit()
    db.refresh(a)
    return {"message": "Review submitted.", "case": {
        "id": a.id, "diagnosis": a.diagnosis, "status": a.status, "expert_notes": a.expert_notes,
    }}


@router.get("/me")
def my_profile(user: User = Depends(require_roles("expert"))):
    return user.public_profile()
