"""Pydantic schemas for proposals."""
from datetime import datetime, timedelta
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

from app.models.proposal import ProposalStatus
from .vote import VoteRead


class ProposalCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="", max_length=5000)
    deadline: Optional[datetime] = Field(
        default=None,
        description="Deadline timestamp. If omitted, defaults to 2 days from creation.",
    )

    def deadline_or_default(self) -> datetime:
        return self.deadline or (datetime.utcnow() + timedelta(days=2))


class ProposalRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    created_at: datetime
    deadline: datetime
    status: ProposalStatus


class VoteCounts(BaseModel):
    yes: int = 0
    no: int = 0
    abstain: int = 0
    total: int = 0


class ProposalDetail(ProposalRead):
    counts: VoteCounts
    votes: List[VoteRead] = []
    can_view_votes: bool = False
