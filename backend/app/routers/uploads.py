import os
import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse

from app.config import settings
from app.auth import require_admin
from app.utils.files import ensure_upload_dir, safe_filename

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}

_cloudinary_configured = False


def _cloudinary_enabled() -> bool:
    return bool(settings.cloudinary_url)


def _ensure_cloudinary():
    global _cloudinary_configured
    if not _cloudinary_configured:
        cloudinary.config(cloudinary_url=settings.cloudinary_url)
        _cloudinary_configured = True


@router.post("", dependencies=[Depends(require_admin)])
async def upload_file(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    contents = await file.read()
    if len(contents) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File exceeds {settings.max_upload_mb}MB limit")

    if _cloudinary_enabled():
        _ensure_cloudinary()
        filename = safe_filename(file.filename or "upload")
        result = cloudinary.uploader.upload(
            contents,
            public_id=os.path.splitext(filename)[0],
            folder="district-chronicle",
            resource_type="image",
        )
        return JSONResponse({"url": result["secure_url"], "filename": filename})

    ensure_upload_dir()
    filename = safe_filename(file.filename or "upload")
    path = os.path.join(settings.upload_dir, filename)
    with open(path, "wb") as f:
        f.write(contents)

    return JSONResponse({"url": f"/api/uploads/file/{filename}", "filename": filename})
