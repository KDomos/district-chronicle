from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from bson.errors import InvalidId

from app.database import messages_col, site_settings_col
from app.models import ContactMessageCreate
from app.auth import require_admin
from app.utils.files import utcnow
from app.utils.email import fire_and_forget

router = APIRouter(prefix="/api/contact", tags=["contact"])


def serialize(doc) -> dict:
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc


@router.post("")
async def submit_message(payload: ContactMessageCreate):
    doc = payload.model_dump()
    doc["created_at"] = utcnow()
    doc["read"] = False
    result = await messages_col.insert_one(doc)

    site_settings = await site_settings_col.find_one({"_singleton": "settings"})
    if not site_settings or site_settings.get("notify_on_message", True):
        recipient = (site_settings or {}).get("notification_email") or None
        fire_and_forget(
            subject=f"New message from {payload.name}",
            body=(
                f"From: {payload.name} <{payload.email}>\n\n"
                f"{payload.message}\n\n"
                f"Read it in the admin inbox."
            ),
            to_email=recipient,
        )

    return {"ok": True, "id": str(result.inserted_id)}


@router.get("", dependencies=[Depends(require_admin)])
async def list_messages(limit: int = 50, skip: int = 0):
    cursor = messages_col.find({}).sort("created_at", -1).skip(skip).limit(limit)
    items = [serialize(m) async for m in cursor]
    total = await messages_col.count_documents({})
    unread = await messages_col.count_documents({"read": False})
    return {"items": items, "total": total, "unread": unread}


@router.put("/{message_id}/read", dependencies=[Depends(require_admin)])
async def mark_read(message_id: str):
    try:
        oid = ObjectId(message_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid id")
    result = await messages_col.update_one({"_id": oid}, {"$set": {"read": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"ok": True}


@router.delete("/{message_id}", dependencies=[Depends(require_admin)])
async def delete_message(message_id: str):
    try:
        oid = ObjectId(message_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid id")
    result = await messages_col.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"ok": True}
