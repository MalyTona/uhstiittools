"""Order-preserving PDF merge operations."""

from __future__ import annotations

from io import BytesIO

from pypdf import PdfReader, PdfWriter

from .pdf_validator import ValidatedPdf


def merge_pdfs(files: list[ValidatedPdf]) -> tuple[BytesIO, int]:
    """Merge every page from each validated file in displayed order."""

    writer = PdfWriter()
    total_pages = 0
    for item in files:
        item.stream.seek(0)
        reader = PdfReader(item.stream, strict=True)
        for page in reader.pages:
            writer.add_page(page)
            total_pages += 1

    output = BytesIO()
    writer.write(output)
    output.seek(0)
    return output, total_pages

