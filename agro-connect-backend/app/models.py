import datetime
import json

from sqlalchemy import (
    Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
)
from sqlalchemy.orm import relationship

from .database import Base


def utcnow():
    return datetime.datetime.utcnow()


class User(Base):
    """
    One row per account, any role. Role-specific signup fields (village,
    business_name, qualification, etc.) vary a lot between roles, so rather
    than a wide, mostly-NULL column set they are kept as a small JSON blob
    in `profile_extra` and merged into the profile dict the frontend gets
    back from /auth/me and /auth/login.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # farmer | buyer | expert | admin
    status = Column(String, nullable=False, default="active")  # active | suspended
    verified = Column(Boolean, nullable=False, default=False)  # farmer verification (admin-set)
    profile_extra = Column(Text, nullable=False, default="{}")
    created_at = Column(DateTime, default=utcnow)

    crops = relationship("Crop", back_populates="farmer", cascade="all, delete-orphan")

    def extra(self) -> dict:
        try:
            return json.loads(self.profile_extra or "{}")
        except ValueError:
            return {}

    def public_profile(self) -> dict:
        base = {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "role": self.role,
            "status": self.status,
            "verified": self.verified,
        }
        base.update(self.extra())
        return base


class RefreshToken(Base):
    """
    An opaque, random, single-purpose token — never a JWT — stored server
    side so it can be looked up and revoked (on logout). This is what the
    httpOnly `refresh_token` cookie holds.
    """
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True)
    token = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    revoked = Column(Boolean, default=False)


class OtpCode(Base):
    __tablename__ = "otp_codes"

    id = Column(Integer, primary_key=True)
    phone = Column(String, index=True, nullable=False)
    code = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)


class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    variety = Column(String, default="")
    category = Column(String, default="")
    price = Column(Float, nullable=False)
    previous_price = Column(Float, nullable=True)
    unit = Column(String, default="kg")
    quantity = Column(Float, default=0)
    min_order = Column(Float, default=1)
    grade = Column(String, default="Grade A")
    organic = Column(Boolean, default=False)
    description = Column(Text, default="")
    location = Column(String, default="")
    harvest_date = Column(String, default="")
    images = Column(Text, default="[]")  # JSON list of image URLs/refs
    status = Column(String, default="active")  # active | sold | inactive
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    farmer = relationship("User", back_populates="crops")

    def to_dict(self) -> dict:
        images = json.loads(self.images or "[]")
        farmer_extra = self.farmer.extra() if self.farmer else {}
        return {
            "id": self.id,
            "farmer_id": self.farmer_id,
            "name": self.name,
            "variety": self.variety,
            "category": self.category,
            "price": self.price,
            "previous_price": self.previous_price,
            "unit": self.unit,
            "quantity": self.quantity,
            "min_order": self.min_order,
            "grade": self.grade,
            "organic": self.organic,
            "description": self.description,
            "location": self.location,
            "harvest_date": self.harvest_date,
            "images": images,
            "image": images[0] if images else None,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "farmer": {
                "id": self.farmer.id,
                "name": self.farmer.name,
                "verified": self.farmer.verified,
                "district": farmer_extra.get("district"),
                "state": farmer_extra.get("state"),
            } if self.farmer else None,
        }


class SavedCrop(Base):
    __tablename__ = "saved_crops"

    id = Column(Integer, primary_key=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)


class PriceHistoryEntry(Base):
    __tablename__ = "price_history"

    id = Column(Integer, primary_key=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    price = Column(Float, nullable=False)
    note = Column(String, default="")
    created_at = Column(DateTime, default=utcnow)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    status = Column(String, default="pending")  # pending|confirmed|shipped|delivered|cancelled
    delivery_address = Column(Text, default="")
    created_at = Column(DateTime, default=utcnow)

    def to_dict(self, db=None) -> dict:
        crop = db.query(Crop).get(self.crop_id) if db else None
        return {
            "id": self.id,
            "crop_id": self.crop_id,
            "crop_name": crop.name if crop else None,
            "farmer_id": self.farmer_id,
            "buyer_id": self.buyer_id,
            "quantity": self.quantity,
            "price": self.price,
            "status": self.status,
            "delivery_address": self.delivery_address,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class OrderEvent(Base):
    """One row per status change — powers GET /orders/{id}/timeline."""
    __tablename__ = "order_events"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    status = Column(String, nullable=False)
    note = Column(String, default="")
    created_at = Column(DateTime, default=utcnow)


class OrderOffer(Base):
    """A price-negotiation message on an order (Make an Offer)."""
    __tablename__ = "order_offers"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    from_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    price = Column(Float, nullable=False)
    message = Column(String, default="")
    created_at = Column(DateTime, default=utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    body = Column(String, default="")
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True)
    user_a_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_b_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=utcnow)


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utcnow)


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, default="")
    created_at = Column(DateTime, default=utcnow)


class KnowledgeArticle(Base):
    __tablename__ = "knowledge_articles"

    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    category = Column(String, default="")
    content = Column(Text, default="")
    author_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=utcnow)


class AiAnalysis(Base):
    """AI Crop Doctor submission + optional expert review."""
    __tablename__ = "ai_analyses"

    id = Column(Integer, primary_key=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop_name = Column(String, default="")
    diagnosis = Column(String, default="Pending analysis")
    confidence = Column(Float, default=0.0)
    status = Column(String, default="pending_review")  # pending_review | reviewed
    expert_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    expert_notes = Column(Text, default="")
    created_at = Column(DateTime, default=utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    detail = Column(String, default="")
    created_at = Column(DateTime, default=utcnow)


class Setting(Base):
    """Single-row-per-key store for admin settings (JSON-encoded values)."""
    __tablename__ = "settings"

    key = Column(String, primary_key=True)
    value = Column(Text, nullable=False, default="{}")
