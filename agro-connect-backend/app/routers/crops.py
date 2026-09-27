import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user, require_roles
from ..models import Crop, PriceHistoryEntry, SavedCrop, User
from ..schemas import CropCreateRequest, CropPriceRequest, CropStatusRequest, CropUpdateRequest

router = APIRouter(prefix="/crops", tags=["crops"])


def _apply_filters(query, q, category, state, min_price, max_price, organic):
    if q:
        like = f"%{q}%"
        query = query.filter(Crop.name.ilike(like) | Crop.variety.ilike(like) | Crop.category.ilike(like))
    if category:
        query = query.filter(Crop.category == category)
    if min_price is not None:
        query = query.filter(Crop.price >= min_price)
    if max_price is not None:
        query = query.filter(Crop.price <= max_price)
    if organic is not None:
        query = query.filter(Crop.organic == organic)
    return query


@router.get("/catalog")
def catalog(db: Session = Depends(get_db)):
    """Public, unfiltered browse view — active listings only."""
    crops = db.query(Crop).filter(Crop.status == "active").order_by(Crop.created_at.desc()).limit(60).all()
    return [c.to_dict() for c in crops]


@router.get("")
def search_crops(
    q: Optional[str] = None,
    category: Optional[str] = None,
    state: Optional[str] = None,
    min_price: Optional[float] = Query(default=None, alias="minPrice"),
    max_price: Optional[float] = Query(default=None, alias="maxPrice"),
    organic: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Crop).filter(Crop.status == "active")
    query = _apply_filters(query, q, category, state, min_price, max_price, organic)
    crops = query.order_by(Crop.created_at.desc()).limit(200).all()
    return [c.to_dict() for c in crops]


@router.get("/mine")
def my_crops(user: User = Depends(require_roles("farmer")), db: Session = Depends(get_db)):
    crops = db.query(Crop).filter(Crop.farmer_id == user.id).order_by(Crop.created_at.desc()).all()
    return [c.to_dict() for c in crops]


@router.get("/saved")
def saved_crops(user: User = Depends(require_roles("buyer")), db: Session = Depends(get_db)):
    rows = db.query(SavedCrop).filter(SavedCrop.buyer_id == user.id).all()
    crop_ids = [r.crop_id for r in rows]
    crops = db.query(Crop).filter(Crop.id.in_(crop_ids)).all() if crop_ids else []
    return [c.to_dict() for c in crops]


@router.post("/saved", status_code=status.HTTP_201_CREATED)
def save_crop(payload: dict, user: User = Depends(require_roles("buyer")), db: Session = Depends(get_db)):
    crop_id = payload.get("crop_id")
    crop = db.query(Crop).get(crop_id)
    if not crop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crop not found.")
    exists = db.query(SavedCrop).filter(SavedCrop.buyer_id == user.id, SavedCrop.crop_id == crop_id).first()
    if not exists:
        db.add(SavedCrop(buyer_id=user.id, crop_id=crop_id))
        db.commit()
    return {"message": "Saved."}


@router.get("/{crop_id}")
def crop_detail(crop_id: int, db: Session = Depends(get_db)):
    crop = db.query(Crop).get(crop_id)
    if not crop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crop not found.")
    return crop.to_dict()


CROP_WRITABLE_FIELDS = [
    "name", "variety", "category", "price", "unit", "quantity",
    "min_order", "grade", "organic", "description", "location", "harvest_date",
]


def _coerce_crop_fields(data: dict) -> dict:
    """
    Keep only real Crop columns. The actual Add Crop form (see
    farmer-add-crop.js) also submits a few fields with no matching column —
    state, district, available_from, delivery — because the form was ported
    from the old HTML build almost as-is. Rather than rejecting the request
    over fields the UI still happens to send, this quietly keeps what maps
    to a real column and folds state/district into `location`.
    """
    out = {k: data[k] for k in CROP_WRITABLE_FIELDS if k in data and data[k] is not None}
    if "location" not in out:
        parts = [p for p in (data.get("district"), data.get("state")) if p]
        if parts:
            out["location"] = ", ".join(parts)
    return out


@router.post("", status_code=status.HTTP_201_CREATED)
def create_crop(payload: CropCreateRequest, user: User = Depends(require_roles("farmer")), db: Session = Depends(get_db)):
    import json as _json

    data = _coerce_crop_fields(payload.model_dump())
    if not data.get("name") or data.get("price") is None:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="name and price are required.")
    crop = Crop(farmer_id=user.id, images=_json.dumps(payload.images or []), **data)
    db.add(crop)
    db.commit()
    db.refresh(crop)
    return crop.to_dict()


def _owned_crop_or_404(crop_id: int, user: User, db: Session) -> Crop:
    crop = db.query(Crop).get(crop_id)
    if not crop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crop not found.")
    if crop.farmer_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You don't have permission to do this.")
    return crop


@router.put("/{crop_id}")
def update_crop(crop_id: int, payload: CropUpdateRequest, user: User = Depends(require_roles("farmer")), db: Session = Depends(get_db)):
    import json as _json

    crop = _owned_crop_or_404(crop_id, user, db)
    raw = payload.model_dump(exclude_unset=True)
    updates = _coerce_crop_fields(raw)
    for key, value in updates.items():
        setattr(crop, key, value)
    if raw.get("images") is not None:
        crop.images = _json.dumps(raw["images"])
    db.commit()
    db.refresh(crop)
    return crop.to_dict()


@router.delete("/{crop_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_crop(crop_id: int, user: User = Depends(require_roles("farmer")), db: Session = Depends(get_db)):
    crop = _owned_crop_or_404(crop_id, user, db)
    db.delete(crop)
    db.commit()
    return None


@router.put("/{crop_id}/price")
def update_price(crop_id: int, payload: CropPriceRequest, user: User = Depends(require_roles("farmer")), db: Session = Depends(get_db)):
    crop = _owned_crop_or_404(crop_id, user, db)
    crop.previous_price = crop.price
    crop.price = payload.price
    db.add(PriceHistoryEntry(crop_id=crop.id, price=payload.price, note=payload.note))
    db.commit()
    db.refresh(crop)
    return crop.to_dict()


@router.get("/{crop_id}/price-history")
def price_history(crop_id: int, db: Session = Depends(get_db)):
    rows = (
        db.query(PriceHistoryEntry)
        .filter(PriceHistoryEntry.crop_id == crop_id)
        .order_by(PriceHistoryEntry.created_at.asc())
        .all()
    )
    return [
        {"price": r.price, "note": r.note, "created_at": r.created_at.isoformat()}
        for r in rows
    ]


@router.patch("/{crop_id}/status")
def set_status(crop_id: int, payload: CropStatusRequest, user: User = Depends(require_roles("farmer")), db: Session = Depends(get_db)):
    crop = _owned_crop_or_404(crop_id, user, db)
    crop.status = payload.status
    db.commit()
    db.refresh(crop)
    return crop.to_dict()


@router.post("/{crop_id}/images")
def upload_images(crop_id: int, user: User = Depends(require_roles("farmer")), db: Session = Depends(get_db)):
    # File storage is intentionally out of scope for this dev backend (no
    # object storage configured). The endpoint exists so the upload step in
    # the UI gets a real response instead of a 404; wire in real storage
    # (S3, local disk, etc.) here when you're ready to serve real images.
    crop = _owned_crop_or_404(crop_id, user, db)
    return {"message": "Image upload isn't wired to storage yet.", "crop": crop.to_dict()}
