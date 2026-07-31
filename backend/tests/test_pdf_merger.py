from __future__ import annotations

from io import BytesIO

from pypdf import PdfReader

from app.services.pdf_merger import merge_pdfs
from app.services.pdf_validator import ValidatedPdf
from tests.conftest import build_pdf


def validated(data: bytes, name: str, pages: int) -> ValidatedPdf:
    return ValidatedPdf(BytesIO(data), name, len(data), pages)


def test_merge_two_pdfs_preserves_every_page():
    items = [validated(build_pdf([200]), "one.pdf", 1), validated(build_pdf([300, 400]), "two.pdf", 2)]
    output, total = merge_pdfs(items)
    try:
        reader = PdfReader(output)
        assert total == 3
        assert len(reader.pages) == 3
    finally:
        output.close()
        for item in items:
            item.close()


def test_merge_three_pdfs_preserves_file_order():
    items = [
        validated(build_pdf([111]), "first.pdf", 1),
        validated(build_pdf([222]), "second.pdf", 1),
        validated(build_pdf([333]), "third.pdf", 1),
    ]
    output, _ = merge_pdfs(items)
    try:
        widths = [float(page.mediabox.width) for page in PdfReader(output).pages]
        assert widths == [111, 222, 333]
    finally:
        output.close()
        for item in items:
            item.close()

