"""initial schema

Revision ID: 0001
Revises:
Create Date: 2025-01-01 00:00:00
"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "proposals",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.current_timestamp()),
        sa.Column("deadline", sa.DateTime(), nullable=False),
        sa.Column(
            "status",
            sa.Enum("active", "closed", "expired", name="proposalstatus"),
            nullable=False,
            server_default="active",
        ),
    )
    op.create_index("ix_proposals_id", "proposals", ["id"])

    op.create_table(
        "votes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("proposal_id", sa.Integer(), sa.ForeignKey("proposals.id", ondelete="CASCADE"), nullable=False),
        sa.Column("voter_name", sa.String(length=100), nullable=False),
        sa.Column("vote", sa.Enum("yes", "no", "abstain", name="votechoice"), nullable=False),
        sa.Column("voted_at", sa.DateTime(), nullable=False, server_default=sa.func.current_timestamp()),
        sa.UniqueConstraint("proposal_id", "voter_name", name="uq_proposal_voter"),
    )
    op.create_index("ix_votes_id", "votes", ["id"])
    op.create_index("ix_votes_proposal_id", "votes", ["proposal_id"])


def downgrade() -> None:
    op.drop_index("ix_votes_proposal_id", table_name="votes")
    op.drop_index("ix_votes_id", table_name="votes")
    op.drop_table("votes")
    op.drop_index("ix_proposals_id", table_name="proposals")
    op.drop_table("proposals")
