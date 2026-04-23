"""Business logic for votes."""
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from app.models.proposal import ProposalStatus
from app.models.vote import Vote
from app.schemas.vote import VoteCreate
from app.services import proposal_service


def cast_vote(db: Session, proposal_id: int, payload: VoteCreate, actor_name: str) -> Vote:
    proposal = proposal_service.get_proposal(db, proposal_id)  # refreshes status
    if proposal.status != ProposalStatus.active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot vote: proposal is {proposal.status.value}.",
        )

    if payload.voter_name and payload.voter_name.strip() != actor_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="voter_name must match authenticated user.",
        )

    voter_name = actor_name

    existing = (
        db.query(Vote)
        .filter(Vote.proposal_id == proposal_id, Vote.voter_name == voter_name)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This voter has already cast a vote on this proposal.",
        )

    vote = Vote(
        proposal_id=proposal_id,
        voter_name=voter_name,
        vote=payload.vote,
    )
    db.add(vote)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Duplicate vote (race condition).")
    db.refresh(vote)
    return vote


def revoke_vote(db: Session, vote_id: int, actor_name: str, is_admin: bool = False) -> None:
    vote = db.query(Vote).filter(Vote.id == vote_id).first()
    if not vote:
        raise HTTPException(status_code=404, detail="Vote not found")

    proposal = proposal_service.get_proposal(db, vote.proposal_id)  # refreshes
    if proposal.status != ProposalStatus.active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot revoke: proposal is {proposal.status.value}.",
        )

    if not is_admin and vote.voter_name != actor_name:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only revoke your own vote.",
        )

    db.delete(vote)
    db.commit()
