from __future__ import annotations

from io import BytesIO

import pytest
from werkzeug.datastructures import FileStorage

from app.services.pdf_validator import PdfValidationError, validate_file_count, validate_pdf
from tests.conftest import build_pdf


def upload(data: bytes, name: str = "document.pdf") -> FileStorage:
    return FileStorage(stream=BytesIO(data), filename=name, content_type="application/pdf")


def test_valid_pdf_returns_metadata():
    validated = validate_pdf(upload(build_pdf([300, 400])), 1024 * 1024)
    try:
        assert validated.page_count == 2
        assert validated.size > 0
        assert validated.stream.seekable()
    finally:
        validated.close()


@pytest.mark.parametrize(
    ("data", "name", "limit", "code"),
    [
        (b"", "empty.pdf", 1000, "EMPTY_FILE"),
        (b"not a pdf", "bad.pdf", 1000, "CORRUPTED_PDF"),
        (build_pdf(), "document.txt", 1000, "INVALID_EXTENSION"),
        (build_pdf(), "large.pdf", 10, "FILE_TOO_LARGE"),
        (build_pdf(encrypted=True), "secret.pdf", 2000, "ENCRYPTED_PDF"),
    ],
)
def test_rejects_invalid_uploads(data: bytes, name: str, limit: int, code: str):
    with pytest.raises(PdfValidationError) as caught:
        validate_pdf(upload(data, name), limit)
    assert caught.value.code == code


def test_file_count_limits():
    with pytest.raises(PdfValidationError, match="at least") as too_few:
        validate_file_count(1, 20)
    assert too_few.value.code == "TOO_FEW_FILES"
    with pytest.raises(PdfValidationError, match="no more") as too_many:
        validate_file_count(21, 20)
    assert too_many.value.code == "TOO_MANY_FILES"

