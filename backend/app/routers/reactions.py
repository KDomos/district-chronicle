import uuid
from fastapi import APIRouter, HTTPException, Request, Response
from pymongo.errors import DuplicateKeyError
from bson import ObjectId
from bson.errors import InvalidId

from app.database import reactions_col, posts_col
from app.models import ReactionCreate
from app.utils.files import utcnow

router = APIRouter(prefix="/api/reactions", tags=["reactions"])

VISITOR_COOKIE = "dc_visitor"


def _get_or_set_visitor_key(request: Request, response: Response) -> str:
    key = request.cookies.get(VISITOR_COOKIE)
    if not key:
        key = uuid.uuid4().hex
        response.set_cookie(VISITOR_COOKIE, key, max_age=60 * 60 * 24 * 365, httponly=True, samesite="lax", path="/")
    return key


@router.post("")
async def add_reaction(payload: ReactionCreate, request: Request, response: Response):
    try:
        ObjectId(payload.post_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid post id")

    post = await posts_col.find_one({"_id": ObjectId(payload.post_id)})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    visitor_key = _get_or_set_visitor_key(request, response)

    doc = payload.model_dump()
    doc["visitor_key"] = visitor_key
    doc["created_at"] = utcnow()

    try:
        await reactions_col.insert_one(doc)
    except DuplicateKeyError:
        # Toggle off if already reacted with same type
        await reactions_col.delete_one(
            {"post_id": payload.post_id, "visitor_key": visitor_key, "reaction_type": payload.reaction_type}
        )
        return {"ok": True, "toggled": "removed"}

    return {"ok": True, "toggled": "added"}
