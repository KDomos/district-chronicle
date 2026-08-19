import asyncio
import logging
import smtplib
from email.mime.text import MIMEText

from app.config import settings

logger = logging.getLogger("district_chronicle.email")


def _send_sync(subject: str, body: str, to_email: str) -> None:
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = settings.smtp_from_email or settings.smtp_username
    msg["To"] = to_email

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as server:
        if settings.smtp_use_tls:
            server.starttls()
        if settings.smtp_username:
            server.login(settings.smtp_username, settings.smtp_password)
        server.sendmail(msg["From"], [to_email], msg.as_string())


async def notify_admin(subject: str, body: str, to_email: str | None = None) -> None:
    """
    Fire-and-forget admin notification email. Never raises — a misconfigured
    or unreachable mail server should never break the request that
    triggered the notification (e.g. someone posting a comment).
    """
    if not settings.smtp_host:
        logger.debug("SMTP not configured; skipping notification email: %s", subject)
        return

    recipient = to_email or settings.admin_notification_email or settings.smtp_from_email
    if not recipient:
        logger.debug("No notification recipient configured; skipping: %s", subject)
        return

    try:
        await asyncio.to_thread(_send_sync, subject, body, recipient)
    except Exception:
        logger.exception("Failed to send notification email: %s", subject)


def fire_and_forget(subject: str, body: str, to_email: str | None = None) -> None:
    """Schedule notify_admin without awaiting it from request handlers."""
    asyncio.create_task(notify_admin(subject, body, to_email))
