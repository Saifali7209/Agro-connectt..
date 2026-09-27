from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import require_roles
from ..models import Crop, User
from ..schemas import InventoryAdjustRequest

router = APIRouter(prefix="/inventory", tags=["inventory"])


@router.get("/summary")
def summary(user: User = Depends(require_roles("farmer")), db: Session = Depends(get_db)):
    crops = db.query(Crop).filter(Crop.farmer_id == user.id).all()
    total_quantity = sum(c.quantity for c in crops)
    total_value = sum(c.quantity * c.price for c in crops)
    low_stock = [c.to_dict() for c in crops if c.quantity <= 10 and c.status == "active"]
    return {
        "total_listings": len(crops),
        "active_listings": sum(1 for c in crops if c.status == "active"),
        "total_quantity": total_quantity,
        "total_value": total_value,
        "low_stock": low_stock,
    }


@router.patch("/{crop_id}")
def adjust(crop_id: int, payload: InventoryAdjustRequest, user: User = Depends(require_roles("farmer")), db: Session = Depends(get_db)):
    crop = db.query(Crop).get(crop_id)
    if not crop or crop.farmer_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crop not found.")
    crop.quantity = payload.quantity
    db.commit()
    db.refresh(crop)
    return crop.to_dict()
