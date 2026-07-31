"""Flask application factory."""

from __future__ import annotations

import logging
from pathlib import Path

from flask import Flask, request

from .config import Config
from .error_handlers import register_error_handlers
from .routes import api


def create_app(config: dict[str, object] | None = None) -> Flask:
    """Create and configure the PDF tools application."""

    repository_root = Path(__file__).resolve().parents[2]
    frontend_dist = repository_root / "frontend" / "dist"
    app = Flask(__name__, static_folder=None)
    app.config.from_object(Config)
    app.config["FRONTEND_DIST"] = str(frontend_dist)
    if config:
        app.config.update(config)

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    app.register_blueprint(api)
    register_error_handlers(app)

    @app.after_request
    def security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Cache-Control"] = "no-store"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; script-src 'self'; style-src 'self'; "
            "img-src 'self' data:; connect-src 'self'; object-src 'none'; "
            "base-uri 'self'; frame-ancestors 'self'; form-action 'self'"
        )
        origin = request.headers.get("Origin")
        allowed_origins = app.config["CORS_ALLOWED_ORIGINS"]
        if origin and origin in allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type"
            response.headers["Access-Control-Expose-Headers"] = (
                "Content-Disposition, X-Merged-File-Count, "
                "X-Merged-Page-Count, X-Split-Page-Count"
            )
            response.vary.add("Origin")
        return response

    return app
