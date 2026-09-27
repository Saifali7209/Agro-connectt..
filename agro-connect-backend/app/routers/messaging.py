from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..database import get_db
from ..deps import get_current_user
from ..models import Conversation, Message, User
from ..schemas import MessageSendRequest

router = APIRouter(prefix="/messages", tags=["messaging"])


@router.get("/conversations")
def list_conversations(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    convos = (
        db.query(Conversation)
        .filter(or_(Conversation.user_a_id == user.id, Conversation.user_b_id == user.id))
        .order_by(Conversation.created_at.desc())
        .all()
    )
    out = []
    for c in convos:
        other_id = c.user_b_id if c.user_a_id == user.id else c.user_a_id
        other = db.query(User).get(other_id)
        last = (
            db.query(Message)
            .filter(Message.conversation_id == c.id)
            .order_by(Message.created_at.desc())
            .first()
        )
        out.append({
            "id": c.id,
            "with": {"id": other.id, "name": other.name, "role": other.role} if other else None,
            "last_message": last.text if last else None,
            "last_at": last.created_at.isoformat() if last else c.created_at.isoformat(),
        })
    return out


@router.post("/conversations")
def start_conversation(payload: dict, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    other_id = payload.get("user_id")
    other = db.query(User).get(other_id)
    if not other:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    existing = (
        db.query(Conversation)
        .filter(
            or_(
                (Conversation.user_a_id == user.id) & (Conversation.user_b_id == other_id),
                (Conversation.user_a_id == other_id) & (Conversation.user_b_id == user.id),
            )
        )
        .first()
    )
    if existing:
        return {"id": existing.id}

    convo = Conversation(user_a_id=user.id, user_b_id=other_id)
    db.add(convo)
    db.commit()
    db.refresh(convo)
    return {"id": convo.id}


def _thread_or_404(conversation_id: int, user: User, db: Session) -> Conversation:
    convo = db.query(Conversation).get(conversation_id)
    if not convo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")
    if user.id not in (convo.user_a_id, convo.user_b_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You don't have permission to do this.")
    return convo


@router.get("/conversations/{conversation_id}")
def get_thread(conversation_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _thread_or_404(conversation_id, user, db)
    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .all()
    )
    return [
        {"id": m.id, "sender_id": m.sender_id, "text": m.text, "created_at": m.created_at.isoformat()}
        for m in messages
    ]


@router.post("/conversations/{conversation_id}", status_code=status.HTTP_201_CREATED)
def send_message(conversation_id: int, payload: MessageSendRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _thread_or_404(conversation_id, user, db)
    message = Message(conversation_id=conversation_id, sender_id=user.id, text=payload.text)
    db.add(message)
    db.commit()
    db.refresh(message)
    return {"id": message.id, "sender_id": message.sender_id, "text": message.text, "created_at": message.created_at.isoformat()}
