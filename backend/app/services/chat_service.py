from sqlmodel import Session, select

from app.models.conversation import Conversation
from app.models.message import Message
from app.services.llm_service import generate_response


def create_conversation(session: Session, title: str) -> Conversation:
    conversation = Conversation(title=title)
    session.add(conversation)
    session.commit()
    session.refresh(conversation)
    return conversation


def list_conversations(session: Session) -> list[Conversation]:
    return list(
        session.exec(
            select(Conversation).order_by(Conversation.created_at.desc(), Conversation.id.desc())
        ).all()
    )


def get_conversation(session: Session, conversation_id: int) -> Conversation | None:
    conversation = session.get(Conversation, conversation_id)
    if conversation is None:
        return None

    conversation.messages = list(
        session.exec(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at, Message.id)
        ).all()
    )
    return conversation


def send_message(
    session: Session, conversation_id: int, content: str
) -> tuple[Message, Message] | None:
    conversation = session.get(Conversation, conversation_id)
    if conversation is None:
        return None

    user_message = Message(
        conversation_id=conversation_id,
        role="user",
        content=content,
    )
    session.add(user_message)
    if conversation.title == "New conversation":
        conversation.title = content[:42]
        session.add(conversation)
    session.commit()
    session.refresh(user_message)

    history = list(
        session.exec(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at, Message.id)
        ).all()
    )
    assistant_content = generate_response(
        [{"role": message.role, "content": message.content} for message in history]
    )

    assistant_message = Message(
        conversation_id=conversation_id,
        role="assistant",
        content=assistant_content,
    )
    session.add(assistant_message)
    session.commit()
    session.refresh(assistant_message)
    return user_message, assistant_message
