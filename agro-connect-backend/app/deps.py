from typing import Iterable, Optional

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from .database import get_db
from .models import User
from .security import decode_access_token

__all__ = ["get_db", "get_current_user", "require_roles"]


def _extract_bearer_token(request: Request) -> Optional[str]:
    header = request.headers.get("authorization") or request.headers.get("Authorization")
    if not header or not header.lower().startswith("bearer "):
        return None
    return header[7:].strip()


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    """
    Raises 401 for anything wrong with the token — missing, malformed,
    expired, or pointing at a user that no longer exists. The frontend
    treats any 401 as "not signed in", which is exactly right here.
    """
    token = _extract_bearer_token(request)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token.")

    user = db.query(User).get(int(payload["sub"]))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Account no longer exists.")
    if user.status != "active":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This account is not permitted to sign in.")
    return user


def require_roles(*roles: Iterable[str]):
    """Dependency factory: require_roles("admin") or require_roles("farmer", "admin")."""

    def _dep(user: User = Depends(get_current_user)) -> User:
        if roles and user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You don't have permission to do this.")
        return user

    return _dep
