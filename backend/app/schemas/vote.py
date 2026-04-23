"""Pydantic schemas for votes."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

from app.models.vote import VoteChoice


class VoteCreate(BaseModel):
    voter_name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=100,
        description="Optional. If provided, must match authenticated username.",
    )
    vote: VoteChoice


class VoteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    proposal_id: int
    voter_name: str
    vote: VoteChoice
    voted_at: datetime
