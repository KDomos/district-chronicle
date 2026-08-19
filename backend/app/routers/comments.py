from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from bson.errors import InvalidId

from app.database import comments_col, posts_col, site_settings_col
from app.models import CommentCreate
from app.auth import require_admin
from app.utils.files import utcnow
from app.utils.email import fire_and_forget

router = APIRouter(prefix="/api/comments", tags=["comments"])


def serialize(doc) -> dict:
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc


@router.get("/post/{post_id}")
async def list_comments_for_post(post_id: str):
    cursor = comments_col.find({"post_id": post_id}).sort("created_at", 1)
    return [serialize(c) async for c in cursor]


@router.post("")
async def create_comment(payload: CommentCreate):
    post = await posts_col.find_one({"_id": _to_oid(payload.post_id)}) if _is_oid(payload.post_id) else None
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    doc = payload.model_dump()
    doc["created_at"] = utcnow()
    result = await comments_col.insert_one(doc)
    created = await comments_col.find_one({"_id": result.inserted_id})

    site_settings = await site_settings_col.find_one({"_singleton": "settings"})
    if not site_settings or site_settings.get("notify_on_comment", True):
        recipient = (site_settings or {}).get("notification_email") or None
        fire_and_forget(
            subject=f"New comment on \u201c{post.get('title', 'a post')}\u201d",
            body=(
                f"{payload.author_name} commented on \u201c{post.get('title', '')}\u201d:\n\n"
                f"{payload.body}\n\n"
                f"Moderate it in the admin panel."
            ),
            to_email=recipient,
        )

    return serialize(created)


@router.get("", dependencies=[Depends(require_admin)])
async def list_all_comments(limit: int = 50, skip: int = 0):
    cursor = comments_col.find({}).sort("created_at", -1).skip(skip).limit(limit)
    items = [serialize(c) async for c in cursor]
    total = await comments_col.count_documents({})
    return {"items": items, "total": total}


@router.delete("/{comment_id}", dependencies=[Depends(require_admin)])
async def delete_comment(comment_id: str):
    if not _is_oid(comment_id):
        raise HTTPException(status_code=400, detail="Invalid comment id")
    result = await comments_col.delete_one({"_id": ObjectId(comment_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found")
    return {"ok": True}


def _is_oid(value: str) -> bool:
    try:
        ObjectId(value)
        return True
    except (InvalidId, TypeError):
        return False


def _to_oid(value: str):
    return ObjectId(value)
