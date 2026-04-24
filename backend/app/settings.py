"""Application runtime settings loaded from environment variables."""
from functools import lru_cache
from typing import List, Optional

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Strongly-typed settings for API security and deployment behavior."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_env: str = "development"
    database_url: Optional[str] = None
    cors_origins: List[str] = Field(default_factory=lambda: ["http://localhost:5173"])
    allow_credentials: bool = True
    auto_create_tables: bool = False
    auth_secret_key: str = "dev-insecure-change-me"
    auth_algorithm: str = "HS256"
    auth_token_ttl_minutes: int = 120
    auth_max_login_attempts: int = 5
    auth_login_window_seconds: int = 300
    auth_login_lockout_seconds: int = 300

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> object:
        """Parse comma-delimited CORS origins from environment values and raises nothing."""
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @model_validator(mode="after")
    def validate_security_settings(self) -> "Settings":
        """Validate security-sensitive settings for safe deployment defaults."""
        is_prod_like = self.app_env.lower() in {"production", "staging"}

        if self.allow_credentials and "*" in self.cors_origins:
            raise ValueError("CORS origins cannot include '*' when allow_credentials is true.")

        if is_prod_like:
            if self.auth_secret_key == "dev-insecure-change-me" or len(self.auth_secret_key) < 32:
                raise ValueError(
                    "In production/staging, AUTH_SECRET_KEY must be set and at least 32 characters."
                )

        return self


@lru_cache
def get_settings() -> Settings:
    """Build cached runtime settings and raises validation errors on invalid values."""
    return Settings()


settings: Settings = get_settings()