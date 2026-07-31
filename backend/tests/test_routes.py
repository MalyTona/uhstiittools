from __future__ import annotations

from email.parser import BytesParser
from email.policy import default
from io import BytesIO

import pytest
from pypdf import PdfReader

from app import create_app
from app.services.pdf_validator import ValidatedPdf
from tests.conftest import build_pdf


def multipart_files(*items: tuple[bytes, str]):
    return {"files": [(BytesIO(data), name) for data, name in items]}


def test_health_and_security_headers(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.get_json() == {
        "status": "ok",
        "application": "UHST-IIT PDF Merge Tools",
    }
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "SAMEORIGIN"
    assert response.headers["Referrer-Policy"] == "no-referrer"
    assert response.headers["Cache-Control"] == "no-store"
    assert "default-src 'self'" in response.headers["Content-Security-Policy"]


def test_cors_allows_only_configured_frontend_origin():
    frontend_origin = "https://uhstiit-pdf-tools.vercel.app"
    app = create_app(
        {"TESTING": True, "CORS_ALLOWED_ORIGINS": (frontend_origin,)}
    )
    with app.test_client() as test_client:
        allowed = test_client.get("/health", headers={"Origin": frontend_origin})
        preflight = test_client.options(
            "/api/merge",
            headers={
                "Origin": frontend_origin,
                "Access-Control-Request-Method": "POST",
            },
        )
        rejected = test_client.get(
            "/health", headers={"Origin": "https://untrusted.example"}
        )

    assert allowed.headers["Access-Control-Allow-Origin"] == frontend_origin
    assert "Origin" in allowed.headers["Vary"]
    assert "X-Merged-Page-Count" in allowed.headers["Access-Control-Expose-Headers"]
    assert preflight.status_code == 200
    assert "POST" in preflight.headers["Access-Control-Allow-Methods"]
    assert "Access-Control-Allow-Origin" not in rejected.headers


def test_production_spa_and_assets_are_served(tmp_path):
    dist = tmp_path / "dist"
    assets = dist / "assets"
    assets.mkdir(parents=True)
    (dist / "index.html").write_text("<main>production app</main>", encoding="utf-8")
    (assets / "app.js").write_text("console.log('ready')", encoding="utf-8")
    app = create_app({"TESTING": True, "FRONTEND_DIST": str(dist)})
    with app.test_client() as test_client:
        root = test_client.get("/")
        asset = test_client.get("/assets/app.js")
        fallback = test_client.get("/future-client-route")
        missing_api = test_client.get("/api/does-not-exist")
    assert root.status_code == 200 and b"production app" in root.data
    assert asset.status_code == 200 and b"console.log" in asset.data
    assert fallback.status_code == 200 and b"production app" in fallback.data
    assert missing_api.status_code == 404
    assert missing_api.get_json()["error"]["code"] == "NOT_FOUND"


def test_pdf_info_returns_page_count(client):
    data = build_pdf([200, 300])
    response = client.post(
        "/api/pdf-info",
        data={"file": (BytesIO(data), "notes.pdf")},
        content_type="multipart/form-data",
    )
    assert response.status_code == 200
    body = response.get_json()
    assert body["ok"] is True
    assert body["file"]["pages"] == 2
    assert body["file"]["encrypted"] is False


def test_split_returns_ordered_individual_page_pdfs(client):
    response = client.post(
        "/api/split",
        data={
            "file": (BytesIO(build_pdf([111, 222, 333])), "source.pdf"),
            "output_filename": "../../course:pages",
        },
        content_type="multipart/form-data",
    )
    assert response.status_code == 200
    assert response.mimetype == "multipart/mixed"
    assert response.headers["X-Split-Page-Count"] == "3"
    mime_message = BytesParser(policy=default).parsebytes(
        b"Content-Type: "
        + response.headers["Content-Type"].encode("ascii")
        + b"\r\nMIME-Version: 1.0\r\n\r\n"
        + response.data
    )
    parts = list(mime_message.iter_parts())
    assert [part.get_filename() for part in parts] == [
        "course-pages-page-001.pdf",
        "course-pages-page-002.pdf",
        "course-pages-page-003.pdf",
    ]
    assert [part["X-Page-Number"] for part in parts] == ["1", "2", "3"]
    widths = [
        float(PdfReader(BytesIO(part.get_payload(decode=True))).pages[0].mediabox.width)
        for part in parts
    ]
    assert widths == [111, 222, 333]


@pytest.mark.parametrize(
    ("data", "name", "code"),
    [
        (b"", "empty.pdf", "EMPTY_FILE"),
        (b"broken", "broken.pdf", "CORRUPTED_PDF"),
        (build_pdf(), "wrong.txt", "INVALID_EXTENSION"),
        (build_pdf(encrypted=True), "secret.pdf", "ENCRYPTED_PDF"),
    ],
)
def test_split_returns_structured_validation_errors(client, data: bytes, name: str, code: str):
    response = client.post(
        "/api/split",
        data={"file": (BytesIO(data), name)},
        content_type="multipart/form-data",
    )
    assert response.status_code in (400, 413)
    assert response.get_json()["error"]["code"] == code
    assert "Traceback" not in response.get_data(as_text=True)


def test_merge_returns_pdf_metadata_and_safe_filename(client):
    response = client.post(
        "/api/merge",
        data={
            **multipart_files((build_pdf([210]), "one.pdf"), (build_pdf([220, 230]), "two.pdf")),
            "output_filename": "../../meeting:report",
        },
        content_type="multipart/form-data",
    )
    assert response.status_code == 200
    assert response.mimetype == "application/pdf"
    assert response.headers["X-Merged-File-Count"] == "2"
    assert response.headers["X-Merged-Page-Count"] == "3"
    assert "meeting-report.pdf" in response.headers["Content-Disposition"]
    assert len(PdfReader(BytesIO(response.data)).pages) == 3


def test_merge_preserves_repeated_field_order(client):
    response = client.post(
        "/api/merge",
        data=multipart_files(
            (build_pdf([111]), "z.pdf"),
            (build_pdf([222]), "a.pdf"),
            (build_pdf([333]), "m.pdf"),
        ),
        content_type="multipart/form-data",
    )
    widths = [float(page.mediabox.width) for page in PdfReader(BytesIO(response.data)).pages]
    assert widths == [111, 222, 333]


@pytest.mark.parametrize(
    ("data", "code"),
    [
        ({}, "TOO_FEW_FILES"),
        (multipart_files((build_pdf(), "only.pdf")), "TOO_FEW_FILES"),
        (multipart_files((b"", "empty.pdf"), (build_pdf(), "ok.pdf")), "EMPTY_FILE"),
        (multipart_files((b"broken", "bad.pdf"), (build_pdf(), "ok.pdf")), "CORRUPTED_PDF"),
        (multipart_files((build_pdf(), "wrong.txt"), (build_pdf(), "ok.pdf")), "INVALID_EXTENSION"),
        (multipart_files((build_pdf(encrypted=True), "secret.pdf"), (build_pdf(), "ok.pdf")), "ENCRYPTED_PDF"),
    ],
)
def test_merge_returns_structured_validation_errors(client, data, code):
    response = client.post("/api/merge", data=data, content_type="multipart/form-data")
    assert response.status_code in (400, 413)
    body = response.get_json()
    assert body["ok"] is False
    assert body["error"]["code"] == code
    assert "Traceback" not in response.get_data(as_text=True)


def test_too_many_files():
    app = create_app({"TESTING": True, "MAX_FILE_COUNT": 2})
    with app.test_client() as client:
        response = client.post(
            "/api/merge",
            data=multipart_files(
                (build_pdf(), "one.pdf"),
                (build_pdf(), "two.pdf"),
                (build_pdf(), "three.pdf"),
            ),
            content_type="multipart/form-data",
        )
    assert response.get_json()["error"]["code"] == "TOO_MANY_FILES"


def test_per_file_and_combined_size_limits():
    pdf = build_pdf()
    per_file_app = create_app({"TESTING": True, "MAX_FILE_SIZE": len(pdf) - 1})
    with per_file_app.test_client() as client:
        response = client.post(
            "/api/merge",
            data=multipart_files((pdf, "one.pdf"), (pdf, "two.pdf")),
            content_type="multipart/form-data",
        )
        assert response.status_code == 413
        assert response.get_json()["error"]["code"] == "FILE_TOO_LARGE"

    combined_app = create_app({"TESTING": True, "MAX_TOTAL_SIZE": len(pdf) + 10})
    with combined_app.test_client() as client:
        response = client.post(
            "/api/merge",
            data=multipart_files((pdf, "one.pdf"), (pdf, "two.pdf")),
            content_type="multipart/form-data",
        )
        assert response.status_code == 413
        assert response.get_json()["error"]["code"] == "TOTAL_SIZE_TOO_LARGE"


def test_temporary_streams_are_closed(client, monkeypatch):
    import app.routes as routes

    streams: list[BytesIO] = []

    def fake_validate(upload, _limit):
        stream = BytesIO(build_pdf())
        streams.append(stream)
        return ValidatedPdf(stream, upload.filename or "file.pdf", len(stream.getvalue()), 1)

    monkeypatch.setattr(routes, "validate_pdf", fake_validate)
    response = client.post(
        "/api/merge",
        data=multipart_files((b"one", "one.pdf"), (b"two", "two.pdf")),
        content_type="multipart/form-data",
    )
    assert response.status_code == 200
    assert all(stream.closed for stream in streams)


def test_unexpected_error_does_not_expose_traceback(client, monkeypatch):
    import app.routes as routes

    def fail(_files):
        raise RuntimeError("private absolute path C:\\secret\\document.pdf")

    monkeypatch.setattr(routes, "merge_pdfs", fail)
    response = client.post(
        "/api/merge",
        data=multipart_files((build_pdf(), "one.pdf"), (build_pdf(), "two.pdf")),
        content_type="multipart/form-data",
    )
    text = response.get_data(as_text=True)
    assert response.status_code == 500
    assert response.get_json()["error"]["code"] == "SERVER_ERROR"
    assert "secret" not in text
    assert "Traceback" not in text
