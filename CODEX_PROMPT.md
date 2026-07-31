# Codex Build Prompt — UHST-IIT PDF Merge Tools

## 1. Role

Act as a senior full-stack engineer, UX/UI designer, accessibility specialist, security reviewer, and software tester.

Build a complete working application named:

**UHST-IIT PDF Merge Tools**

Institution:

**University of Heng Samrin Thbongkhmum**  
**Institute of Information Technology — IIT**

Do not create only a mock-up or partial scaffold. Implement, test, run, and verify the full application.

---

## 2. Product Goal

Create a modern bilingual PDF-merging web application that allows users to:

1. Select multiple PDF files.
2. Add additional PDF files later.
3. Reorder files before merging.
4. Remove selected files.
5. View file size and page count.
6. Enter a custom output filename.
7. Merge files in the exact displayed order.
8. Download the merged PDF.
9. Reset and start another merge.

Files must be processed locally by the application and must not be uploaded to third-party services.

---

## 3. Required Architecture

Use a separated frontend and backend architecture.

### Frontend

Use:

- React
- TypeScript
- Vite
- Modern CSS with CSS custom properties
- Fetch API
- Vitest
- React Testing Library
- An accessible drag-and-drop solution only when necessary

### Backend

Use:

- Python 3.11 or newer
- Flask
- pypdf
- Pytest
- Standard Python logging

### Architecture Diagram

```text
Browser
   │
   ▼
React + TypeScript + Vite
   │
   ├── GET /health
   ├── POST /api/pdf-info
   └── POST /api/merge
            │
            ▼
       Flask backend
            │
            ▼
          pypdf
```

Do not use:

- Nuxt
- Vue
- Next.js
- Angular
- Laravel
- Django
- jQuery
- Bootstrap
- Tailwind CSS
- A database
- User authentication
- Paid APIs
- Cloud document-processing services

---

## 4. Source of Truth

Read the complete `design.md` file before implementation.

Treat `design.md` as the primary specification for:

- Branding
- Layout
- Components
- Colours
- Typography
- Responsive behaviour
- English and Khmer interface
- Accessibility
- User states
- Error handling
- Privacy messaging
- API interaction
- Frontend state
- Security expectations

If a design decision must be changed for technical, usability, accessibility, or security reasons, document the reason in the completion report.

---

## 5. Project Structure

Create or refactor the project into this structure:

```text
uhst-iit-pdf-tools/
│
├── AGENTS.md
├── CODEX_PROMPT.md
├── design.md
├── README.md
├── LICENSE
├── .gitignore
├── .env.example
│
├── frontend/
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── index.html
│   │
│   ├── public/
│   │   └── images/
│   │       └── README.md
│   │
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── vite-env.d.ts
│       │
│       ├── components/
│       │   ├── AppHeader.tsx
│       │   ├── LanguageSwitcher.tsx
│       │   ├── ToolIntroduction.tsx
│       │   ├── UploadDropzone.tsx
│       │   ├── SelectedFiles.tsx
│       │   ├── PdfFileItem.tsx
│       │   ├── OutputSettings.tsx
│       │   ├── ActionButtons.tsx
│       │   ├── ProcessingStatus.tsx
│       │   ├── MergeResult.tsx
│       │   ├── ErrorAlert.tsx
│       │   └── AppFooter.tsx
│       │
│       ├── hooks/
│       │   ├── usePdfFiles.ts
│       │   ├── usePdfMerge.ts
│       │   └── useLanguage.ts
│       │
│       ├── services/
│       │   └── pdfApi.ts
│       │
│       ├── i18n/
│       │   ├── en.ts
│       │   ├── km.ts
│       │   └── index.ts
│       │
│       ├── types/
│       │   └── pdf.ts
│       │
│       ├── utils/
│       │   ├── fileSize.ts
│       │   ├── filename.ts
│       │   └── validation.ts
│       │
│       └── styles/
│           ├── tokens.css
│           ├── global.css
│           └── components.css
│
├── backend/
│   ├── run.py
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── pytest.ini
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── routes.py
│   │   ├── error_handlers.py
│   │   │
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── pdf_merger.py
│   │       ├── pdf_validator.py
│   │       └── filename_service.py
│   │
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py
│       ├── test_routes.py
│       ├── test_pdf_merger.py
│       ├── test_pdf_validator.py
│       └── test_filename_service.py
│
└── scripts/
    ├── run-dev.bat
    ├── run-dev.sh
    ├── build-production.bat
    └── build-production.sh
```

