from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pywebpush import webpush, WebPushException
import json
import logging

from app.config import settings
from app.database import push_subscriptions_col

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/push", tags=["push"])


class SubscriptionKeys(BaseModel):
    p256dh: str
    auth: str


class SubscriptionPayload(BaseModel):
    endpoint: str
    keys: SubscriptionKeys


@router.get("/vapid-public-key")
async def get_vapid_public_key():
    return {"public_key": settings.vapid_public_key}


@router.post("/subscribe")
async def subscribe(payload: SubscriptionPayload):
    if not settings.vapid_public_key or not settings.vapid_private_key:
        raise HTTPException(status_code=503, detail="Push notifications are not configured on this server")

    await push_subscriptions_col.update_one(
        {"endpoint": payload.endpoint},
        {"$set": {"endpoint": payload.endpoint, "keys": payload.keys.model_dump()}},
        upsert=True,
    )
    return {"ok": True}


@router.post("/unsubscribe")
async def unsubscribe(payload: dict):
    endpoint = payload.get("endpoint")
    if not endpoint:
        raise HTTPException(status_code=400, detail="endpoint is required")
    await push_subscriptions_col.delete_one({"endpoint": endpoint})
    return {"ok": True}


async def notify_all_subscribers(title: str, body: str, url: str = "/"):
    if not settings.vapid_public_key or not settings.vapid_private_key:
        logger.debug("VAPID keys not configured; skipping push notifications")
        return

    payload = json.dumps({"title": title, "body": body, "url": url})
    dead_endpoints = []

    async for sub in push_subscriptions_col.find({}):
        try:
            webpush(
                subscription_info={
                    "endpoint": sub["endpoint"],
                    "keys": sub["keys"],
                },
                data=payload,
                vapid_private_key=settings.vapid_private_key,
                vapid_claims={"sub": settings.vapid_subject},
            )
        except WebPushException as e:
            status = getattr(e.response, "status_code", None)
            if status in (404, 410):
                dead_endpoints.append(sub["endpoint"])
            else:
                logger.warning("Push failed for a subscriber: %s", e)
        except Exception:
            logger.exception("Unexpected error sending push notification")

    if dead_endpoints:
        await push_subscriptions_col.delete_many({"endpoint": {"$in": dead_endpoints}})
