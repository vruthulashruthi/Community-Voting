"""JWT auth utilities for login and role-based authorization."""
from datetime import datetime, timedelta, timezone
import secrets
import time
from threading import Lock
from typing import Dict

import jwt
from jwt import InvalidTokenError

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.schemas.auth import UserContext
from app.settings import settings

security = HTTPBearer(auto_error=False)

# Demo user store for local development.
_USERS: Dict[str, Dict[str, str]] = {
    "admin": {"password": "admin123", "role": "admin"},
    "alice": {"password": "password", "role": "voter"},
    "bob": {"password": "password", "role": "voter"},
}

_FAILED_ATTEMPTS: Dict[str, list[float]] = {}
_LOCKED_UNTIL: Dict[str, float] = {}
_AUTH_STATE_LOCK = Lock()


def _attempt_key(username: str, client_host: str) -> str:
    """Build a stable key for login throttling and raises nothing."""
    return f"{username.strip().lower()}|{client_host.strip().lower()}"


def _prune_attempts(now: float, key: str) -> None:
    """Keep only recent failed attempts within the configured login window."""
    window_start = now - settings.auth_login_window_seconds
    attempts = [ts for ts in _FAILED_ATTEMPTS.get(key, []) if ts >= window_start]
    if attempts:
        _FAILED_ATTEMPTS[key] = attempts
    else:
        _FAILED_ATTEMPTS.pop(key, None)


def _ensure_not_locked(key: str) -> None:
    """Raise HTTPException when login key is currently locked out."""
    now = time.time()
    with _AUTH_STATE_LOCK:
        locked_until = _LOCKED_UNTIL.get(key)
        if locked_until is None:
            return
        if locked_until <= now:
            _LOCKED_UNTIL.pop(key, None)
            return
        remaining = max(1, int(locked_until - now))

    raise HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail=f"Too many failed login attempts. Try again in {remaining}s.",
    )


def _register_failed_attempt(key: str) -> None:
    """Record a failed login and apply lockout when threshold is reached."""
    now = time.time()
    with _AUTH_STATE_LOCK:
        _prune_attempts(now, key)
        attempts = _FAILED_ATTEMPTS.get(key, [])
        attempts.append(now)
        _FAILED_ATTEMPTS[key] = attempts

        if len(attempts) >= settings.auth_max_login_attempts:
            _LOCKED_UNTIL[key] = now + settings.auth_login_lockout_seconds
            _FAILED_ATTEMPTS.pop(key, None)


def _clear_auth_failures(key: str) -> None:
    """Clear login failures for a key after successful authentication."""
    with _AUTH_STATE_LOCK:
        _FAILED_ATTEMPTS.pop(key, None)
        _LOCKED_UNTIL.pop(key, None)

def _token_expiry() -> datetime:
    """Compute token expiry timestamp and raises nothing."""
    return datetime.now(timezone.utc) + timedelta(minutes=settings.auth_token_ttl_minutes)


def _build_token_payload(user: UserContext) -> dict[str, object]:
    """Create JWT payload for a user context and raises nothing."""
    return {
        "sub": user.username,
        "role": user.role,
        "exp": _token_expiry(),
        "iat": datetime.now(timezone.utc),
    }


def _create_access_token(user: UserContext) -> str:
    """Create signed JWT access token and raises token encoding errors."""
    payload = _build_token_payload(user)
    return jwt.encode(payload, settings.auth_secret_key, algorithm=settings.auth_algorithm)


def _decode_access_token(token: str) -> UserContext:
    """Decode a JWT token and raises HTTPException for invalid or expired tokens."""
    try:
        payload = jwt.decode(token, settings.auth_secret_key, algorithms=[settings.auth_algorithm])
    except InvalidTokenError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token") from e

    username = payload.get("sub")
    role = payload.get("role")
    if not isinstance(username, str) or not isinstance(role, str):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    return UserContext(username=username, role=role)


def authenticate_user(username: str, password: str, client_host: str = "unknown") -> tuple[str, UserContext]:
    normalized_username = username.strip()
    key = _attempt_key(normalized_username, client_host)
    _ensure_not_locked(key)

    record = _USERS.get(normalized_username)
    expected_password = record["password"] if record else "invalid-password-sentinel"
    is_valid_password = secrets.compare_digest(expected_password, password)

    if not record or not is_valid_password:
        _register_failed_attempt(key)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    _clear_auth_failures(key)
    user = UserContext(username=normalized_username, role=record["role"])
    token = _create_access_token(user)
    return token, user


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> UserContext:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    return _decode_access_token(credentials.credentials)


def require_admin(user: UserContext = Depends(get_current_user)) -> UserContext:
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin role required")
    return user
