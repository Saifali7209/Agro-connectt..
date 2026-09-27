import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user, require_roles
from ..models import User
from ..schemas import FarmerVerifyRequest, UserRoleRequest, UserStatusRequest

router = APIRouter(tags=["users"])


# ---- Admin: all users ------------------------------------------------- #

@router.get("/users")
def list_users(role: Optional[str] = None, user: User = Depends(require_roles("admin")), db: Session = Depends(get_db)):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return [u.public_profile() for u in query.order_by(User.created_at.desc()).all()]


@router.get("/users/{user_id}")
def user_detail(user_id: int, user: User = Depends(require_roles("admin")), db: Session = Depends(get_db)):
    target = db.query(User).get(user_id)
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return target.public_profile()


@router.patch("/users/{user_id}/status")
def set_user_status(user_id: int, payload: UserStatusRequest, user: User = Depends(require_roles("admin")), db: Session = Depends(get_db)):
    target = db.query(User).get(user_id)
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    target.status = payload.status
    db.commit()
    return target.public_profile()


@router.patch("/users/{user_id}/role")
def set_user_role(user_id: int, payload: UserRoleRequest, user: User = Depends(require_roles("admin")), db: Session = Depends(get_db)):
    target = db.query(User).get(user_id)
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    target.role = payload.role
    db.commit()
    return target.public_profile()


# ---- Farmers ------------------------------------------------------------ #

@router.get("/farmers")
def list_farmers(db: Session = Depends(get_db)):
    """Public directory — used by the /farmers marketplace page."""
    farmers = db.query(User).filter(User.role == "farmer", User.status == "active").all()
    return [f.public_profile() for f in farmers]


@router.get("/farmers/me")
def my_farmer_profile(user: User = Depends(require_roles("farmer"))):
    return user.public_profile()


@router.put("/farmers/me")
def save_my_farmer_profile(payload: dict, user: User = Depends(require_roles("farmer")), db: Session = Depends(get_db)):
    extra = user.extra()
    extra.update(payload or {})
    user.profile_extra = json.dumps(extra)
    db.commit()
    db.refresh(user)
    return user.public_profile()


@router.get("/farmers/{farmer_id}")
def farmer_detail(farmer_id: int, db: Session = Depends(get_db)):
    target = db.query(User).filter(User.id == farmer_id, User.role == "farmer").first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farmer not found.")
    return target.public_profile()


@router.patch("/farmers/{farmer_id}/verification")
def verify_farmer(farmer_id: int, payload: FarmerVerifyRequest, user: User = Depends(require_roles("admin")), db: Session = Depends(get_db)):
    target = db.query(User).filter(User.id == farmer_id, User.role == "farmer").first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farmer not found.")
    target.verified = payload.approved
    db.commit()
    return target.public_profile()


# ---- Buyers --------------------------------------------------------------- #

@router.get("/buyers")
def list_buyers(user: User = Depends(require_roles("admin", "farmer")), db: Session = Depends(get_db)):
    buyers = db.query(User).filter(User.role == "buyer").all()
    return [b.public_profile() for b in buyers]


@router.get("/buyers/me")
def my_buyer_profile(user: User = Depends(require_roles("buyer"))):
    return user.public_profile()


@router.get("/buyers/{buyer_id}")
def buyer_detail(buyer_id: int, user: User = Depends(require_roles("admin")), db: Session = Depends(get_db)):
    target = db.query(User).filter(User.id == buyer_id, User.role == "buyer").first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Buyer not found.")
    return target.public_profile()
