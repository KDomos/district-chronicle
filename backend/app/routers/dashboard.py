from fastapi import APIRouter, Depends

from app.database import (
    posts_col,
    comments_col,
    reactions_col,
    albums_col,
    photos_col,
    messages_col,
)
from app.auth import require_admin

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", dependencies=[Depends(require_admin)])
async def get_stats():
    blog_count = await posts_col.count_documents({"post_type": "blog"})
    gossip_count = await posts_col.count_documents({"post_type": "gossip"})
    draft_count = await posts_col.count_documents({"status": "draft"})
    scheduled_count = await posts_col.count_documents({"status": "scheduled"})
    comment_count = await comments_col.count_documents({})
    reaction_count = await reactions_col.count_documents({})
    album_count = await albums_col.count_documents({})
    photo_count = await photos_col.count_documents({})
    message_count = await messages_col.count_documents({})
    unread_messages = await messages_col.count_documents({"read": False})

    recent_comments = await comments_col.find({}).sort("created_at", -1).limit(5).to_list(5)
    for c in recent_comments:
        c["id"] = str(c["_id"])
        c.pop("_id", None)

    return {
        "posts": {
            "blog": blog_count,
            "gossip": gossip_count,
            "total": blog_count + gossip_count,
            "drafts": draft_count,
            "scheduled": scheduled_count,
        },
        "comments": comment_count,
        "reactions": reaction_count,
        "albums": album_count,
        "photos": photo_count,
        "messages": {"total": message_count, "unread": unread_messages},
        "recent_comments": recent_comments,
    }
