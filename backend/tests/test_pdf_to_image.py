from __future__ import annotations

from io import BytesIO

import pytest
from PIL import Image

from app.services.pdf_to_image import convert_pdf_to_images, validate_image_format
from app.services.pdf_validator import PdfValidationError, ValidatedPdf
from tests.conftest import build_pdf


@pytest.mark.parametrize(
    ("image_format", "pillow_format", "extension", "mime_type"),
    [
        ("png", "PNG", ".png", "image/png"),
        ("jpg", "JPEG", ".jpg", "image/jpeg"),
        ("webp", "WEBP", ".webp", "image/webp"),
    ],
)
def test_converts_pages_in_order(image_format, pillow_format, extension, mime_type):
    data = build_pdf([72, 144])
    source = ValidatedPdf(BytesIO(data), "source.pdf", len(data), 2)
    try:
        pages = convert_pdf_to_images(source, f"lecture{extension}", image_format)
    finally:
        source.close()

    assert [page.page_number for page in pages] == [1, 2]
    assert [page.filename for page in pages] == [
        f"lecture-page-001{extension}",
        f"lecture-page-002{extension}",
    ]
    assert all(page.mime_type == mime_type for page in pages)
    images = [Image.open(BytesIO(page.data)) for page in pages]
    try:
        assert [image.format for image in images] == [pillow_format, pillow_format]
        assert images[1].width == images[0].width * 2
    finally:
        for image in images:
            image.close()


def test_image_format_normalizes_jpeg_and_rejects_unknown_values():
    assert validate_image_format("JPEG") == "jpg"
    with pytest.raises(PdfValidationError) as error:
        validate_image_format("svg")
    assert error.value.code == "INVALID_IMAGE_FORMAT"


def test_rejects_page_dimensions_that_would_use_excessive_image_memory():
    data = build_pdf([20_000])
    source = ValidatedPdf(BytesIO(data), "oversized.pdf", len(data), 1)
    try:
        with pytest.raises(PdfValidationError) as error:
            convert_pdf_to_images(source, "converted.png", "png")
    finally:
        source.close()
    assert error.value.code == "IMAGE_PAGE_TOO_LARGE"
    assert error.value.status == 413
