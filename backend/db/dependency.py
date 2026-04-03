from collections.abc import Generator

from sqlalchemy.orm import Session

from db.session import SessionLocal


def get_db() -> Generator[Session]:
    # NOTE: Rollback only triggers on raised exceptions (e.g. SQLAlchemy errors),
    # NOT on returned JSONResponse errors. Since our endpoints return JSONResponse
    # instead of raising HTTPException, business logic errors always take the
    # commit path. This is safe as long as error returns happen before any DB mutations.
    with SessionLocal() as db:
        try:
            yield db
            db.commit()
        except Exception:
            db.rollback()
            raise
