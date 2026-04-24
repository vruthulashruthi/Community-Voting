"""Routes for authentication."""
from fastapi import APIRouter, Request

from app.auth import authenticate_user
from app.schemas.auth import LoginRequest, LoginResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, request: Request) -> LoginResponse:
    client_host = request.client.host if request.client else "unknown"
    token, user = authenticate_user(payload.username, payload.password, client_host=client_host)
    return LoginResponse(access_token=token, user=user)
