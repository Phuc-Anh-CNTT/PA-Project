import secrets
import warnings
from urllib.parse import quote_plus
from typing import Annotated, Any, Literal

from pydantic import (
    AnyUrl,
    BeforeValidator,
    EmailStr,
    HttpUrl,
    computed_field,
    model_validator,
)
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing_extensions import Self


def parse_cors(v: Any) -> list[str] | str:
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",")]
    elif isinstance(v, (list, str)):
        return v
    raise ValueError(v)


class Settings(BaseSettings):
    SqlServer_USER: str
    SqlServer_PASS: str
    SqlServer_HOST: str
    SqlServer_PORT: str
    SqlServer_DB: str

    @property
    def DATABASE_SqlServer_URL(self) -> str:
        user = quote_plus(self.SqlServer_USER)
        password = quote_plus(self.SqlServer_PASS)
        host = self.SqlServer_HOST
        port = self.SqlServer_PORT
        db = self.SqlServer_DB

        return (
            f"mssql+pyodbc://{user}:{password}@{host},{port}/{db}"
            "?driver=ODBC+Driver+17+for+SQL+Server&TrustServerCertificate=yes"
        )

    # --- Base settings ---
    model_config = SettingsConfigDict(
        env_file="../.env",
        env_ignore_empty=True,
        extra="ignore",
    )
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    FRONTEND_HOST: str = "http://localhost:5173"
    ENVIRONMENT: Literal["local", "staging", "production"] = "local"

    BACKEND_CORS_ORIGINS: Annotated[
        list[AnyUrl] | str, BeforeValidator(parse_cors)
    ] = []

    @computed_field
    @property
    def all_cors_origins(self) -> list[str]:
        return [str(origin).rstrip("/") for origin in self.BACKEND_CORS_ORIGINS] + [
            self.FRONTEND_HOST
        ]

    # --- Required by template (dummy nếu bạn không dùng Postgres) ---
    PROJECT_NAME: str
    FIRST_SUPERUSER: EmailStr
    FIRST_SUPERUSER_PASSWORD: str

    SENTRY_DSN: HttpUrl | None = None

    @model_validator(mode="after")
    def _enforce_non_default_secrets(self) -> Self:
        if self.FIRST_SUPERUSER_PASSWORD == "changethis":
            warnings.warn("Please change FIRST_SUPERUSER_PASSWORD", stacklevel=1)
        return self


settings = Settings()  # type: ignore