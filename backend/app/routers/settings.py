from fastapi import APIRouter, Depends
from app.database import site_settings_col
from app.models import SiteSettingsUpdate
from app.auth import require_admin
from app.utils.files import utcnow

router = APIRouter(prefix="/api/settings", tags=["settings"])

DOC_KEY = {"_singleton": "settings"}
DEFAULTS = {
    "site_title": "District Chronicle",
    "tagline": "Local news, gossip, and everything in between.",
    "contact_email": "",
    "social_links": {},
    "notify_on_comment": True,
    "notify_on_message": True,
    "notification_email": "",
}


@router.get("")
async def get_settings():
    doc = await site_settings_col.find_one(DOC_KEY)
    if not doc:
        doc = {**DOC_KEY, **DEFAULTS, "updated_at": utcnow()}
        await site_settings_col.insert_one(doc)
    doc.pop("_id", None)
    doc.pop("_singleton", None)
    return doc


@router.put("", dependencies=[Depends(require_admin)])
async def update_settings(payload: SiteSettingsUpdate):
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    update_data["updated_at"] = utcnow()
    await site_settings_col.update_one(DOC_KEY, {"$set": update_data}, upsert=True)
    doc = await site_settings_col.find_one(DOC_KEY)
    doc.pop("_id", None)
    doc.pop("_singleton", None)
    return doc