Do not commit uploaded PDFs or generated output PDFs.

---

## 6. Branding

Application name:

**UHST-IIT PDF Merge Tools**

Institution names:

**University of Heng Samrin Thbongkhmum**  
**Institute of Information Technology**

Use these colours:

```text
Primary: #25457f
Accent:  #f78a00
```

Design characteristics:

- Modern
- Clean
- Minimal
- Professional
- University-focused
- Responsive
- Accessible
- Easy to understand

Do not copy another university website.

Do not invent a fake university logo.

Reserve this optional logo location:

```text
frontend/public/images/uhst-logo.png
```

When the logo does not exist, display a text-based institutional brand.

---

## 7. Frontend Requirements

### 7.1 Main Interface

Create a single-page application with:

1. Header
2. Language switcher
3. Tool introduction
4. Privacy notice
5. PDF upload area
6. Selected file list
7. Output filename input
8. Merge and Reset buttons
9. Processing state
10. Success result
11. Error state
12. Footer

### 7.2 Upload Area

Support:

- Clicking the upload area
- Selecting multiple files
- Dragging and dropping files
- Adding more files without replacing earlier files
- PDF-only client checks
- Idle state
- Hover state
- Drag-over state
- Invalid state
- Disabled state during processing

### 7.3 Selected Files

For each file show:

- Drag handle
- Merge order number
- PDF icon
- Filename
- File size
- Page count when available
- Validation status
- Remove button

Users must be able to:

- Reorder files
- Remove files
- Add more files
- See the exact merge order

The visual order must be the order submitted to the backend.

### 7.4 Output Filename

Default:

```text
merged-document.pdf
```

Requirements:

- Add `.pdf` automatically when omitted.
- Show helper text.
- Show inline validation.
- Keep the final backend filename sanitisation authoritative.

### 7.5 Actions

Buttons:

- Reset
- Merge PDFs

Disable Merge PDFs until:

- At least two valid PDF files exist.
- Validation is complete.
- No merge request is running.

Prevent duplicate submissions.

### 7.6 Processing

Use these states:

```text
idle
validating
ready
uploading
merging
completed
error
```

During processing:

- Disable editing and reordering.
- Show an indeterminate progress indicator.
- Show a clear message.
- Do not display a fake numerical percentage.

### 7.7 Success Result

Show:

- Success icon
- Success message
- Number of merged files
- Total page count when available
- Output filename
- Download button
- Start Another Merge button

### 7.8 Errors

Design clear messages for:

- No files
- Only one file
- Invalid type
- Empty file
- Corrupted PDF
- Encrypted PDF
- File too large
- Too many files
- Total upload too large
- Merge failed
- Server error
- Network error

Do not display:

- Python tracebacks
- Raw stack traces
- Absolute paths
- Sensitive server details

---

## 8. TypeScript Models

Create explicit types.

Example:

```typescript
export type PdfFileStatus =
  | "validating"
  | "valid"
  | "invalid";

export type MergeStatus =
  | "idle"
  | "validating"
  | "ready"
  | "uploading"
  | "merging"
  | "completed"
  | "error";

export interface SelectedPdfFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount?: number;
  status: PdfFileStatus;
  errorCode?: string;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface MergeResult {
  filename: string;
  fileCount: number;
  pageCount?: number;
  downloadUrl: string;
}
```

Avoid `any`.

---

## 9. React State Rules

Use an ordered array of selected files as the single source of truth.

When files are reordered:

1. Update the ordered array.
2. Renumber the interface.
3. Submit files in the updated order.

When submitting:

```typescript
const formData = new FormData();

orderedFiles.forEach((item) => {
  formData.append("files", item.file);
});

formData.append("output_filename", outputFilename);
```

Do not sort by filename.

Do not automatically deduplicate files. A user may intentionally include the same PDF more than once.

Revoke Blob object URLs after:

- Reset
- New result replacement
- Component unmount

---

## 10. Localisation

Support:

- English
- Khmer

Store translations in:

```text
frontend/src/i18n/en.ts
frontend/src/i18n/km.ts
```

All user-facing text must use translation keys, including:

- Headings
- Buttons
- Labels
- Instructions
- Privacy messages
- Validation messages
- API error messages
- Processing messages
- Success messages
- Footer text

Store the selected language in `localStorage`.

Use UTF-8.

Recommended font stack:

