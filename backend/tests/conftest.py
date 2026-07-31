from __future__ import annotations

from io import BytesIO
from typing import Callable

import pytest
from pypdf import PdfWriter

from app import create_app


def build_pdf(widths: list[float] | None = None, *, encrypted: bool = False) -> bytes:
    writer = PdfWriter()
    for width in widths or [612]:
        writer.add_blank_page(width=width, height=792)
    if encrypted:
        writer.encrypt("secret")
    output = BytesIO()
    writer.write(output)
    return output.getvalue()


@pytest.fixture
def pdf_bytes() -> Callable[[list[float] | None], bytes]:
    return build_pdf


@pytest.fixture
def app():
    return create_app({"TESTING": True})


@pytest.fixture
def client(app):
    return app.test_client()

