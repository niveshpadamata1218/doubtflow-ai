from datetime import datetime

from pydantic import ConfigDict, Field
from sqlmodel import SQLModel


class ConversationCreate(SQLModel):
    title: str = Field(default="New conversation", min_length=1, max_length=255)


class MessageCreate(SQLModel):
    content: str = Field(min_length=1)


class MessageRead(SQLModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    conversation_id: int
    role: str
    content: str
    created_at: datetime


class ConversationRead(SQLModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    created_at: datetime
    messages: list[MessageRead] = []


class ConversationSummary(SQLModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    created_at: datetime


class SendMessageResponse(SQLModel):
    user_message: MessageRead
    assistant_message: MessageRead
