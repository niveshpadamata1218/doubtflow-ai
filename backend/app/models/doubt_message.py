from datetime import datetime, timezone

from sqlmodel import Field, Relationship, SQLModel


class DoubtMessage(SQLModel, table=True):
    __tablename__ = "doubt_message"

    id: int | None = Field(default=None, primary_key=True)
    doubt_thread_id: int = Field(foreign_key="doubt_thread.id")
    role: str = Field(max_length=20)
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    doubt_thread: "DoubtThread" = Relationship(back_populates="messages")


from app.models.doubt_thread import DoubtThread
