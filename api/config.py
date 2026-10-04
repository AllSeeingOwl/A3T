import os
from pydantic_settings import BaseSettings
from api.db import fix_database_url


class Settings(BaseSettings):
    API_TITLE: str = "A3T API"
    API_VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    DATABASE_URL: str = fix_database_url(
        os.getenv(
            "DATABASE_URL",
            "postgresql://a3t_dev:dev_password@localhost:5432/a3t_db"
        )
    )
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "change_me")
    ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "*")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
