"""Proposal SQLAlchemy model."""
import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Enum, Text
from sqlalchemy.orm import relationship

from app.database import Base


class ProposalStatus(str, enum.Enum):
    active = "active"
    closed = "closed"
    expired = "expired"


class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False, default="")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    deadline = Column(DateTime, nullable=False)
    status = Column(Enum(ProposalStatus), nullable=False, default=ProposalStatus.active)

    votes = relationship("Vote", back_populates="proposal", cascade="all, delete-orphan")
