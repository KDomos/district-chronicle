from fastapi import Request, HTTPException, status
from app.config import settings
from app.utils.security import decode_session_token


async def require_admin(request: Request):
    token = request.cookies.get(settings.cookie_name)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    username = decode_session_token(token)
    if not username or username != settings.admin_username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session")
    return username
