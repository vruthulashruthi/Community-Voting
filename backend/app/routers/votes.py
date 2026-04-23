"""Routes for /votes."""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.schemas.auth import UserContext
from app.services import vote_service

router = APIRouter(prefix="/votes", tags=["votes"])


@router.delete("/{vote_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_vote(
    vote_id: int,
    db: Session = Depends(get_db),
    user: UserContext = Depends(get_current_user),
):
    vote_service.revoke_vote(db, vote_id, actor_name=user.username, is_admin=(user.role == "admin"))
    return None
