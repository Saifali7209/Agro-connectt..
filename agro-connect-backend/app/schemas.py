from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    """
    The frontend sends `{ role, name, phone, email, password, ...roleFields }`
    where roleFields varies by role (village/district/... for a farmer,
    business_name/... for a buyer, qualification/... for an expert). Rather
    than declaring every one of those as a typed field, known fields are
    validated and anything else is accepted and stored as-is in
    `User.profile_extra` — see routers/auth.py.
    """
    model_config = ConfigDict(extra="allow")

    role: str
    name: str = Field(min_length=2)
    phone: str
    email: EmailStr
    password: str = Field(min_length=8)

    @field_validator("role")
    @classmethod
    def role_must_be_known(cls, v):
        if v not in {"farmer", "buyer", "expert"}:
            # Admin accounts are never created through public signup.
            raise ValueError("role must be one of: farmer, buyer, expert")
        return v


class LoginRequest(BaseModel):
    identifier: str
    password: str
    remember: bool = False


class OtpRequestRequest(BaseModel):
    phone: str


class OtpVerifyRequest(BaseModel):
    phone: str
    code: str


class ForgotPasswordRequest(BaseModel):
    identifier: str


class ResetPasswordRequest(BaseModel):
    token: str
    password: str = Field(min_length=8)
    confirm: Optional[str] = None


class CropCreateRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

    name: str
    variety: str = ""
    category: str = ""
    price: float
    unit: str = "kg"
    quantity: float = 0
    min_order: float = 1
    grade: str = "Grade A"
    organic: bool = False
    description: str = ""
    location: str = ""
    harvest_date: str = ""
    images: List[str] = []

    @field_validator("quantity", mode="before")
    @classmethod
    def blank_quantity(cls, v):
        return 0 if v == "" or v is None else v

    @field_validator("min_order", mode="before")
    @classmethod
    def blank_min_order(cls, v):
        return 1 if v == "" or v is None else v


class CropUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

    name: Optional[str] = None
    variety: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    unit: Optional[str] = None
    quantity: Optional[float] = None
    min_order: Optional[float] = None
    grade: Optional[str] = None
    organic: Optional[bool] = None
    description: Optional[str] = None
    location: Optional[str] = None
    harvest_date: Optional[str] = None
    images: Optional[List[str]] = None

    @field_validator("price", "quantity", "min_order", mode="before")
    @classmethod
    def blank_to_none(cls, v):
        return None if v == "" else v


class CropPriceRequest(BaseModel):
    price: float
    note: str = ""


class CropStatusRequest(BaseModel):
    status: str


class OrderCreateRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

    crop_id: int
    quantity: float
    price: Optional[float] = None
    delivery_address: str = ""
    address: Optional[str] = None  # actual field name sent by buyer-checkout.js
    delivery_mode: str = ""
    expected: str = ""
    note: str = ""
    offer_price: Optional[float] = None
    offer_note: str = ""

    @field_validator("price", "offer_price", mode="before")
    @classmethod
    def blank_to_none(cls, v):
        return None if v == "" else v


class OrderStatusRequest(BaseModel):
    status: str
    note: str = ""


class OrderOfferRequest(BaseModel):
    price: float
    message: str = ""


class MessageSendRequest(BaseModel):
    text: str


class ReviewCreateRequest(BaseModel):
    crop_id: Optional[int] = None
    order_id: Optional[int] = None
    rating: int = Field(ge=1, le=5)
    comment: str = ""


class KnowledgeCreateRequest(BaseModel):
    title: str
    category: str = ""
    content: str = ""


class UserStatusRequest(BaseModel):
    status: str


class UserRoleRequest(BaseModel):
    role: str


class FarmerVerifyRequest(BaseModel):
    model_config = ConfigDict(extra="allow")
    approved: bool = True
    note: str = ""


class InventoryAdjustRequest(BaseModel):
    quantity: float
    note: str = ""


class ExpertSubmitRequest(BaseModel):
    model_config = ConfigDict(extra="allow")
    decision: str = "approved"
    condition: str = ""
    severity: str = ""
    advice: str = ""
    follow_up_days: Optional[str] = None