```css
font-family:
  "Noto Sans Khmer",
  "Khmer OS System",
  "Segoe UI",
  Arial,
  sans-serif;
```

Do not package font files.

---

## 11. Responsive Design

Support:

- Desktop
- Laptop
- Tablet
- Mobile
- Small mobile screens

Requirements:

- No unnecessary horizontal scrolling.
- File names truncate safely.
- Buttons remain touch-friendly.
- Primary touch targets are at least approximately 44px high.
- Action buttons stack on mobile.
- Header content wraps safely.
- Khmer text remains readable.
- File removal remains visible.
- Long filenames do not break the layout.

---

## 12. Accessibility

Follow WCAG 2.1 AA principles where practical.

Implement:

- Semantic HTML
- Visible labels
- Keyboard navigation
- Visible focus states
- Accessible icon buttons
- Accessible drag-and-drop behaviour
- Move Up and Move Down controls when necessary for keyboard ordering
- `aria-live` status regions
- Proper heading hierarchy
- Sufficient contrast
- Reduced-motion support
- Focus management after success and errors
- No colour-only status indication

---

## 13. Frontend API Service

Create:

```text
frontend/src/services/pdfApi.ts
```

Responsibilities:

- Upload files for PDF metadata
- Send merge request
- Parse Blob success responses
- Parse JSON error responses
- Avoid hard-coded backend URLs
- Handle network failures
- Return typed results

During development, configure Vite to proxy:

```text
/api
/health
```

to the Flask backend.

---

## 14. Backend API

### `GET /health`

Return:

```json
{
  "status": "ok",
  "application": "UHST-IIT PDF Merge Tools"
}
```

### `POST /api/pdf-info`

Accept one PDF using multipart form data.

Return metadata:

```json
{
  "ok": true,
  "file": {
    "name": "report.pdf",
    "size": 245120,
    "pages": 8,
    "encrypted": false
  }
}
```

This route may be omitted only if validation during merge provides a simpler, reliable implementation. If omitted, update the frontend design accordingly and document the reason.

### `POST /api/merge`

Accept:

```text
files
output_filename
```

Requirements:

- Preserve repeated `files` field order.
- Validate all files.
- Merge every page in order.
- Return a downloadable PDF.
- Use MIME type `application/pdf`.
- Use a safe `Content-Disposition` filename.
- Return structured JSON errors on failure.

Example error:

```json
{
  "ok": false,
  "error": {
    "code": "INVALID_PDF",
    "message": "The selected file is not a valid PDF."
  }
}
```

---

## 15. Backend Validation

Default limits:

```text
Minimum files: 2
Maximum files: 20
Maximum one-file size: 50 MB
Maximum combined size: 200 MB
```

Validate:

1. File count
2. Empty files
3. File size
4. Combined size
5. `.pdf` extension
6. PDF structure
7. Corruption
8. Encryption
9. Output filename
10. Path traversal attempts

Reject encrypted or password-protected PDFs in version 1.

Do not trust browser MIME type or filename alone.

---

## 16. PDF Processing

Use:

- `pypdf.PdfReader`
- `pypdf.PdfWriter`

Requirements:

- Preserve input order.
- Preserve every page.
- Do not rasterise.
- Do not convert pages to images.
- Do not reduce quality.
- Do not add watermarks.
- Do not modify source files.
- Close streams correctly.
- Clean temporary resources.

---

## 17. Temporary File and Privacy Rules

- Do not permanently store uploaded files.
- Use memory or secure temporary directories.
- Use random temporary names.
- Delete temporary files after processing.
- Do not create a permanent upload history.
- Do not log PDF contents.
- Avoid logging confidential filenames unnecessarily.
- Never send files to third-party services.

---

## 18. Security Headers

Add appropriate headers, including:

```text
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: no-referrer
Cache-Control: no-store
```

Add a restrictive Content Security Policy compatible with the built React application.

Do not rely on a public CDN for essential runtime assets.

---

## 19. Production Build

Development:

- React runs through Vite.
- Flask runs separately.
- Vite proxies API requests.

Production:

1. Run the frontend build.
2. Generate files in `frontend/dist`.
3. Serve the built files through Flask or a reverse proxy.
4. Use the same origin for frontend and API where practical.
5. Do not require Vite in production.

Configure Flask or the server to return `index.html` for the frontend root.

Because version 1 is a single-page tool, do not add a routing library unless necessary.

---

## 20. Frontend Tests

Use Vitest and React Testing Library.

