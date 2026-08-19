from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from bson.errors import InvalidId

from app.database import albums_col, photos_col
from app.models import AlbumCreate, AlbumUpdate
from app.auth import require_admin
from app.utils.files import utcnow

router = APIRouter(prefix="/api/albums", tags=["albums"])


def serialize(doc) -> dict:
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc


def _oid(value: str):
    try:
        return ObjectId(value)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid id")


@router.get("")
async def list_albums():
    cursor = albums_col.find({}).sort("created_at", -1)
    albums = [serialize(a) async for a in cursor]
    for a in albums:
        a["photo_count"] = await photos_col.count_documents({"album_id": a["id"]})
    return albums


@router.get("/{album_id}")
async def get_album(album_id: str):
    album = await albums_col.find_one({"_id": _oid(album_id)})
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")
    album = serialize(album)
    photos_cursor = photos_col.find({"album_id": album_id}).sort("created_at", -1)
    album["photos"] = [serialize(p) async for p in photos_cursor]
    return album


@router.post("", dependencies=[Depends(require_admin)])
async def create_album(payload: AlbumCreate):
    doc = payload.model_dump()
    doc["created_at"] = utcnow()
    result = await albums_col.insert_one(doc)
    created = await albums_col.find_one({"_id": result.inserted_id})
    return serialize(created)


@router.put("/{album_id}", dependencies=[Depends(require_admin)])
async def update_album(album_id: str, payload: AlbumUpdate):
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await albums_col.update_one({"_id": _oid(album_id)}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Album not found")
    updated = await albums_col.find_one({"_id": _oid(album_id)})
    return serialize(updated)


@router.delete("/{album_id}", dependencies=[Depends(require_admin)])
async def delete_album(album_id: str):
    result = await albums_col.delete_one({"_id": _oid(album_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Album not found")
    await photos_col.delete_many({"album_id": album_id})
    return {"ok": True}


@router.post("/{album_id}/photos", dependencies=[Depends(require_admin)])
async def add_photo_to_album(album_id: str, image_url: str, caption: str = ""):
    album = await albums_col.find_one({"_id": _oid(album_id)})
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")
    doc = {"album_id": album_id, "image_url": image_url, "caption": caption, "created_at": utcnow()}
    result = await photos_col.insert_one(doc)
    created = await photos_col.find_one({"_id": result.inserted_id})
    return serialize(created)


@router.delete("/photos/{photo_id}", dependencies=[Depends(require_admin)])
async def delete_photo(photo_id: str):
    result = await photos_col.delete_one({"_id": _oid(photo_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Photo not found")
    return {"ok": True}
