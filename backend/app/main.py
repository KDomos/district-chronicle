from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import ensure_indexes, admin_col
from app.utils.security import hash_password
from app.utils.files import ensure_upload_dir, utcnow

from app.routers import (
    auth,
    posts,
    comments,
    reactions,
    albums,
    portfolio,
    settings as settings_router,
    contact,
    uploads,
    dashboard,
    rss,
    push,
)


async def seed_admin():
    """Create the single admin account on first boot if none exists."""
    existing = await admin_col.find_one({})
    if existing:
        return
    await admin_col.insert_one(
        {
            "username": settings.admin_username,
            "password_hash": hash_password(settings.admin_password),
            "created_at": utcnow(),
        }
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_upload_dir()
    await ensure_indexes()
    await seed_admin()
    yield


app = FastAPI(title="District Chronicle API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files directly (local-disk dev storage backend)
app.mount("/api/uploads/file", StaticFiles(directory=settings.upload_dir), name="uploaded-files")

app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(comments.router)
app.include_router(reactions.router)
app.include_router(albums.router)
app.include_router(portfolio.router)
app.include_router(settings_router.router)
app.include_router(contact.router)
app.include_router(uploads.router)
app.include_router(dashboard.router)
app.include_router(rss.router)
app.include_router(push.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
