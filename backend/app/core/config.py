"""
Application configuration using Pydantic Settings.

Loads configuration from environment variables with sensible defaults.
"""

from functools import lru_cache
from typing import Any

from pydantic import PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # Application
    APP_NAME: str = "Quran Quest API"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # Security
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"

    # Database (defaults to SQLite for local development)
    DATABASE_URL: str = "sqlite+aiosqlite:///./quran_quest.db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:8081",
        "exp://localhost:8081",
    ]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_origins(cls, v: Any) -> list[str]:
        """Parse CORS origins from comma-separated string or list."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    # AWS S3 (for audio storage)
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: str = "quran-quest-audio"

    # OpenAI (for Whisper API fallback)
    OPENAI_API_KEY: str = ""

    # Hugging Face (for local Whisper model)
    HF_TOKEN: str = ""
    WHISPER_MODEL: str = "tarteel-ai/whisper-base-ar-quran"

    # Firebase (for push notifications)
    FIREBASE_CREDENTIALS_PATH: str = ""

    # Gamification
    DAILY_XP_GOAL: int = 50
    MAX_HEARTS: int = 5
    HEART_REGEN_MINUTES: int = 30
    STREAK_FREEZE_COST_XP: int = 200

    # Rate limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW_SECONDS: int = 60


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()

