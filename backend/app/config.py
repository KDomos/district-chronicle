import os
from pydantic_settings import BaseSettings

BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Settings(BaseSettings):
    mongo_url: str = "mongodb://localhost:27017"
    db_name: str = "district_chronicle"
    secret_key: str = "dev-secret-change-me"
    admin_username: str = "admin"
    admin_password: str = "admin"
    cookie_name: str = "dc_session"
    cookie_secure: bool = False
    frontend_origin: str = "http://localhost:3000"
    upload_dir: str = "uploads"
    max_upload_mb: int = 10
    cloudinary_url: str = ""

    # Email notifications (SMTP) — server-level, not user-editable via API
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from_email: str = ""
    smtp_use_tls: bool = True
    admin_notification_email: str = ""  # falls back to smtp_from_email if unset

    # Web push notifications (VAPID) — set both to enable; leave blank to disable
    vapid_public_key: str = ""
    vapid_private_key: str = ""
    vapid_subject: str = "mailto:admin@example.com"  # required by the push spec; a contact for push services to reach you

    class Config:
        env_file = ".env"


settings = Settings()

# Resolve upload_dir to an absolute path (relative to backend/ root) so it
# works regardless of the working directory the server is started from.
if not os.path.isabs(settings.upload_dir):
    settings.upload_dir = os.path.join(BACKEND_ROOT, settings.upload_dir)
os.makedirs(settings.upload_dir, exist_ok=True)
