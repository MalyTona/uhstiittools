from __future__ import annotations

from io import BytesIO

from pypdf import PdfReader

from app.services.pdf_splitter import split_pdf_pages
from app.services.pdf_validator import ValidatedPdf
from tests.conftest import build_pdf


def test_split_pdf_creates_one_ordered_pdf_per_page():
    data = build_pdf([111, 222, 333])
    source = ValidatedPdf(BytesIO(data), "source.pdf", len(data), 3)
    pages = split_pdf_pages(source, "course-material.pdf")
    try:
        assert [page.filename for page in pages] == [
            "course-material-page-001.pdf",
            "course-material-page-002.pdf",
            "course-material-page-003.pdf",
        ]
        assert [page.page_number for page in pages] == [1, 2, 3]
        widths = [
            float(PdfReader(BytesIO(page.data)).pages[0].mediabox.width)
            for page in pages
        ]
        assert widths == [111, 222, 333]
    finally:
        source.close()
