"""Business logic for votes."""
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from app.models.proposal import ProposalStatus
from app.models.vote import Vote
from app.schemas.vote import VoteCreate
from app.services import proposal_service


def _validate_vote_target_is_active(db: Session, proposal_id: int) -> None:
    """Ensure proposal can accept votes and raises HTTPException when proposal is not active."""
    proposal = proposal_service.get_proposal(db, proposal_id)
    if proposal.status != ProposalStatus.active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot vote: proposal is {proposal.status.value}.",
        )


def _validate_vote_actor(payload: VoteCreate, actor_name: str) -> None:
    """Ensure optional voter_name matches actor and raises HTTPException on mismatch."""
    if payload.voter_name and payload.voter_name.strip() != actor_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="voter_name must match authenticated user.",
        )


def _ensure_vote_does_not_exist(db: Session, proposal_id: int, actor_name: str) -> None:
    """Prevent duplicate voter entries and raises HTTPException when a vote already exists."""
    existing = (
        db.query(Vote)
        .filter(Vote.proposal_id == proposal_id, Vote.voter_name == actor_name)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This voter has already cast a vote on this proposal.",
        )


def _persist_vote(db: Session, vote: Vote) -> None:
    """Commit a vote record and raises HTTPException when unique constraints fail."""
    db.add(vote)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=409, detail="Duplicate vote (race condition).") from e


def cast_vote(db: Session, proposal_id: int, payload: VoteCreate, actor_name: str) -> Vote:
    """Create a vote for an active proposal and raises HTTPException for validation or conflict failures."""
    _validate_vote_target_is_active(db, proposal_id)
    _validate_vote_actor(payload, actor_name)
    _ensure_vote_does_not_exist(db, proposal_id, actor_name)
    vote = Vote(proposal_id=proposal_id, voter_name=actor_name, vote=payload.vote)
    _persist_vote(db, vote)
    db.refresh(vote)
    return vote


def revoke_vote(db: Session, vote_id: int, actor_name: str, is_admin: bool = False) -> None:
    """Delete a vote on an active proposal and raises HTTPException for missing vote or authorization failures."""
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
