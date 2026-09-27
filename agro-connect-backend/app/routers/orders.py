from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..database import get_db
from ..deps import get_current_user
from ..models import Crop, Notification, Order, OrderEvent, OrderOffer, User
from ..schemas import OrderCreateRequest, OrderOfferRequest, OrderStatusRequest

router = APIRouter(prefix="/orders", tags=["orders"])


def _order_or_404(order_id: int, db: Session) -> Order:
    order = db.query(Order).get(order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
    return order


def _assert_party(order: Order, user: User) -> None:
    if user.role == "admin":
        return
    if user.id not in (order.farmer_id, order.buyer_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You don't have permission to do this.")


@router.get("")
def list_orders(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role == "admin":
        query = db.query(Order)
    else:
        query = db.query(Order).filter(or_(Order.farmer_id == user.id, Order.buyer_id == user.id))
    orders = query.order_by(Order.created_at.desc()).all()
    return [o.to_dict(db) for o in orders]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreateRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != "buyer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only buyers can place orders.")

    crop = db.query(Crop).get(payload.crop_id)
    if not crop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crop not found.")
    if crop.status != "active":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This listing is no longer available.")

    price = payload.price if payload.price is not None else crop.price
    order = Order(
        crop_id=crop.id,
        farmer_id=crop.farmer_id,
        buyer_id=user.id,
        quantity=payload.quantity,
        price=price,
        delivery_address=payload.delivery_address or payload.address or "",
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    db.add(OrderEvent(order_id=order.id, status="pending", note="Order placed."))
    db.add(Notification(user_id=crop.farmer_id, title="New order received", body=f"{user.name} ordered {crop.name}."))

    if payload.offer_price:
        db.add(OrderOffer(order_id=order.id, from_user_id=user.id, price=payload.offer_price, message=payload.offer_note))
        order.status = "negotiating"
        db.add(OrderEvent(order_id=order.id, status="negotiating", note=f"Buyer offered ₹{payload.offer_price}."))
        db.add(Notification(
            user_id=crop.farmer_id,
            title="New price offer",
            body=f"{user.name} offered ₹{payload.offer_price}/{crop.unit} for {crop.name}.",
        ))

    db.commit()

    return order.to_dict(db)


@router.get("/{order_id}")
def order_detail(order_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = _order_or_404(order_id, db)
    _assert_party(order, user)
    return order.to_dict(db)


@router.patch("/{order_id}/status")
def set_order_status(order_id: int, payload: OrderStatusRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = _order_or_404(order_id, db)
    _assert_party(order, user)

    order.status = payload.status
    db.add(OrderEvent(order_id=order.id, status=payload.status, note=payload.note))

    notify_user_id = order.buyer_id if user.id == order.farmer_id else order.farmer_id
    db.add(Notification(
        user_id=notify_user_id,
        title=f"Order #{order.id} update",
        body=f"Status changed to {payload.status}." + (f" {payload.note}" if payload.note else ""),
    ))
    db.commit()
    db.refresh(order)
    return order.to_dict(db)


@router.get("/{order_id}/timeline")
def order_timeline(order_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = _order_or_404(order_id, db)
    _assert_party(order, user)
    events = db.query(OrderEvent).filter(OrderEvent.order_id == order_id).order_by(OrderEvent.created_at.asc()).all()
    return [{"status": e.status, "note": e.note, "created_at": e.created_at.isoformat()} for e in events]


@router.get("/{order_id}/offers")
def list_offers(order_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = _order_or_404(order_id, db)
    _assert_party(order, user)
    offers = db.query(OrderOffer).filter(OrderOffer.order_id == order_id).order_by(OrderOffer.created_at.asc()).all()
    return [
        {"from_user_id": o.from_user_id, "price": o.price, "message": o.message, "created_at": o.created_at.isoformat()}
        for o in offers
    ]


@router.post("/{order_id}/offers", status_code=status.HTTP_201_CREATED)
def make_offer(order_id: int, payload: OrderOfferRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = _order_or_404(order_id, db)
    _assert_party(order, user)

    db.add(OrderOffer(order_id=order.id, from_user_id=user.id, price=payload.price, message=payload.message))
    order.status = "negotiating"

    notify_user_id = order.buyer_id if user.id == order.farmer_id else order.farmer_id
    db.add(Notification(user_id=notify_user_id, title=f"New offer on order #{order.id}", body=f"₹{payload.price}: {payload.message}"))
    db.commit()
    db.refresh(order)
    return order.to_dict(db)
