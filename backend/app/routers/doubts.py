from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.db.session import get_session
from app.schemas.doubt import (
    DoubtMessageCreate,
    DoubtMessageResponse,
    DoubtThreadCreate,
    DoubtThreadRead,
    DoubtThreadSummary,
)
from app.services.doubt_service import (
    create_doubt_thread,
    get_doubt_thread,
    list_doubt_threads,
    list_doubt_threads_for_conversation,
    send_doubt_message,
)

router = APIRouter(tags=["doubts"])


@router.get(
    "/conversations/{conversation_id}/doubts",
    response_model=list[DoubtThreadSummary],
)
def list_conversation_doubts_endpoint(
    conversation_id: int,
    session: Session = Depends(get_session),
) -> list[DoubtThreadSummary]:
    return list_doubt_threads_for_conversation(session, conversation_id)


@router.post(
    "/messages/{message_id}/doubts",
    response_model=DoubtThreadRead,
    status_code=status.HTTP_201_CREATED,
)
def create_doubt_endpoint(
    message_id: int,
    request: DoubtThreadCreate,
    session: Session = Depends(get_session),
) -> DoubtThreadRead:
    thread = create_doubt_thread(session, message_id, request.selected_text)
    if thread is None:
        raise HTTPException(status_code=404, detail="Parent message not found")
    return thread


@router.get(
    "/messages/{message_id}/doubts",
    response_model=list[DoubtThreadSummary],
)
def list_doubts_endpoint(
    message_id: int,
    session: Session = Depends(get_session),
) -> list[DoubtThreadSummary]:
    return list_doubt_threads(session, message_id)


@router.get(
    "/doubts/{thread_id}",
    response_model=DoubtThreadRead,
)
def get_doubt_endpoint(
    thread_id: int,
    session: Session = Depends(get_session),
) -> DoubtThreadRead:
    thread = get_doubt_thread(session, thread_id)
    if thread is None:
        raise HTTPException(status_code=404, detail="Doubt thread not found")
    return thread


@router.post(
    "/doubts/{thread_id}/messages",
    response_model=DoubtMessageResponse,
)
def send_doubt_endpoint(
    thread_id: int,
    request: DoubtMessageCreate,
    session: Session = Depends(get_session),
) -> DoubtMessageResponse:
    result = send_doubt_message(session, thread_id, request.content)
    if result is None:
        raise HTTPException(status_code=404, detail="Doubt thread not found")
    user_message, assistant_message = result
    return DoubtMessageResponse(
        user_message=user_message,
        assistant_message=assistant_message,
    )
