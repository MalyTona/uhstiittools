"""HTTP routes for health, PDF metadata, PDF tools, and the production SPA."""

from __future__ import annotations

import logging
from io import BytesIO
from pathlib import Path
from secrets import token_hex
from urllib.parse import quote

from flask import Blueprint, current_app, jsonify, request, send_file, send_from_directory

from .services.filename_service import sanitise_pdf_filename, sanitise_split_filename
from .services.pdf_merger import merge_pdfs
from .services.pdf_splitter import SplitPdfPage, split_pdf_pages
from .services.pdf_validator import (
    PdfValidationError,
    ValidatedPdf,
    close_validated_files,
    validate_file_count,
    validate_pdf,
)

logger = logging.getLogger(__name__)
api = Blueprint("api", __name__)


def _serialise_pdf_parts(pages: list[SplitPdfPage], boundary: str) -> BytesIO:
    """Serialise page PDFs as a binary-safe multipart response stream."""

    output = BytesIO()
    for page in pages:
        filename = quote(page.filename, safe="")
        headers = (
            f"--{boundary}\r\n"
            "Content-Type: application/pdf\r\n"
            f"Content-Disposition: attachment; filename*=UTF-8''{filename}\r\n"
            f"X-Page-Number: {page.page_number}\r\n"
            f"Content-Length: {len(page.data)}\r\n\r\n"
        )
        output.write(headers.encode("ascii"))
        output.write(page.data)
        output.write(b"\r\n")
    output.write(f"--{boundary}--\r\n".encode("ascii"))
    output.seek(0)
    return output


@api.get("/health")
def health():
    return jsonify(status="ok", application="UHST-IIT PDF Merge Tools")


@api.post("/api/pdf-info")
def pdf_info():
    upload = request.files.get("file")
    if upload is None:
        raise PdfValidationError("NO_FILES", "Please select a PDF file.")

    validated = validate_pdf(upload, current_app.config["MAX_FILE_SIZE"])
    try:
        return jsonify(
            ok=True,
            file={
                "name": validated.name,
                "size": validated.size,
                "pages": validated.page_count,
                "encrypted": False,
            },
        )
    finally:
        validated.close()


@api.post("/api/merge")
def merge():
    uploads = request.files.getlist("files")
    validate_file_count(len(uploads), current_app.config["MAX_FILE_COUNT"])

    validated: list[ValidatedPdf] = []
    try:
        total_size = 0
        for upload in uploads:
            item = validate_pdf(upload, current_app.config["MAX_FILE_SIZE"])
            validated.append(item)
            total_size += item.size
            if total_size > current_app.config["MAX_TOTAL_SIZE"]:
                raise PdfValidationError(
                    "TOTAL_SIZE_TOO_LARGE",
                    "The combined PDF size exceeds the total upload limit.",
                    413,
                )

        output_filename = sanitise_pdf_filename(request.form.get("output_filename"))
        output, page_count = merge_pdfs(validated)
        response = send_file(
            output,
            mimetype="application/pdf",
            as_attachment=True,
            download_name=output_filename,
            max_age=0,
        )
        response.headers["X-Merged-File-Count"] = str(len(validated))
        response.headers["X-Merged-Page-Count"] = str(page_count)
        response.headers["Access-Control-Expose-Headers"] = (
            "Content-Disposition, X-Merged-File-Count, X-Merged-Page-Count"
        )
        response.call_on_close(output.close)
        logger.info("Merged %s PDF files into %s pages", len(validated), page_count)
        return response
    finally:
        close_validated_files(validated)


@api.post("/api/split")
def split():
    """Split one validated PDF into individually downloadable page PDFs."""

    upload = request.files.get("file")
    if upload is None:
        raise PdfValidationError("NO_FILES", "Please select a PDF file.")

    validated = validate_pdf(upload, current_app.config["MAX_FILE_SIZE"])
    try:
        output_filename = sanitise_split_filename(request.form.get("output_filename"))
        pages = split_pdf_pages(validated, output_filename)
        boundary = f"uhst-iit-pdf-{token_hex(16)}"
        output = _serialise_pdf_parts(pages, boundary)
        response = send_file(
            output,
            mimetype=f"multipart/mixed; boundary={boundary}",
            as_attachment=False,
            max_age=0,
        )
        response.headers["X-Split-Page-Count"] = str(len(pages))
        response.headers["Access-Control-Expose-Headers"] = (
            "Content-Type, X-Split-Page-Count"
        )
        response.call_on_close(output.close)
        logger.info("Split a PDF into %s pages", len(pages))
        return response
    finally:
        validated.close()


@api.get("/")
@api.get("/<path:path>")
def frontend(path: str = ""):
    """Serve the Vite production build, with SPA fallback."""

    if path.startswith("api/"):
        return jsonify(
            ok=False,
            error={"code": "NOT_FOUND", "message": "The requested API route was not found."},
        ), 404
    dist = Path(current_app.config["FRONTEND_DIST"])
    if not dist.is_dir():
        return jsonify(
            ok=False,
            error={
                "code": "FRONTEND_NOT_BUILT",
                "message": "The frontend production build is not available.",
            },
        ), 404
    requested = dist / path
    if path and requested.is_file():
        return send_from_directory(dist, path)
    return send_from_directory(dist, "index.html")
