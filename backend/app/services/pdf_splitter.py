"""PDF splitting into independent page documents."""

from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO
from pathlib import PurePath

from pypdf import PdfReader, PdfWriter

from .pdf_validator import ValidatedPdf


@dataclass(frozen=True, slots=True)
class SplitPdfPage:
    """One generated page PDF and its safe download metadata."""

    page_number: int
    filename: str
    data: bytes


def split_pdf_pages(source: ValidatedPdf, output_filename: str) -> list[SplitPdfPage]:
    """Return one independent PDF document for every source page."""

    source.stream.seek(0)
    reader = PdfReader(source.stream, strict=True)
    page_count = len(reader.pages)
    output_stem = PurePath(output_filename).stem
    padding = max(3, len(str(page_count)))
    outputs: list[SplitPdfPage] = []

    for index, page in enumerate(reader.pages, start=1):
        writer = PdfWriter()
        writer.add_page(page)
        page_output = BytesIO()
        try:
            writer.write(page_output)
            outputs.append(
                SplitPdfPage(
                    page_number=index,
                    filename=f"{output_stem}-page-{index:0{padding}d}.pdf",
                    data=page_output.getvalue(),
                )
            )
        finally:
            page_output.close()

    return outputs
