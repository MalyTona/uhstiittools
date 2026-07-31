"""Structured, non-sensitive API error responses."""

from __future__ import annotations

import logging

from flask import Flask, jsonify, request
from werkzeug.exceptions import HTTPException, RequestEntityTooLarge

from .services.pdf_validator import PdfValidationError

logger = logging.getLogger(__name__)


def _error(code: str, message: str, status: int):
    return jsonify(ok=False, error={"code": code, "message": message}), status


def register_error_handlers(app: Flask) -> None:
    """Register safe JSON handlers for known and unexpected API failures."""

    @app.errorhandler(PdfValidationError)
    def handle_validation(error: PdfValidationError):
        return _error(error.code, error.message, error.status)

    @app.errorhandler(RequestEntityTooLarge)
    def handle_too_large(_error_value: RequestEntityTooLarge):
        return _error(
            "TOTAL_SIZE_TOO_LARGE",
            "The combined PDF size exceeds the total upload limit.",
            413,
        )

    @app.errorhandler(HTTPException)
    def handle_http(error: HTTPException):
        if request.path.startswith("/api/"):
            return _error("SERVER_ERROR", "The request could not be completed.", error.code or 500)
        return error

    @app.errorhandler(Exception)
    def handle_unexpected(error: Exception):
        logger.exception("Unexpected application error: %s", type(error).__name__)
        return _error("SERVER_ERROR", "An unexpected server error occurred.", 500)

