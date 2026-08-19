from typing import Optional, Literal, List
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr


# ---------- Auth ----------
class LoginRequest(BaseModel):
    username: str
    password: str


# ---------- Posts (blog + gossip share this model) ----------
PostType = Literal["blog", "gossip"]
PostStatus = Literal["draft", "scheduled", "published"]


class PostCreate(BaseModel):
    title: str
    content: str
    excerpt: Optional[str] = ""
    cover_image: Optional[str] = None
    post_type: PostType = "blog"
    tags: List[str] = []
    status: PostStatus = "published"
    scheduled_for: Optional[datetime] = None


class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    cover_image: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[PostStatus] = None
    scheduled_for: Optional[datetime] = None


# ---------- Comments ----------
class CommentCreate(BaseModel):
    post_id: str
    author_name: str = Field(..., min_length=1, max_length=80)
    body: str = Field(..., min_length=1, max_length=2000)


# ---------- Reactions ----------
ReactionType = Literal["like", "love", "laugh", "wow", "sad", "angry"]


class ReactionCreate(BaseModel):
    post_id: str
    reaction_type: ReactionType = "like"


# ---------- Albums / Photos ----------
class AlbumCreate(BaseModel):
    title: str
    description: Optional[str] = ""


class AlbumUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


# ---------- Portfolio (single block) ----------
class PortfolioUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    cover_image: Optional[str] = None


# ---------- Site settings ----------
class SiteSettingsUpdate(BaseModel):
    site_title: Optional[str] = None
    tagline: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    social_links: Optional[dict] = None
    notify_on_comment: Optional[bool] = None
    notify_on_message: Optional[bool] = None
    notification_email: Optional[EmailStr] = None


# ---------- Contact ----------
class ContactMessageCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    message: str = Field(..., min_length=1, max_length=3000)
