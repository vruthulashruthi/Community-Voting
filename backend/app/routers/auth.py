"""Routes for authentication."""
from fastapi import APIRouter

from app.auth import authenticate_user
from app.schemas.auth import LoginRequest, LoginResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    token, user = authenticate_user(payload.username, payload.password)
    return LoginResponse(access_token=token, user=user)
