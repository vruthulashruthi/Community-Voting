"""Business logic for proposals."""
from datetime import datetime, timezone
from typing import List, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.proposal import Proposal, ProposalStatus
from app.models.vote import Vote, VoteChoice
from app.schemas.proposal import ProposalCreate, VoteCounts


def _to_utc_naive(dt: datetime) -> datetime:
    """Normalize datetimes for safe comparisons against UTC now."""
    if dt.tzinfo is None:
        return dt
    return dt.astimezone(timezone.utc).replace(tzinfo=None)


def _refresh_status(db: Session, proposal: Proposal) -> Proposal:
    """If proposal is active but past deadline, mark expired and persist."""
    if proposal.status == ProposalStatus.active and _to_utc_naive(proposal.deadline) <= datetime.utcnow():
        proposal.status = ProposalStatus.expired
        db.add(proposal)
        db.commit()
        db.refresh(proposal)
    return proposal


def create_proposal(db: Session, payload: ProposalCreate) -> Proposal:
    deadline = payload.deadline_or_default()
    if _to_utc_naive(deadline) <= datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deadline must be in the future.",
        )
    proposal = Proposal(
        title=payload.title.strip(),
        description=payload.description,
        deadline=deadline,
        status=ProposalStatus.active,
    )
    db.add(proposal)
    db.commit()
    db.refresh(proposal)
    return proposal


def list_proposals(db: Session) -> List[Proposal]:
    proposals = db.query(Proposal).order_by(Proposal.created_at.desc()).all()
    for p in proposals:
        _refresh_status(db, p)
    return proposals


def get_proposal(db: Session, proposal_id: int) -> Proposal:
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return _refresh_status(db, proposal)


def compute_counts(db: Session, proposal_id: int) -> VoteCounts:
    votes = db.query(Vote).filter(Vote.proposal_id == proposal_id).all()
    counts = VoteCounts()
    for v in votes:
        if v.vote == VoteChoice.yes:
            counts.yes += 1
        elif v.vote == VoteChoice.no:
            counts.no += 1
        elif v.vote == VoteChoice.abstain:
            counts.abstain += 1
    counts.total = counts.yes + counts.no + counts.abstain
    return counts


def get_proposal_with_votes(db: Session, proposal_id: int) -> Tuple[Proposal, VoteCounts, List[Vote]]:
    proposal = get_proposal(db, proposal_id)
    counts = compute_counts(db, proposal_id)
    votes = db.query(Vote).filter(Vote.proposal_id == proposal_id).order_by(Vote.voted_at.desc()).all()
    return proposal, counts, votes


def close_proposal(db: Session, proposal_id: int) -> Proposal:
    proposal = get_proposal(db, proposal_id)
    if proposal.status == ProposalStatus.closed:
        raise HTTPException(status_code=400, detail="Proposal is already closed.")
    if proposal.status == ProposalStatus.expired:
        raise HTTPException(status_code=400, detail="Proposal already expired; cannot close.")
    proposal.status = ProposalStatus.closed
    db.add(proposal)
    db.commit()
    db.refresh(proposal)
    return proposal
