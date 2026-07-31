"""PDF upload validation without permanent storage."""

from __future__ import annotations

from dataclasses import dataclass
from tempfile import SpooledTemporaryFile
from typing import BinaryIO

from pypdf import PdfReader
from pypdf.errors import PdfReadError
from werkzeug.datastructures import FileStorage


class PdfValidationError(Exception):
    """A safe validation error suitable for an API response."""

    def __init__(self, code: str, message: str, status: int = 400) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.status = status


@dataclass
class ValidatedPdf:
    """Validated PDF metadata and its temporary seekable stream."""

    stream: BinaryIO
    name: str
    size: int
    page_count: int

    def close(self) -> None:
        self.stream.close()


def validate_file_count(count: int, maximum: int, *, minimum: int = 2) -> None:
    """Enforce configured upload count limits."""

    if count < minimum:
        raise PdfValidationError(
            "TOO_FEW_FILES", f"Please select at least {minimum} PDF files."
        )
    if count > maximum:
        raise PdfValidationError(
            "TOO_MANY_FILES", f"You can merge no more than {maximum} PDF files."
        )


def validate_pdf(upload: FileStorage, max_size: int) -> ValidatedPdf:
    """Copy an upload to a spooled stream, enforce limits, and parse it."""

    name = upload.filename or ""
    if not name.lower().endswith(".pdf"):
        raise PdfValidationError(
            "INVALID_EXTENSION", "The selected file must have a .pdf extension."
        )

    stream = SpooledTemporaryFile(max_size=min(max_size, 8 * 1024 * 1024), mode="w+b")
    size = 0
    try:
        while chunk := upload.stream.read(64 * 1024):
            size += len(chunk)
            if size > max_size:
                raise PdfValidationError(
                    "FILE_TOO_LARGE", "A selected PDF exceeds the file size limit.", 413
                )
            stream.write(chunk)

        if size == 0:
            raise PdfValidationError("EMPTY_FILE", "A selected PDF file is empty.")

        stream.seek(0)
        try:
            reader = PdfReader(stream, strict=True)
            if reader.is_encrypted:
                raise PdfValidationError(
                    "ENCRYPTED_PDF",
                    "Password-protected PDFs are not supported in this version.",
                )
            page_count = len(reader.pages)
            # Access each page to surface delayed cross-reference errors.
            for page in reader.pages:
                _ = page.mediabox
        except PdfValidationError:
            raise
        except (PdfReadError, ValueError, TypeError, KeyError, OSError) as exc:
            raise PdfValidationError(
                "CORRUPTED_PDF", "The selected file is not a readable PDF."
            ) from exc

        stream.seek(0)
        return ValidatedPdf(stream=stream, name=name, size=size, page_count=page_count)
    except Exception:
        stream.close()
        raise


def close_validated_files(files: list[ValidatedPdf]) -> None:
    """Close all temporary streams, including streams rolled to disk."""

    for item in files:
        item.close()

