from pydantic import Field, PostgresDsn, HttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Settings file for .env of environment handling be it docker or .env,
    for easier following.
    """

    DATABASE_URL: PostgresDsn
    SECRET_KEY: str = Field(..., min_length=32)
    CORS_ORIGIN: list[HttpUrl] = [HttpUrl("http://localhost:5173")]
    DEBUG: bool = False

    # This is optional, for Dev reasons only, it should probably not be in here.
    db_user: str | None = Field(validation_alias="POSTGRES_USER", default=None)
    db_password: str | None = Field(validation_alias="POSTGRES_PASSWORD", default=None)
    db_db: str | None = Field(validation_alias="POSTGRES_DB", default=None)

    GOOGLE_CLIENT_ID: str = Field(..., min_length=32)
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


# https://docs.pydantic.dev/latest/concepts/pydantic_settings/#usage
settings = Settings()  # type: ignore , pydantic documentation.
