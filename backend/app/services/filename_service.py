"""Safe output filename handling."""

from __future__ import annotations

import re

DEFAULT_FILENAME = "merged-document.pdf"
DEFAULT_SPLIT_FILENAME = "split.pdf"
MAX_FILENAME_LENGTH = 120
_UNSAFE = re.compile(r"[\\/:*?\"<>|\x00-\x1f\x7f]+")
_WHITESPACE = re.compile(r"\s+")


def sanitise_pdf_filename(value: str | None) -> str:
    """Return a path-safe PDF filename with a predictable fallback."""

    candidate = _UNSAFE.sub("-", (value or "").strip())
    candidate = _WHITESPACE.sub(" ", candidate).strip(" .-")
    if candidate.lower().endswith(".pdf"):
        stem = candidate[:-4].rstrip(" .")
    else:
        stem = candidate
    if not stem:
        return DEFAULT_FILENAME
    stem = stem[: MAX_FILENAME_LENGTH - 4].rstrip(" .")
    return f"{stem or 'merged-document'}.pdf"


def sanitise_split_filename(value: str | None) -> str:
    """Return a safe PDF base filename for split-page downloads."""

    candidate = _UNSAFE.sub("-", (value or "").strip())
    candidate = _WHITESPACE.sub(" ", candidate).strip(" .-")
    if candidate.lower().endswith(".pdf"):
        stem = candidate[:-4].rstrip(" .")
    else:
        stem = candidate
    if not stem:
        return DEFAULT_SPLIT_FILENAME
    stem = stem[: MAX_FILENAME_LENGTH - 4].rstrip(" .")
    return f"{stem or 'split'}.pdf"
