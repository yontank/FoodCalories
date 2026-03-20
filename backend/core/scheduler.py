import logging
from apscheduler.schedulers.background import BackgroundScheduler
from db.session import session
from sqlalchemy import delete
from datetime import timedelta, datetime, timezone
from db.schemas.refresh_tokens import RefreshTokens

logger = logging.getLogger(__name__)


def delete_old_revoked_refresh_tokens_job():
    REVOKED_TOKENS_LIFESPAN = timedelta(days=14)
    cutoff = datetime.now(timezone.utc) - REVOKED_TOKENS_LIFESPAN
    logger.info("Running refresh token cleanup, deleting tokens older than %s", cutoff)
    stmt = delete(RefreshTokens).where(
        RefreshTokens.revoked,
        RefreshTokens.created_at < cutoff,
    )
    session.execute(stmt)
    session.commit()
    logger.info("Deleted expired refresh tokens")


def start_scheduler():
    SCHEDULER_DAY_RUNTIME = 3  # Runs in days.
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        delete_old_revoked_refresh_tokens_job,
        trigger="interval",
        days=SCHEDULER_DAY_RUNTIME,
    )
    scheduler.start()
