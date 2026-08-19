import os
import re
import uuid
from datetime import datetime, timezone

from app.config import settings


def ensure_upload_dir():
    os.makedirs(settings.upload_dir, exist_ok=True)


def safe_filename(original: str) -> str:
    ext = os.path.splitext(original)[1].lower()
    ext = re.sub(r"[^a-z0-9.]", "", ext)[:10] or ""
    return f"{uuid.uuid4().hex}{ext}"


def utcnow():
    return datetime.now(timezone.utc)


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-") or uuid.uuid4().hex[:8]
