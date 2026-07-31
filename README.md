# UHST-IIT PDF Merge Tools

A private, bilingual web application for merging PDF documents in an exact user-controlled order and splitting a PDF into individual pages. It is developed for the Institute of Information Technology at the University of Heng Samrin Thbongkhmum.

The interface implements the approved UHST-IIT Figma design while preserving the workflow, accessibility, and security rules in `design.md`. Design tokens and presentation components remain separated from PDF processing and API behavior.

## Features

- Select, drag-and-drop, and append up to 20 PDF files
- Validate PDF structure and display page counts before merging
- Reorder by drag-and-drop or accessible Move Up/Move Down buttons
- Remove individual files without disturbing the remaining order
- Preserve duplicate files and the exact displayed order
- Safely normalize custom output filenames
- Download the merged PDF without quality loss or rasterization
- Split one PDF into ordered, individually downloadable single-page PDFs
- Keep all merge and split processing in memory or secure temporary streams
- English and Khmer interfaces with saved language preference
- Responsive, keyboard-accessible workflow with live status and focus management
- Structured, localized errors for damaged, protected, oversized, and invalid files

## Architecture

```text
Browser
  └─ React + TypeScript + Vite
       ├─ POST /api/pdf-info
       ├─ POST /api/merge
       ├─ POST /api/split
       └─ GET  /health
              └─ Flask + pypdf
```

The ordered frontend array is the only merge-order source of truth. The merge API receives repeated `files` form fields in that same order. The split API receives one `file`, copies every page into its own PDF, and streams the results as binary multipart data so the browser can expose each page separately. Flask validates every input again before `pypdf` processes it in memory.

## Using the tools

Start the backend and frontend using the commands below, open the Vite URL, and choose **Merge PDF** or **Split PDF** above the upload panel. Split PDF accepts one source file and displays a separate download for every page, with ordered names such as `split-page-001.pdf`.

## Privacy and security

- Documents are processed only by this application and are never sent to third parties.
- Uploads use Werkzeug input streams and Python spooled temporary streams. Large streams may roll to the operating system's secure temporary directory and are closed immediately after processing.
- There is no database, upload history, analytics, authentication, or permanent document storage.
- PDF content and raw filenames are not logged. Logs contain only aggregate file and page counts.
- Encrypted/password-protected PDFs are rejected in version 1.
- File counts, individual size, combined size, extension, PDF structure, encryption, and output filenames are validated on the server.
- Responses include CSP, `nosniff`, frame, referrer, and no-store headers.

## Prerequisites

- Python 3.11 or newer
- Node.js 20.19+ or 22.12+ (the repository was verified with Node.js 26)
- npm

No administrator privileges are required.

## Backend installation

From the repository root on Windows PowerShell:

```powershell
python -m venv backend/.venv
backend/.venv/Scripts/python.exe -m pip install -r backend/requirements-dev.txt
backend/.venv/Scripts/python.exe backend/run.py
```

On Linux or macOS:

```bash
python3 -m venv backend/.venv
backend/.venv/bin/python -m pip install -r backend/requirements-dev.txt
backend/.venv/bin/python backend/run.py
```

The API defaults to `http://127.0.0.1:5000`.

## Frontend installation

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Vite prints the frontend URL (normally `http://127.0.0.1:5173`) and proxies `/api` and `/health` to Flask.

## One-command development

Windows:

```powershell
scripts\run-dev.bat
```

Linux or macOS:

```bash
./scripts/run-dev.sh
```

## Testing

Backend:

```powershell
cd backend
.venv/Scripts/python.exe -m pytest
```

Frontend:

```powershell
cd frontend
npm test
```

Tests generate small PDFs programmatically; no private sample documents are included.

## Production build and run

The build scripts install dependencies, run both test suites, and build `frontend/dist`.

Windows:

```powershell
scripts\build-production.bat
$env:FLASK_ENV = "production"
backend/.venv/Scripts/python.exe backend/run.py
```

Linux or macOS:

```bash
./scripts/build-production.sh
FLASK_ENV=production backend/.venv/bin/python backend/run.py
```

Flask then serves the built single-page application and API from the same origin. For a public deployment, place Flask behind a production WSGI server and reverse proxy rather than using its development server.

## Environment variables

Copy `.env.example` values into your deployment environment. The application reads:

| Variable | Default | Purpose |
|---|---:|---|
| `FLASK_ENV` | `development` | Enables Flask development mode only when exactly `development` |
| `SECRET_KEY` | development fallback | Set a random production secret |
| `FLASK_HOST` | `127.0.0.1` | Bind address |
| `FLASK_PORT` | `5000` | API/production port |
| `MAX_FILE_COUNT` | `20` | Maximum PDFs per merge |
| `MAX_FILE_SIZE` | `52428800` | Maximum bytes per PDF |
| `MAX_TOTAL_SIZE` | `209715200` | Maximum combined PDF bytes |
| `VITE_PROXY_TARGET` | `http://127.0.0.1:5000` | Development API proxy target |

Environment values are read by the process; `.env` is documented but not automatically loaded, avoiding an extra runtime dependency.

## Troubleshooting

- **PowerShell blocks `npm.ps1`:** run `npm.cmd` instead of `npm`.
- **Frontend says it cannot reach the server:** start Flask and confirm `http://127.0.0.1:5000/health` returns JSON. Check `VITE_PROXY_TARGET` when using another port.
- **Production root returns `FRONTEND_NOT_BUILT`:** run the production build script or `npm run build` inside `frontend`.
- **A valid-looking PDF is rejected:** encrypted PDFs and structurally damaged PDFs are intentionally rejected. Re-export the source as an unprotected PDF.
- **Upload is rejected before the app responds:** ensure a reverse proxy's request-size limit is at least the configured combined limit plus multipart overhead.

## Future roadmap

- Add approved destinations and content for the footer policy/contact labels
- Optional rotate, page organization, and extraction tools
- Production deployment recipes for common WSGI servers
- End-to-end browser tests in the deployment environment
