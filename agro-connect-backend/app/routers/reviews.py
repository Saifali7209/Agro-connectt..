from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user, require_roles
from ..models import Review, User
from ..schemas import ReviewCreateRequest

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.get("")
def list_reviews(crop_id: Optional[int] = None, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(Review)
    if crop_id:
        query = query.filter(Review.crop_id == crop_id)
    else:
        query = query.filter(Review.author_id == user.id)
    rows = query.order_by(Review.created_at.desc()).all()
    return [
        {
            "id": r.id, "crop_id": r.crop_id, "order_id": r.order_id, "author_id": r.author_id,
            "rating": r.rating, "comment": r.comment, "created_at": r.created_at.isoformat(),
        }
        for r in rows
    ]


@router.post("", status_code=201)
def create_review(payload: ReviewCreateRequest, user: User = Depends(require_roles("buyer")), db: Session = Depends(get_db)):
    review = Review(
        crop_id=payload.crop_id, order_id=payload.order_id, author_id=user.id,
        rating=payload.rating, comment=payload.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return {
        "id": review.id, "crop_id": review.crop_id, "order_id": review.order_id,
        "rating": review.rating, "comment": review.comment, "created_at": review.created_at.isoformat(),
    }
