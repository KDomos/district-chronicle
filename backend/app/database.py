from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = AsyncIOMotorClient(settings.mongo_url, tz_aware=True)
db = client[settings.db_name]

# Collections
posts_col = db["posts"]              # blog + gossip (post_type field distinguishes)
comments_col = db["comments"]
reactions_col = db["reactions"]
albums_col = db["albums"]
photos_col = db["photos"]
portfolio_col = db["portfolio"]      # single document
site_settings_col = db["site_settings"]  # single document
messages_col = db["messages"]
admin_col = db["admin"]              # single admin account


async def ensure_indexes():
    await posts_col.create_index("slug", unique=True)
    await posts_col.create_index("post_type")
    await posts_col.create_index("created_at")
    await posts_col.create_index("tags")
    await posts_col.create_index("status")
    await comments_col.create_index("post_id")
    await reactions_col.create_index([("post_id", 1), ("visitor_key", 1), ("reaction_type", 1)], unique=True)
    await photos_col.create_index("album_id")
    await messages_col.create_index("created_at")
