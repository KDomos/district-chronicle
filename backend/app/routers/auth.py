from fastapi import APIRouter, HTTPException, Response, Depends, status
from app.config import settings
from app.models import LoginRequest
from app.utils.security import verify_password, create_session_token
from app.database import admin_col
from app.auth import require_admin

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login")
async def login(payload: LoginRequest, response: Response):
    admin = await admin_col.find_one({"username": payload.username})
    if not admin or not verify_password(payload.password, admin["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_session_token(admin["username"])
    response.set_cookie(
        key=settings.cookie_name,
        value=token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="none",
        max_age=60 * 60 * 24 * 7,
        path="/",
    )
    return {"ok": True, "username": admin["username"]}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(settings.cookie_name, path="/")
    return {"ok": True}


@router.get("/me")
async def me(username: str = Depends(require_admin)):
    return {"username": username}
