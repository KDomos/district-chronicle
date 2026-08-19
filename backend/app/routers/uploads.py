import os
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse

from app.config import settings
from app.auth import require_admin
from app.utils.files import ensure_upload_dir, safe_filename

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@router.post("", dependencies=[Depends(require_admin)])
async def upload_file(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    contents = await file.read()
    if len(contents) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File exceeds {settings.max_upload_mb}MB limit")

    ensure_upload_dir()
    filename = safe_filename(file.filename or "upload")
    path = os.path.join(settings.upload_dir, filename)
    with open(path, "wb") as f:
        f.write(contents)

    # NOTE: local disk storage — fine for dev, but wiped on redeploy for most
    # free hosting tiers. Swap this for S3/Cloudinary in production (see README).
    return JSONResponse({"url": f"/api/uploads/file/{filename}", "filename": filename})
