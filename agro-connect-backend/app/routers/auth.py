import datetime
import json

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..config import REFRESH_TOKEN_DAYS
from ..database import get_db
from ..deps import get_current_user
from ..models import OtpCode, RefreshToken, User
from ..schemas import (
    ForgotPasswordRequest,
    LoginRequest,
    OtpRequestRequest,
    OtpVerifyRequest,
    RegisterRequest,
    ResetPasswordRequest,
)
from ..security import (
    create_access_token,
    hash_password,
    new_otp_code,
    new_refresh_token,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])

REFRESH_COOKIE_NAME = "refresh_token"
KNOWN_FIELDS = {"role", "name", "phone", "email", "password"}


def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=False,  # local http dev; set True once served over https
        samesite="lax",
        max_age=REFRESH_TOKEN_DAYS * 24 * 60 * 60,
        path="/",
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(key=REFRESH_COOKIE_NAME, path="/")


def _issue_session(db: Session, response: Response, user: User) -> dict:
    access_token = create_access_token(user.id, user.role)

    refresh_value = new_refresh_token()
    db.add(RefreshToken(
        token=refresh_value,
        user_id=user.id,
        expires_at=datetime.datetime.utcnow() + datetime.timedelta(days=REFRESH_TOKEN_DAYS),
    ))
    db.commit()
    _set_refresh_cookie(response, refresh_value)

    return {"access_token": access_token, "token_type": "bearer", "user": user.public_profile()}


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(
        or_(User.email == payload.email, User.phone == payload.phone)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email or phone number already exists.",
        )

    extra = {k: v for k, v in payload.model_dump().items() if k not in KNOWN_FIELDS and v is not None}

    user = User(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        role=payload.role,
        profile_extra=json.dumps(extra),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Registration only creates the account — see AuthContext.jsx's `register()`,
    # which deliberately does not store the response as a session. No token
    # is issued here.
    return {"message": "Account created.", "user_id": user.id}


@router.post("/login")
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        or_(User.email == payload.identifier, User.phone == payload.identifier)
    ).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Those sign-in details weren't recognised.")
    if user.status != "active":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This account is not permitted to sign in.")

    return _issue_session(db, response, user)


@router.post("/refresh")
def refresh(
    response: Response,
    db: Session = Depends(get_db),
    refresh_token: str = Cookie(default=None, alias=REFRESH_COOKIE_NAME),
):
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No session to restore.")

    record = db.query(RefreshToken).filter(RefreshToken.token == refresh_token).first()
    if not record or record.revoked or record.expires_at < datetime.datetime.utcnow():
        _clear_refresh_cookie(response)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired. Please sign in again.")

    user = db.query(User).get(record.user_id)
    if not user or user.status != "active":
        _clear_refresh_cookie(response)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Account no longer available.")

    access_token = create_access_token(user.id, user.role)
    return {"access_token": access_token, "token_type": "bearer", "user": user.public_profile()}


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return user.public_profile()


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    response: Response,
    db: Session = Depends(get_db),
    refresh_token: str = Cookie(default=None, alias=REFRESH_COOKIE_NAME),
):
    if refresh_token:
        record = db.query(RefreshToken).filter(RefreshToken.token == refresh_token).first()
        if record:
            record.revoked = True
            db.commit()
    _clear_refresh_cookie(response)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/otp/request")
def request_otp(payload: OtpRequestRequest, db: Session = Depends(get_db)):
    code = new_otp_code()
    db.add(OtpCode(
        phone=payload.phone,
        code=code,
        expires_at=datetime.datetime.utcnow() + datetime.timedelta(minutes=10),
    ))
    db.commit()
    # There is no SMS provider hooked up in this dev backend, so the code is
    # printed to the server console instead of actually being sent anywhere.
    print(f"[Agro Connect] OTP for {payload.phone}: {code}")
    return {"message": "If that number is registered, a code has been sent."}


@router.post("/otp/verify")
def verify_otp(payload: OtpVerifyRequest, response: Response, db: Session = Depends(get_db)):
    record = (
        db.query(OtpCode)
        .filter(OtpCode.phone == payload.phone, OtpCode.code == payload.code, OtpCode.used.is_(False))
        .order_by(OtpCode.id.desc())
        .first()
    )
    if not record or record.expires_at < datetime.datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="That code could not be verified.")

    user = db.query(User).filter(User.phone == payload.phone).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="That code could not be verified.")

    record.used = True
    db.commit()
    return _issue_session(db, response, user)


@router.post("/password/forgot")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        or_(User.email == payload.identifier, User.phone == payload.identifier)
    ).first()
    if user:
        # A real deployment would email/SMS a reset link containing this
        # token. Here it's printed to the console so you can copy it into
        # the reset-password screen's URL (?token=...) while testing.
        token = create_access_token(user.id, "password-reset")
        print(f"[Agro Connect] Password reset token for {payload.identifier}: {token}")
    # Always return the same generic response, whether or not the account
    # exists — this is what stops the endpoint being used to check which
    # emails/phones are registered.
    return {"message": "If that account exists, reset instructions have been sent."}


@router.post("/password/reset")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    from ..security import decode_access_token

    data = decode_access_token(payload.token)
    if not data or data.get("role") != "password-reset":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This reset link is invalid or has expired.")

    user = db.query(User).get(int(data["sub"]))
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This reset link is invalid or has expired.")

    user.password_hash = hash_password(payload.password)
    db.commit()
    return {"message": "Password updated."}
