"""Proposal SQLAlchemy model."""
import enum
from datetime import datetime
from typing import List, TYPE_CHECKING

from sqlalchemy import DateTime, Enum, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.vote import Vote


class ProposalStatus(str, enum.Enum):
    active = "active"
    closed = "closed"
    expired = "expired"


class Proposal(Base):
    __tablename__ = "proposals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    deadline: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[ProposalStatus] = mapped_column(
        Enum(ProposalStatus),
        nullable=False,
        default=ProposalStatus.active,
    )

    votes: Mapped[List["Vote"]] = relationship(
        "Vote",
        back_populates="proposal",
        cascade="all, delete-orphan",
    )
