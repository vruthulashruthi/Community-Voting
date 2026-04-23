"""Vote SQLAlchemy model."""
import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base


class VoteChoice(str, enum.Enum):
    yes = "yes"
    no = "no"
    abstain = "abstain"


class Vote(Base):
    __tablename__ = "votes"
    __table_args__ = (UniqueConstraint("proposal_id", "voter_name", name="uq_proposal_voter"),)

    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("proposals.id", ondelete="CASCADE"), nullable=False, index=True)
    voter_name = Column(String(100), nullable=False)
    vote = Column(Enum(VoteChoice), nullable=False)
    voted_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    proposal = relationship("Proposal", back_populates="votes")
