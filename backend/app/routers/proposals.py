"""Routes for /proposals."""
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth import get_current_user, require_admin
from app.database import get_db
from app.schemas.auth import UserContext
from app.schemas.proposal import ProposalCreate, ProposalRead, ProposalDetail, VoteCounts
from app.schemas.vote import VoteCreate, VoteRead
from app.services import proposal_service, vote_service

router = APIRouter(prefix="/proposals", tags=["proposals"])


@router.post("/", response_model=ProposalRead, status_code=status.HTTP_201_CREATED)
def create_proposal(
    payload: ProposalCreate,
    db: Session = Depends(get_db),
    user: UserContext = Depends(get_current_user),
):
    return proposal_service.create_proposal(db, payload)


@router.get("/", response_model=List[ProposalRead])
def list_proposals(db: Session = Depends(get_db)):
    return proposal_service.list_proposals(db)


@router.get("/{proposal_id}", response_model=ProposalDetail)
def get_proposal(proposal_id: int, db: Session = Depends(get_db)):
    proposal, counts, votes = proposal_service.get_proposal_with_votes(db, proposal_id)
    return ProposalDetail(
        id=proposal.id,
        title=proposal.title,
        description=proposal.description,
        created_at=proposal.created_at,
        deadline=proposal.deadline,
        status=proposal.status,
        counts=counts,
        votes=[VoteRead.model_validate(v) for v in votes],
    )


@router.post("/{proposal_id}/vote", response_model=VoteRead, status_code=status.HTTP_201_CREATED)
def vote_on_proposal(
    proposal_id: int,
    payload: VoteCreate,
    db: Session = Depends(get_db),
    user: UserContext = Depends(get_current_user),
):
    return vote_service.cast_vote(db, proposal_id, payload, actor_name=user.username)


@router.patch("/{proposal_id}/close", response_model=ProposalRead)
def close_proposal(
    proposal_id: int,
    db: Session = Depends(get_db),
    user: UserContext = Depends(require_admin),
):
    return proposal_service.close_proposal(db, proposal_id)
