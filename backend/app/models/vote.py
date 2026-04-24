"""Vote SQLAlchemy model."""
import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.proposal import Proposal


class VoteChoice(str, enum.Enum):
    yes = "yes"
    no = "no"
    abstain = "abstain"


class Vote(Base):
    __tablename__ = "votes"
    __table_args__ = (UniqueConstraint("proposal_id", "voter_name", name="uq_proposal_voter"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    proposal_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("proposals.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    voter_name: Mapped[str] = mapped_column(String(100), nullable=False)
    vote: Mapped[VoteChoice] = mapped_column(Enum(VoteChoice), nullable=False)
    voted_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    proposal: Mapped["Proposal"] = relationship("Proposal", back_populates="votes")
