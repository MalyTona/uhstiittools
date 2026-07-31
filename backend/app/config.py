"""Application configuration loaded from environment variables."""

from __future__ import annotations

import os


def _positive_int(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None:
        return default
    try:
        value = int(raw)
    except ValueError as exc:
        raise ValueError(f"{name} must be an integer") from exc
    if value <= 0:
        raise ValueError(f"{name} must be positive")
    return value


class Config:
    """Safe defaults for local and production deployments."""

    SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")
    MAX_FILE_COUNT = _positive_int("MAX_FILE_COUNT", 20)
    MAX_FILE_SIZE = _positive_int("MAX_FILE_SIZE", 50 * 1024 * 1024)
    MAX_TOTAL_SIZE = _positive_int("MAX_TOTAL_SIZE", 200 * 1024 * 1024)
    # Leave room for multipart boundaries while still enforcing exact PDF limits.
    MAX_CONTENT_LENGTH = MAX_TOTAL_SIZE + 1024 * 1024
    TESTING = False

