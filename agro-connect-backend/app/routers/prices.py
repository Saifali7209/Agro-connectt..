from typing import Dict, List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import Crop, PriceHistoryEntry, User

router = APIRouter(prefix="/prices", tags=["prices"])


@router.get("/market")
def market(category: Optional[str] = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    query = db.query(Crop.category, func.avg(Crop.price), func.min(Crop.price), func.max(Crop.price)).filter(Crop.status == "active")
    if category:
        query = query.filter(Crop.category == category)
    rows = query.group_by(Crop.category).all()
    return [
        {"category": cat or "Uncategorised", "avg_price": round(avg, 2), "min_price": min_p, "max_price": max_p}
        for cat, avg, min_p, max_p in rows
    ]


@router.get("/history")
def history(crop_id: Optional[int] = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    query = db.query(PriceHistoryEntry)
    if crop_id:
        query = query.filter(PriceHistoryEntry.crop_id == crop_id)
    rows = query.order_by(PriceHistoryEntry.created_at.asc()).limit(200).all()
    return [
        {"crop_id": r.crop_id, "price": r.price, "note": r.note, "created_at": r.created_at.isoformat()}
        for r in rows
    ]


@router.get("/regional")
def regional(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Average active-listing price grouped by the farmer's state (from their profile)."""
    crops = db.query(Crop).filter(Crop.status == "active").all()
    buckets: Dict[str, List[float]] = {}
    for c in crops:
        state = (c.farmer.extra().get("state") if c.farmer else None) or "Unknown"
        buckets.setdefault(state, []).append(c.price)
    return [
        {"state": state, "avg_price": round(sum(prices) / len(prices), 2), "listings": len(prices)}
        for state, prices in buckets.items()
    ]
