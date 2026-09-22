from datetime import datetime

from pydantic import ConfigDict, Field
from sqlmodel import SQLModel


class DoubtThreadCreate(SQLModel):
    selected_text: str = Field(min_length=1)


class DoubtMessageCreate(SQLModel):
    content: str = Field(min_length=1)


class DoubtMessageRead(SQLModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    doubt_thread_id: int
    role: str
    content: str
    created_at: datetime


class DoubtThreadSummary(SQLModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    parent_message_id: int
    selected_text: str
    created_at: datetime


class DoubtThreadRead(DoubtThreadSummary):
    messages: list[DoubtMessageRead] = []


class DoubtMessageResponse(SQLModel):
    user_message: DoubtMessageRead
    assistant_message: DoubtMessageRead
