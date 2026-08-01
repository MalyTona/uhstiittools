from app.services.filename_service import (
    DEFAULT_FILENAME,
    DEFAULT_SPLIT_FILENAME,
    sanitise_image_filename,
    sanitise_pdf_filename,
    sanitise_split_filename,
)


def test_adds_pdf_extension():
    assert sanitise_pdf_filename("meeting notes") == "meeting notes.pdf"


def test_preserves_existing_extension_case_insensitively():
    assert sanitise_pdf_filename("report.PDF") == "report.pdf"


def test_removes_path_characters_and_traversal():
    result = sanitise_pdf_filename("../../private\\report:final?.pdf")
    assert result == "private-report-final-.pdf"
    assert "/" not in result and "\\" not in result


def test_empty_name_uses_safe_fallback():
    assert sanitise_pdf_filename(" .. ") == DEFAULT_FILENAME


def test_split_base_name_is_safe_and_gets_pdf_extension():
    assert sanitise_split_filename("../../semester:pages") == "semester-pages.pdf"
    assert sanitise_split_filename(" .. ") == DEFAULT_SPLIT_FILENAME


def test_image_base_name_is_safe_and_uses_selected_extension():
    assert sanitise_image_filename("../../lecture:pages.jpeg", "webp") == "lecture-pages.webp"
    assert sanitise_image_filename(" .. ", "jpg") == "converted.jpg"
