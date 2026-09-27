"""
Reads .env (if present) and environment variables. No secret is hardcoded.
"""
import os
from pathlib import Path

# Minimal .env loader (no extra dependency needed for something this small).
_ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
if _ENV_PATH.exists():
    for line in _ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip())

SECRET_KEY = os.environ.get("SECRET_KEY", "dev-only-secret-change-me")
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./agro_connect.db")
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")
ACCESS_TOKEN_MINUTES = int(os.environ.get("ACCESS_TOKEN_MINUTES", "30"))
REFRESH_TOKEN_DAYS = int(os.environ.get("REFRESH_TOKEN_DAYS", "30"))