Test at least:

1. Empty state
2. Multiple file selection
3. Adding additional files
4. Rejecting a non-PDF
5. File removal
6. File reordering
7. Keyboard reordering
8. Merge disabled with fewer than two valid files
9. Exact FormData order
10. Processing state
11. Successful Blob response
12. API error display
13. English and Khmer switching
14. Language persistence
15. Reset behaviour
16. Object URL cleanup
17. Long filename handling
18. Mobile-safe component behaviour where practical

---

## 21. Backend Tests

Use Pytest.

Test at least:

1. Merge two PDFs
2. Merge three PDFs in order
3. Total page count
4. Too few files
5. Too many files
6. Empty file
7. Invalid extension
8. Corrupted PDF
9. Encrypted PDF
10. Per-file size limit
11. Combined size limit
12. Safe filename
13. Automatic `.pdf` extension
14. Correct MIME type
15. `/health`
16. Temporary cleanup
17. No traceback exposure
18. Security headers

Generate small PDFs programmatically for tests.

Do not include confidential sample documents.

---

## 22. Documentation

Create or update:

### `README.md`

Include:

- Overview
- Features
- Architecture
- Privacy 
- Prerequisites
- Frontend installation
- Backend installation
- Development commands
- Production build
- Testing
- Environment variables
- Troubleshooting
- Future roadmap

### `AGENTS.md`

Include:

- Project purpose
- Architecture rules
- Install commands
- Run commands
- Test commands
- Coding style
- Translation rules
- Security rules
- Privacy rules
- Merge-order rule
- Temporary-file rule
- Requirement to update tests

### `.env.example`

Document:

- Flask environment
- Secret key
- Host
- Port
- Maximum file count
- Maximum file size
- Maximum total size
- Frontend development proxy target

---

## 23. Convenience Scripts

Create:

### `scripts/run-dev.bat`

Start backend and frontend development servers on Windows.

### `scripts/run-dev.sh`

Equivalent for Linux and macOS.

### `scripts/build-production.bat`

Install dependencies, run tests, and build the production frontend.

### `scripts/build-production.sh`

Equivalent for Linux and macOS.

Avoid administrator privileges.

---

## 24. Code Quality

Frontend:

- Small components
- Typed props
- Typed API responses
- Reusable hooks
- Reusable design tokens
- No unnecessary global state library
- No inline CSS for normal styling
- No duplicated translation strings
- No unfinished placeholder controls

Backend:

- Type hints
- Docstrings for public functions
- Small route handlers
- Service-layer separation
- Context managers
- Standard logging
- No PDF logic in route handlers
- No raw exceptions in user responses

---

## 25. Acceptance Criteria

The project is complete only when:

- React frontend starts successfully.
- Flask backend starts successfully.
- Development proxy works.
- The UI follows `design.md`.
- English and Khmer work.
- Language preference persists.
- File selection works.
- Additional file selection appends files.
- File reordering works.
- Keyboard ordering is supported.
- File removal works.
- Merge order is preserved.
- Output filename is safe.
- PDFs merge successfully.
- Download works.
- Errors display correctly.
- Mobile and desktop layouts work.
- Accessibility requirements are implemented.
- No browser console errors remain.
- Frontend tests pass.
- Backend tests pass.
- Production build succeeds.
- Uploaded files are not permanently stored.
- README setup instructions work.

---

## 26. Execution Workflow

Follow this process:

1. Inspect the existing repository.
2. Read all of `design.md`.
3. Read `AGENTS.md` if it exists.
4. Produce a concise implementation plan.
5. Create or refactor the project structure.
6. Implement backend services.
7. Implement API routes.
8. Implement React components.
9. Implement CSS design system.
10. Implement English and Khmer translations.
11. Connect frontend to backend.
12. Add accessibility behaviour.
13. Add security controls.
14. Write frontend tests.
15. Write backend tests.
16. Run all tests.
17. Run the frontend production build.
18. Start the application.
19. Perform a browser smoke test.
20. Fix all errors.
21. Review against `design.md`.
22. Update documentation.
23. Provide a completion report.

Do not stop after scaffolding.

Do not leave core features as TODO items.

---

## 27. Final Completion Report

When finished, report:

- Files created
- Files modified
- Architecture decisions
- UX/UI implementation summary
- Accessibility improvements
- Security controls
- Frontend test results
- Backend test results
- Production build result
- Known limitations
- Exact development command
- Exact production command
