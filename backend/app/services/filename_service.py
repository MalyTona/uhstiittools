"""Safe output filename handling."""

from __future__ import annotations

import re

DEFAULT_FILENAME = "merged-document.pdf"
DEFAULT_SPLIT_FILENAME = "split.pdf"
DEFAULT_IMAGE_FILENAME = "converted.png"
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


def sanitise_image_filename(value: str | None, extension: str) -> str:
    """Return a safe base filename with the selected image extension."""

    safe_extension = extension.lower().lstrip(".")
    candidate = _UNSAFE.sub("-", (value or "").strip())
    candidate = _WHITESPACE.sub(" ", candidate).strip(" .-")
    known_extensions = (".png", ".jpg", ".jpeg", ".webp")
    lowered = candidate.lower()
    for known_extension in known_extensions:
        if lowered.endswith(known_extension):
            candidate = candidate[: -len(known_extension)].rstrip(" .")
            break
    if not candidate:
        candidate = "converted"
    maximum_stem_length = MAX_FILENAME_LENGTH - len(safe_extension) - 1
    stem = candidate[:maximum_stem_length].rstrip(" .") or "converted"
    return f"{stem}.{safe_extension}"
