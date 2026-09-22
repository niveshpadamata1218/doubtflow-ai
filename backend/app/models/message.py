from datetime import datetime, timezone

from sqlmodel import Field, Relationship, SQLModel


class Message(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversation.id")
    role: str = Field(max_length=20)
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    conversation: "Conversation" = Relationship(back_populates="messages")
    doubt_threads: list["DoubtThread"] = Relationship(back_populates="parent_message")


from app.models.conversation import Conversation
from app.models.doubt_thread import DoubtThread
