"""
Password hashing: PBKDF2-HMAC-SHA256 via Python's stdlib `hashlib`. No
external dependency (bcrypt/passlib) is used on purpose — bcrypt's C
extension is a common install headache on Windows machines without build
tools, and this app has no need for it. PBKDF2 with a high iteration count
is a perfectly reasonable choice for this project's scope.

Access tokens: short-lived JWTs (HS256) carrying the user id and role.
Refresh tokens: opaque random strings stored in the database (see
models.RefreshToken) and handed to the browser only as an httpOnly cookie —
they are never JWTs and never readable by JavaScript.
"""
import base64
import datetime
import hashlib
import hmac
import os
import secrets
from typing import Optional

import jwt

from .config import SECRET_KEY, ACCESS_TOKEN_MINUTES

PBKDF2_ITERATIONS = 260_000


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${base64.b64encode(salt).decode()}${base64.b64encode(digest).decode()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        scheme, iterations, salt_b64, digest_b64 = stored.split("$")
        if scheme != "pbkdf2_sha256":
            return False
        salt = base64.b64decode(salt_b64)
        expected = base64.b64decode(digest_b64)
        actual = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, int(iterations))
        return hmac.compare_digest(actual, expected)
    except Exception:
        return False


def create_access_token(user_id: int, role: str) -> str:
    now = datetime.datetime.utcnow()
    payload = {
        "sub": str(user_id),
        "role": role,
        "iat": now,
        "exp": now + datetime.timedelta(minutes=ACCESS_TOKEN_MINUTES),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def decode_access_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except jwt.PyJWTError:
        return None


def new_refresh_token() -> str:
    return secrets.token_urlsafe(48)


def new_otp_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"
