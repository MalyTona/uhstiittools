"""Render validated PDF pages as ordered image files."""

from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO
from math import ceil
from pathlib import PurePath
from typing import Final, Literal, cast

import pypdfium2 as pdfium
from PIL import Image

from .pdf_validator import PdfValidationError, ValidatedPdf

ImageFormat = Literal["png", "jpg", "webp"]


@dataclass(frozen=True, slots=True)
class ImageFormatSpec:
    """Encoding metadata for one supported output format."""

    extension: str
    mime_type: str
    pillow_format: str


@dataclass(frozen=True, slots=True)
class ConvertedImagePage:
    """One rendered PDF page and its safe download metadata."""

    page_number: int
    filename: str
    mime_type: str
    data: bytes


IMAGE_FORMATS: Final[dict[ImageFormat, ImageFormatSpec]] = {
    "png": ImageFormatSpec("png", "image/png", "PNG"),
    "jpg": ImageFormatSpec("jpg", "image/jpeg", "JPEG"),
    "webp": ImageFormatSpec("webp", "image/webp", "WEBP"),
}
RENDER_DPI: Final[int] = 150
MAX_PAGE_PIXELS: Final[int] = 25_000_000
MAX_TOTAL_PIXELS: Final[int] = 100_000_000


def validate_image_format(value: str | None) -> ImageFormat:
    """Normalize and validate a requested image output format."""

    normalized = (value or "png").strip().lower()
    if normalized == "jpeg":
        normalized = "jpg"
    if normalized not in IMAGE_FORMATS:
        raise PdfValidationError(
            "INVALID_IMAGE_FORMAT",
            "Choose PNG, JPEG, or WebP as the image format.",
        )
    return cast(ImageFormat, normalized)


def convert_pdf_to_images(
    source: ValidatedPdf,
    output_filename: str,
    image_format: ImageFormat,
) -> list[ConvertedImagePage]:
    """Render every source page to an ordered in-memory image at 150 DPI."""

    spec = IMAGE_FORMATS[image_format]
    source.stream.seek(0)
    document_bytes = source.stream.read()
    output_stem = PurePath(output_filename).stem
    padding = max(3, len(str(source.page_count)))
    outputs: list[ConvertedImagePage] = []
    document = pdfium.PdfDocument(document_bytes)
    try:
        total_pixels = 0
        for index in range(len(document)):
            page = document[index]
            try:
                width_points, height_points = page.get_size()
            finally:
                page.close()
            page_pixels = ceil(width_points * RENDER_DPI / 72) * ceil(
                height_points * RENDER_DPI / 72
            )
            if page_pixels > MAX_PAGE_PIXELS:
                raise PdfValidationError(
                    "IMAGE_PAGE_TOO_LARGE",
                    "A PDF page is too large to convert safely.",
                    413,
                )
            total_pixels += page_pixels
            if total_pixels > MAX_TOTAL_PIXELS:
                raise PdfValidationError(
                    "IMAGE_OUTPUT_TOO_LARGE",
                    "The PDF has too many pixels to convert safely.",
                    413,
                )

        for index in range(len(document)):
            page = document[index]
            bitmap = None
            image = None
            encoded = BytesIO()
            try:
                bitmap = page.render(scale=RENDER_DPI / 72)
                image = bitmap.to_pil()
                if image_format == "jpg" and image.mode != "RGB":
                    converted = image.convert("RGB")
                    image.close()
                    image = converted

                save_options: dict[str, object] = {}
                if image_format in ("jpg", "webp"):
                    save_options["quality"] = 90
                image.save(encoded, format=spec.pillow_format, **save_options)
                page_number = index + 1
                outputs.append(
                    ConvertedImagePage(
                        page_number=page_number,
                        filename=(
                            f"{output_stem}-page-{page_number:0{padding}d}.{spec.extension}"
                        ),
                        mime_type=spec.mime_type,
                        data=encoded.getvalue(),
                    )
                )
            finally:
                encoded.close()
                if image is not None:
                    image.close()
                if bitmap is not None:
                    bitmap.close()
                page.close()
    finally:
        document.close()

    return outputs
