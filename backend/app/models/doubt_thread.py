from datetime import datetime, timezone

from sqlmodel import Field, Relationship, SQLModel


class DoubtThread(SQLModel, table=True):
    __tablename__ = "doubt_thread"

    id: int | None = Field(default=None, primary_key=True)
    parent_message_id: int = Field(foreign_key="message.id")
    selected_text: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    parent_message: "Message" = Relationship(back_populates="doubt_threads")
    messages: list["DoubtMessage"] = Relationship(back_populates="doubt_thread")


from app.models.doubt_message import DoubtMessage
from app.models.message import Message
