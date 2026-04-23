"""Simple token-based auth for local development and challenge scope."""
import secrets
from typing import Dict

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.schemas.auth import UserContext

security = HTTPBearer(auto_error=False)

# Demo user store for local development.
_USERS: Dict[str, Dict[str, str]] = {
    "admin": {"password": "admin123", "role": "admin"},
    "alice": {"password": "password", "role": "voter"},
    "bob": {"password": "password", "role": "voter"},
}

_TOKENS: Dict[str, UserContext] = {}


def authenticate_user(username: str, password: str) -> tuple[str, UserContext]:
    record = _USERS.get(username.strip())
    if not record or record["password"] != password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    user = UserContext(username=username.strip(), role=record["role"])
    token = secrets.token_urlsafe(24)
    _TOKENS[token] = user
    return token, user


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> UserContext:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")

    user = _TOKENS.get(credentials.credentials)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return user


def require_admin(user: UserContext = Depends(get_current_user)) -> UserContext:
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin role required")
    return user
