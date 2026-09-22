"""Create doubt threads and doubt messages tables.

Revision ID: 0002_doubts
Revises: 0001_chat
Create Date: 2026-09-22
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "0002_doubts"
down_revision: str | Sequence[str] | None = "0001_chat"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "doubt_thread",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("parent_message_id", sa.Integer(), nullable=False),
        sa.Column("selected_text", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["parent_message_id"], ["message.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "doubt_message",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("doubt_thread_id", sa.Integer(), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["doubt_thread_id"], ["doubt_thread.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("doubt_message")
    op.drop_table("doubt_thread")
