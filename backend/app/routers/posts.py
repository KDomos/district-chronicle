from typing import Optional, Literal
from fastapi import APIRouter, HTTPException, Depends, Query
from bson import ObjectId
from bson.errors import InvalidId

from app.database import posts_col, comments_col, reactions_col
from app.models import PostCreate, PostUpdate
from app.auth import require_admin
from app.utils.files import utcnow, slugify

router = APIRouter(prefix="/api/posts", tags=["posts"])


from datetime import timezone


def _as_aware_utc(dt):
    """Normalize a datetime to UTC-aware, treating naive values as already UTC.
    Different Mongo drivers/mocks are inconsistent about preserving tzinfo
    on round-trip, so comparisons need to tolerate either."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def _effective_published(doc: dict) -> bool:
    """A post is visitor-visible if published, or scheduled and due."""
    status = doc.get("status", "published")
    if status == "published":
        return True
    if status == "scheduled":
        scheduled_for = _as_aware_utc(doc.get("scheduled_for"))
        return bool(scheduled_for and scheduled_for <= utcnow())
    return False


def serialize_post(doc) -> dict:
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    doc.setdefault("status", "published")
    doc.setdefault("tags", [])
    doc.setdefault("view_count", 0)
    # Convenience boolean the frontend already relies on for display.
    doc["published"] = _effective_published(doc)
    return doc


def _public_visibility_filter() -> dict:
    """Mongo query fragment matching posts a visitor is allowed to see."""
    return {
        "$or": [
            {"status": "published"},
            {"status": "scheduled", "scheduled_for": {"$lte": utcnow()}},
        ]
    }


async def unique_slug(base: str) -> str:
    slug = slugify(base)
    candidate = slug
    i = 2
    while await posts_col.find_one({"slug": candidate}):
        candidate = f"{slug}-{i}"
        i += 1
    return candidate


@router.get("")
async def list_posts(
    post_type: Optional[Literal["blog", "gossip"]] = None,
    tag: Optional[str] = None,
    published_only: bool = True,
    limit: int = Query(20, le=500),
    skip: int = 0,
):
    query = {}
    if post_type:
        query["post_type"] = post_type
    if tag:
        query["tags"] = tag
    if published_only:
        query.update(_public_visibility_filter())

    cursor = posts_col.find(query).sort("created_at", -1).skip(skip).limit(limit)
    posts = [serialize_post(p) async for p in cursor]
    total = await posts_col.count_documents(query)
    return {"items": posts, "total": total}


@router.get("/tags/all")
async def list_tags():
    tags = await posts_col.distinct("tags", _public_visibility_filter())
    return sorted(t for t in tags if t)


@router.get("/{slug}")
async def get_post(slug: str):
    post = await posts_col.find_one({"slug": slug})
    if not post or not _effective_published(post):
        raise HTTPException(status_code=404, detail="Post not found")
    return serialize_post(post)


@router.post("", dependencies=[Depends(require_admin)])
async def create_post(payload: PostCreate):
    slug = await unique_slug(payload.title)
    doc = payload.model_dump()
    doc["tags"] = sorted({t.strip().lower() for t in doc["tags"] if t.strip()})
    if doc["status"] == "scheduled" and not doc.get("scheduled_for"):
        raise HTTPException(status_code=400, detail="scheduled_for is required when status is 'scheduled'")
    doc["slug"] = slug
    doc["created_at"] = utcnow()
    doc["updated_at"] = utcnow()
    result = await posts_col.insert_one(doc)
    created = await posts_col.find_one({"_id": result.inserted_id})
    return serialize_post(created)


@router.put("/{post_id}", dependencies=[Depends(require_admin)])
async def update_post(post_id: str, payload: PostUpdate):
    try:
        oid = ObjectId(post_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid post id")

    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if "tags" in update_data:
        update_data["tags"] = sorted({t.strip().lower() for t in update_data["tags"] if t.strip()})
    if update_data.get("status") == "scheduled" and not update_data.get("scheduled_for"):
        existing = await posts_col.find_one({"_id": oid})
        if not (existing and existing.get("scheduled_for")):
            raise HTTPException(status_code=400, detail="scheduled_for is required when status is 'scheduled'")
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    update_data["updated_at"] = utcnow()

    result = await posts_col.update_one({"_id": oid}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")

    updated = await posts_col.find_one({"_id": oid})
    return serialize_post(updated)


@router.delete("/{post_id}", dependencies=[Depends(require_admin)])
async def delete_post(post_id: str):
    try:
        oid = ObjectId(post_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid post id")

    result = await posts_col.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")

    # cascade cleanup
    await comments_col.delete_many({"post_id": post_id})
    await reactions_col.delete_many({"post_id": post_id})
    return {"ok": True}


@router.get("/{post_id}/reaction-counts")
async def reaction_counts(post_id: str):
    pipeline = [
        {"$match": {"post_id": post_id}},
        {"$group": {"_id": "$reaction_type", "count": {"$sum": 1}}},
    ]
    counts = {row["_id"]: row["count"] async for row in reactions_col.aggregate(pipeline)}
    return counts
