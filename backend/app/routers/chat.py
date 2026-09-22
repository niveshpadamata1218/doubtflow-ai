from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.db.session import get_session
from app.schemas.chat import (
    ConversationCreate,
    ConversationRead,
    ConversationSummary,
    MessageCreate,
    SendMessageResponse,
)
from app.services.chat_service import (
    create_conversation,
    get_conversation,
    send_message,
    list_conversations,
)

router = APIRouter(tags=["chat"])


@router.get("/conversations", response_model=list[ConversationSummary])
def list_conversations_endpoint(
    session: Session = Depends(get_session),
) -> list[ConversationSummary]:
    return list_conversations(session)


@router.post(
    "/conversations",
    response_model=ConversationRead,
    status_code=status.HTTP_201_CREATED,
)
def create_conversation_endpoint(
    request: ConversationCreate,
    session: Session = Depends(get_session),
) -> ConversationRead:
    return create_conversation(session, request.title)


@router.post(
    "/conversations/{conversation_id}/messages",
    response_model=SendMessageResponse,
)
def send_message_endpoint(
    conversation_id: int,
    request: MessageCreate,
    session: Session = Depends(get_session),
) -> SendMessageResponse:
    result = send_message(session, conversation_id, request.content)
    if result is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    user_message, assistant_message = result
    return SendMessageResponse(
        user_message=user_message,
        assistant_message=assistant_message,
    )


@router.get(
    "/conversations/{conversation_id}",
    response_model=ConversationRead,
)
def get_conversation_endpoint(
    conversation_id: int,
    session: Session = Depends(get_session),
) -> ConversationRead:
    conversation = get_conversation(session, conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation
