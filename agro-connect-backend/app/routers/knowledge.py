from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user, require_roles
from ..models import KnowledgeArticle, User
from ..schemas import KnowledgeCreateRequest

router = APIRouter(prefix="/knowledge", tags=["knowledge"])


@router.get("")
def list_articles(db: Session = Depends(get_db)):
    rows = db.query(KnowledgeArticle).order_by(KnowledgeArticle.created_at.desc()).all()
    return [
        {"id": a.id, "title": a.title, "category": a.category, "created_at": a.created_at.isoformat()}
        for a in rows
    ]


@router.get("/{article_id}")
def get_article(article_id: int, db: Session = Depends(get_db)):
    a = db.query(KnowledgeArticle).get(article_id)
    if not a:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found.")
    return {
        "id": a.id, "title": a.title, "category": a.category, "content": a.content,
        "created_at": a.created_at.isoformat(),
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def create_article(payload: KnowledgeCreateRequest, user: User = Depends(require_roles("admin", "expert")), db: Session = Depends(get_db)):
    article = KnowledgeArticle(title=payload.title, category=payload.category, content=payload.content, author_id=user.id)
    db.add(article)
    db.commit()
    db.refresh(article)
    return {"id": article.id, "title": article.title, "category": article.category}


@router.put("/{article_id}")
def update_article(article_id: int, payload: KnowledgeCreateRequest, user: User = Depends(require_roles("admin", "expert")), db: Session = Depends(get_db)):
    a = db.query(KnowledgeArticle).get(article_id)
    if not a:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found.")
    a.title, a.category, a.content = payload.title, payload.category, payload.content
    db.commit()
    return {"id": a.id, "title": a.title, "category": a.category}
