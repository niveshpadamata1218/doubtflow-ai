from sqlmodel import Session, select

from app.models.doubt_message import DoubtMessage
from app.models.doubt_thread import DoubtThread
from app.models.message import Message
from app.services.llm_service import generate_response


def create_doubt_thread(
    session: Session, parent_message_id: int, selected_text: str
) -> DoubtThread | None:
    if session.get(Message, parent_message_id) is None:
        return None

    thread = DoubtThread(
        parent_message_id=parent_message_id,
        selected_text=selected_text,
    )
    session.add(thread)
    session.commit()
    session.refresh(thread)
    return thread


def list_doubt_threads(session: Session, parent_message_id: int) -> list[DoubtThread]:
    return list(
        session.exec(
            select(DoubtThread)
            .where(DoubtThread.parent_message_id == parent_message_id)
            .order_by(DoubtThread.created_at, DoubtThread.id)
        ).all()
    )


def list_doubt_threads_for_conversation(
    session: Session, conversation_id: int
) -> list[DoubtThread]:
    return list(
        session.exec(
            select(DoubtThread)
            .join(Message, Message.id == DoubtThread.parent_message_id)
            .where(Message.conversation_id == conversation_id)
            .order_by(DoubtThread.created_at.desc(), DoubtThread.id.desc())
        ).all()
    )


def get_doubt_thread(session: Session, thread_id: int) -> DoubtThread | None:
    thread = session.get(DoubtThread, thread_id)
    if thread is None:
        return None

    thread.messages = list(
        session.exec(
            select(DoubtMessage)
            .where(DoubtMessage.doubt_thread_id == thread_id)
            .order_by(DoubtMessage.created_at, DoubtMessage.id)
        ).all()
    )
    return thread


def send_doubt_message(
    session: Session, thread_id: int, content: str
) -> tuple[DoubtMessage, DoubtMessage] | None:
    thread = session.get(DoubtThread, thread_id)
    if thread is None:
        return None

    user_message = DoubtMessage(
        doubt_thread_id=thread_id,
        role="user",
        content=content,
    )
    session.add(user_message)
    session.commit()
    session.refresh(user_message)

    history = list(
        session.exec(
            select(DoubtMessage)
            .where(DoubtMessage.doubt_thread_id == thread_id)
            .order_by(DoubtMessage.created_at, DoubtMessage.id)
        ).all()
    )
    prompt = [
        {
            "role": "system",
            "content": (
                "Answer using only the selected text below and this doubt thread. "
                f"Selected text: {thread.selected_text}"
            ),
        },
        *[{"role": message.role, "content": message.content} for message in history],
    ]
    assistant_content = generate_response(prompt)

    assistant_message = DoubtMessage(
        doubt_thread_id=thread_id,
        role="assistant",
        content=assistant_content,
    )
    session.add(assistant_message)
    session.commit()
    session.refresh(assistant_message)
    return user_message, assistant_message
