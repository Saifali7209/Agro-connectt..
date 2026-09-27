import json
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import require_roles
from ..models import AuditLog, Crop, Order, Setting, User

router = APIRouter(prefix="/admin", tags=["admin"])

SETTINGS_KEY = "app_settings"
DEFAULT_SETTINGS = {"maintenance_mode": False, "allow_signups": True}


@router.get("/stats")
def stats(user: User = Depends(require_roles("admin")), db: Session = Depends(get_db)):
    return {
        "total_users": db.query(User).count(),
        "farmers": db.query(User).filter(User.role == "farmer").count(),
        "buyers": db.query(User).filter(User.role == "buyer").count(),
        "experts": db.query(User).filter(User.role == "expert").count(),
        "total_crops": db.query(Crop).count(),
        "active_crops": db.query(Crop).filter(Crop.status == "active").count(),
        "total_orders": db.query(Order).count(),
    }


@router.get("/reports")
def reports(period: Optional[str] = None, user: User = Depends(require_roles("admin")), db: Session = Depends(get_db)):
    orders = db.query(Order).all()
    by_status: dict = {}
    for o in orders:
        by_status[o.status] = by_status.get(o.status, 0) + 1
    return {"orders_by_status": by_status, "total_order_value": sum(o.price * o.quantity for o in orders)}


@router.get("/audit-logs")
def audit_logs(user: User = Depends(require_roles("admin")), db: Session = Depends(get_db)):
    rows = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(200).all()
    return [
        {"id": a.id, "actor_id": a.actor_id, "action": a.action, "detail": a.detail, "created_at": a.created_at.isoformat()}
        for a in rows
    ]


@router.get("/settings")
def get_settings(user: User = Depends(require_roles("admin")), db: Session = Depends(get_db)):
    row = db.query(Setting).get(SETTINGS_KEY)
    if not row:
        return DEFAULT_SETTINGS
    return json.loads(row.value)


@router.put("/settings")
def save_settings(payload: dict, user: User = Depends(require_roles("admin")), db: Session = Depends(get_db)):
    row = db.query(Setting).get(SETTINGS_KEY)
    merged = {**DEFAULT_SETTINGS, **(json.loads(row.value) if row else {}), **payload}
    if row:
        row.value = json.dumps(merged)
    else:
        db.add(Setting(key=SETTINGS_KEY, value=json.dumps(merged)))
    db.add(AuditLog(actor_id=user.id, action="update_settings", detail=json.dumps(payload)))
    db.commit()
    return merged
