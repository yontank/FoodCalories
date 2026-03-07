"""
A Schema File for The Refresh Token Idea
---
Since we need to know how to follow refresh tokens,
it's a good idea to save them inside the DB
while checking which one is revoked and which one isnt.
"""
from sqlalchemy import BOOLEAN, VARCHAR, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.based import Base, CommonColumnsMixin


class RefreshTokens(CommonColumnsMixin, Base):
    """
    Sql Alchemy Schem for Refresh Tokens
    """
    __tablename__: str = "refresh_tokens"
    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    token_hash: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    revoked: Mapped[bool] = mapped_column(BOOLEAN, default=False)

    # 👇 Self-referencing foreign key
    replaced_by_id: Mapped[int | None] = mapped_column(
        ForeignKey("refresh_tokens.id"), nullable=True
    )

    replaced_by: Mapped["RefreshTokens"] = relationship(
        "RefreshTokens",
        remote_side=[id],
        back_populates="replaced_token",
        uselist=False
    )

    replaced_token: Mapped["RefreshTokens"] = relationship(
        "RefreshTokens",
        back_populates="replaced_by",
        uselist=False,
        foreign_keys=[replaced_by_id],
    )

    # FIXME: make it work
    # __table_args__ = (Index(
    #     "uq_one_active_refresh_token_per_user",
    #     "user_id",
    #     unique=True,
    #     postgresql_where=(revoked == false()),
    # ))
