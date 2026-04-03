from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.based import Base, CommonColumnsMixin
from sqlalchemy import Integer, String, ForeignKey


class OAuthUser(CommonColumnsMixin, Base):
    __tablename__ = "oauth_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    provider: Mapped[str] = mapped_column(String(64), nullable=False, primary_key=True)
    provider_user_id: Mapped[str] = mapped_column(
        String(255), nullable=False, primary_key=True
    )
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(255), nullable=True
    )  # Optional email field for the OAuth user.

    user = relationship("User", back_populates="oauth_users")

    def __repr__(self):
        return f"<OAuthUser(id={self.id}, provider='{self.provider}', provider_user_id='{self.provider_user_id}', user_id={self.user_id})>"
