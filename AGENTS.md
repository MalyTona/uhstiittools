# AGENTS.md

## Purpose

UHST-IIT PDF Merge Tools is a privacy-focused English/Khmer PDF merger and page splitter for the University of Heng Samrin Thbongkhmum Institute of Information Technology.

## Architecture rules

- Keep the React/TypeScript/Vite frontend in `frontend/` and Flask/pypdf backend in `backend/`.
- Presentation components do not call the API directly. API calls belong in `src/services`; reusable state belongs in hooks.
- Route handlers delegate PDF validation, merging, splitting, and filename handling to `backend/app/services`.
- Production uses the Vite build in `frontend/dist`; development uses the Vite proxy.
- Do not add a database, authentication, analytics, cloud processing, paid APIs, or third-party document services.

## Install and run

```text
Windows development: scripts\run-dev.bat
POSIX development:   ./scripts/run-dev.sh
Windows production:  scripts\build-production.bat
POSIX production:    ./scripts/build-production.sh
```

Manual backend install: `python -m venv backend/.venv`, then install `backend/requirements-dev.txt` with that environment's Python.

Manual frontend install: run `npm install` in `frontend`.

## Test commands

```text
backend/.venv/Scripts/python.exe -m pytest backend
cd frontend && npm test
cd frontend && npm run build
```

Use the corresponding `.venv/bin/python` path on Linux/macOS.

## Coding style

- TypeScript is strict. Do not introduce `any`; model API and component props explicitly.
- Prefer small, typed React components and focused hooks. Do not add a global state library unless requirements materially change.
- Use CSS custom properties in `styles/tokens.css`; keep ordinary styling out of inline attributes.
- Python public functions have type hints and short docstrings. Keep route handlers small and avoid catching exceptions inside PDF service logic unless mapping a known validation error.
- Never expose raw exceptions, tracebacks, server paths, or implementation details to users.

## Translation rules

- Every user-facing string must be a translation key in both `src/i18n/en.ts` and `src/i18n/km.ts`.
- Keep the key sets synchronized; TypeScript's `Record<TranslationKey, string>` check must continue to pass.
- Preserve UTF-8 Khmer text and the configured Khmer-compatible font stack.
- Store only the `en` or `km` preference in local storage.

## Security and privacy rules

- Validate count, size, total size, extension, PDF readability, corruption, encryption, and output filename on the backend.
- Browser validation improves feedback but never replaces backend validation.
- Do not log document contents, extracted text, binary data, or confidential filenames.
- Do not permanently store uploads or output PDFs.
- Do not weaken response security headers without documenting a concrete deployment need.

## Merge-order rule

The displayed ordered `SelectedPdfFile[]` is authoritative. Append repeated `files` fields to `FormData` in array order and use `request.files.getlist("files")` in that received order. Never sort by filename and never deduplicate; repeated PDFs may be intentional.

## Split-order rule

Splitting accepts exactly one validated PDF. Create one single-page PDF per source page, preserve source page order, return the documents as binary multipart data, and expose each page as an individual browser download with zero-padded page numbers. Do not bundle split results in an archive.

## Temporary-file rule

Use memory or `SpooledTemporaryFile` with automatic OS temporary rollover. Close every upload/output stream in `finally` blocks or response close callbacks. Never write PDFs to a repository directory, create an upload history, or commit test/output PDFs.

## Required test updates

Every behavior change must update or add tests. Preserve coverage for exact merge order, duplicate files, split page order, structured errors, size/count limits, encryption, cleanup, localization, keyboard ordering, `FormData` fields/order, object URL cleanup, and production build success.
