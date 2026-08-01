# UHST-IIT PDF Merge Tools

A privacy-focused, bilingual web application for merging PDF documents in an exact user-controlled order, splitting a PDF into individual pages, and converting PDF pages to PNG, JPEG, or WebP images. It is developed for the Institute of Information Technology at the University of Heng Samrin Thbongkhmum.

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
- Keep all merge, split, and image-conversion processing in memory or secure temporary streams
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
       ├─ POST /api/pdf-to-image
       └─ GET  /health
              └─ Flask + pypdf
```

The ordered frontend array is the only merge-order source of truth. The merge API receives repeated `files` form fields in that same order. The split API receives one `file`, copies every page into its own PDF, and streams the results as binary multipart data so the browser can expose each page separately. The PDF-to-image API receives one `file`, an `output_format` of `png`, `jpg`, or `webp`, and renders every page at 150 DPI with PDFium before returning ordered binary multipart images. Flask validates every input again before processing it in memory.

## Using the tools

Start the backend and frontend using the commands below, open the Vite URL, and choose **Merge PDF**, **Split PDF**, or **PDF to Image** above the upload panel. Split PDF accepts one source file and displays a separate PDF download for every page. PDF to Image accepts one source file, lets you select PNG, JPEG, or WebP, and displays ordered image downloads such as `converted-page-001.png`.

## Privacy and security

- Documents are sent only to the configured Flask backend host for processing; no external document-processing service receives them.
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

## Public deployment: Render API and Vercel frontend

The repository includes `render.yaml` for the Flask API and `frontend/vercel.json` for the Vite site. Production browser uploads go directly to Render so large PDF bodies do not pass through a Vercel Function or external rewrite.

### 1. Deploy the API on Render

1. In Render, choose **New > Blueprint** and connect this GitHub repository.
2. Select the repository's root `render.yaml` and create the `uhstiit-pdf-api` web service.
3. Wait for the health check to pass, then copy the service URL, such as `https://uhstiit-pdf-api.onrender.com`.
4. Confirm that `<Render URL>/health` returns JSON with `"status": "ok"`.

The blueprint uses the `backend` root directory, installs `backend/requirements.txt`, starts one Gunicorn worker, generates `SECRET_KEY`, and sets production mode. No disk or database is needed.

### 2. Deploy the frontend on Vercel

1. In Vercel, choose **Add New > Project** and import this GitHub repository.
2. Set **Root Directory** to `frontend`. Vercel should detect Vite.
3. Add an environment variable named `VITE_API_BASE_URL` with the Render URL from step 1, without a trailing slash. Apply it to Production and any Preview environments you intend to use.
4. Deploy, then copy the production URL, such as `https://uhstiit-pdf-tools.vercel.app`.

### 3. Allow the Vercel production origin on Render

1. Open the Render web service and add `CORS_ALLOWED_ORIGINS` under **Environment**.
2. Set it to the exact Vercel origin from step 2, with no path or trailing slash, for example `https://uhstiit-pdf-tools.vercel.app`.
3. Save the change and allow Render to redeploy.
4. Open the Vercel site and verify PDF information, merge, split, and image-conversion downloads.

For multiple fixed frontend origins, use a comma-separated list. Avoid `*`: PDF responses expose download metadata and should only be readable by approved sites. Vercel preview URLs change per deployment, so production is the simplest origin to allow; add a specific stable preview alias only when needed.

Render's free web service is suitable for testing but sleeps after inactivity and has limited CPU and memory. The first API request after sleep can take about a minute, and PDFs near the configured 200 MB total limit can exceed a 512 MB instance's practical processing capacity. Use a paid instance or lower the size limits for dependable public use.

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
| `CORS_ALLOWED_ORIGINS` | empty | Comma-separated exact browser origins allowed to read the API |
| `VITE_API_BASE_URL` | empty | Public Flask origin used by production frontend builds; empty keeps same-origin requests |

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
