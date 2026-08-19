from email.utils import format_datetime
from typing import Optional, Literal
from xml.sax.saxutils import escape

from fastapi import APIRouter, Query, Response

from app.database import posts_col, site_settings_col
from app.config import settings
from app.routers.posts import _public_visibility_filter

router = APIRouter(prefix="/api", tags=["rss"])


def _site_base_url() -> str:
    return settings.frontend_origin.rstrip("/")


def _post_url(post: dict) -> str:
    section = "gossip" if post.get("post_type") == "gossip" else "post"
    return f"{_site_base_url()}/{section}/{post.get('slug', '')}"


def _rss_item(post: dict) -> str:
    title = escape(post.get("title", ""))
    link = escape(_post_url(post))
    description = escape(post.get("excerpt") or (post.get("content") or "")[:400])
    pub_date = post.get("created_at")
    pub_date_str = format_datetime(pub_date) if pub_date else ""
    guid = escape(str(post.get("_id", "")))
    categories = "".join(
        f"<category>{escape(t)}</category>"
        for t in [post.get("post_type", "")] + list(post.get("tags", []))
        if t
    )

    return (
        "<item>"
        f"<title>{title}</title>"
        f"<link>{link}</link>"
        f"<guid isPermaLink=\"false\">{guid}</guid>"
        f"<pubDate>{pub_date_str}</pubDate>"
        f"<description>{description}</description>"
        f"{categories}"
        "</item>"
    )


@router.get("/rss.xml")
async def rss_feed(
    post_type: Optional[Literal["blog", "gossip"]] = None,
    tag: Optional[str] = None,
    limit: int = Query(50, le=200),
):
    query = dict(_public_visibility_filter())
    if post_type:
        query["post_type"] = post_type
    if tag:
        query["tags"] = tag

    site_settings = await site_settings_col.find_one({"_singleton": "settings"}) or {}
    site_title = escape(site_settings.get("site_title") or "District Chronicle")
    tagline = escape(site_settings.get("tagline") or "")
    site_url = escape(_site_base_url())

    cursor = posts_col.find(query).sort("created_at", -1).limit(limit)
    items = "".join([_rss_item(p) async for p in cursor])

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<rss version="2.0">'
        "<channel>"
        f"<title>{site_title}</title>"
        f"<link>{site_url}</link>"
        f"<description>{tagline}</description>"
        f"{items}"
        "</channel>"
        "</rss>"
    )

    return Response(content=xml, media_type="application/rss+xml")
