# UHST-IIT PDF Merge Tools — UX/UI and Technical Design

## 1. Document Purpose

This document defines the user experience, visual interface, frontend architecture, backend interaction, accessibility requirements, responsive behaviour, security expectations, and design acceptance criteria for:

**UHST-IIT PDF Merge Tools**

Developed for:

**University of Heng Samrin Thbongkhmum**  
**Institute of Information Technology — IIT**

The application uses:

- React
- TypeScript
- Vite
- Flask
- pypdf

This document is the primary UX/UI source of truth for implementation.

---

## 2. Product Vision

UHST-IIT PDF Merge Tools should provide a simple, private, reliable, and modern way to combine several PDF files into one document.

The experience should feel:

- Modern
- Professional
- Minimal
- Fast
- Trustworthy
- University-focused
- Easy for non-technical users
- Suitable for English and Khmer users

The product should not feel like a commercial PDF website.

Do not include:

- Advertising
- Payment
- Account registration
- Analytics
- Cloud document storage
- Unrelated navigation
- Excessive animation
- Fake university branding

---

## 3. Design Principles

### 3.1 Clear Workflow

The user should understand the complete process immediately:

```text
Select files
    ↓
Arrange order
    ↓
Enter filename
    ↓
Merge
    ↓
Download
```

### 3.2 Privacy by Design

Clearly state:

- Files are processed by the application.
- Files are not permanently stored.
- Files are not sent to third-party services.

### 3.3 Exact Order

The displayed file order is the merge order.

Never reorder files automatically.

### 3.4 Accessible Interaction

Every important function must be accessible by:

- Mouse
- Keyboard
- Touch
- Screen reader where practical

### 3.5 Bilingual by Default

English and Khmer are first-class interface languages.

### 3.6 Progressive Disclosure

Show only information needed for the current step.

Do not display an empty file table before files are selected.

---

## 4. Target Users

### Students

Common tasks:

- Merge assignment cover pages and reports
- Combine scanned documents
- Prepare one LMS submission file
- Combine supporting evidence

### Lecturers

Common tasks:

- Merge lecture notes
- Combine assessment documents
- Prepare teaching materials
- Combine reports and appendices

### Administrative Staff

Common tasks:

- Merge official forms
- Combine reports
- Prepare meeting documents
- Combine scanned administrative records

### Technical Staff

Common tasks:

- Deploy the application
- Configure size limits
- Maintain dependencies
- Review system logs
- Add future tools

---

## 5. Scope

### Version 1

Implement:

- Merge PDF
- English interface
- Khmer interface
- Drag-and-drop upload
- File ordering
- File removal
- Filename entry
- Validation
- Processing state
- Download
- Reset
- Responsive layout
- Accessibility
- Local processing

### Future Tools

Potential future modules:

```text
PDF Tools
├── Merge PDF
├── Split PDF
├── Organise Pages
├── Rotate PDF
├── Extract Pages
├── Images to PDF
├── Add Page Numbers
└── Compress PDF
```

Only Merge PDF is active in version 1.

---

## 6. Application Architecture

```text
Browser
   │
   ▼
React + TypeScript + Vite
   │
   ├── User interface
   ├── File ordering
   ├── Language switching
   ├── Client validation
   ├── Processing states
   └── Download handling
            │
            ▼
       Flask API
            │
   ├── File validation
   ├── Size enforcement
   ├── Encryption detection
   ├── Filename sanitisation
   ├── PDF merging
   └── Temporary cleanup
            │
            ▼
          pypdf
```

The frontend never replaces backend validation.

---

## 7. Recommended Project Structure

```text
uhst-iit-pdf-tools/
│
├── design.md
├── CODEX_PROMPT.md
├── AGENTS.md
├── README.md
│
├── frontend/
│   ├── public/
│   │   └── images/
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── i18n/
│       ├── types/
│       ├── utils/
│       └── styles/
│
└── backend/
    ├── app/
    │   └── services/
    └── tests/
```

---

## 8. Main User Flow

```text
Open application
      ↓
Read short tool explanation
      ↓
Select or drag PDF files
      ↓
Client checks basic file requirements
      ↓
Server checks PDF metadata
      ↓
Display ordered file list
      ↓
Reorder, remove, or add files
      ↓
Enter output filename
      ↓
Click Merge PDFs
      ↓
Upload and process
      ↓
Show success result
      ↓
Download merged PDF
      ↓
Start another merge
```

---

## 9. Page Structure

```text
┌─────────────────────────────────────────────┐
│ Header                                      │
├─────────────────────────────────────────────┤
│ Tool introduction and privacy message       │
├─────────────────────────────────────────────┤
│ Main tool card                              │
│  ├── Upload area                            │
│  ├── Selected files                         │
│  ├── Output settings                        │
│  ├── Actions                                │
│  └── Status / result                        │
├─────────────────────────────────────────────┤
│ Footer                                      │
└─────────────────────────────────────────────┘
```

Recommended page width:

- Maximum page content width: `1120px`
- Main tool card width: `880px`
- Desktop horizontal padding: `32px`
- Tablet horizontal padding: `24px`
- Mobile horizontal padding: `16px`

---

## 10. Header

### Content

Show:

- UHST-IIT PDF Merge Tools
- University of Heng Samrin Thbongkhmum
- Institute of Information Technology
- English/Khmer language switcher

Optional:

- Official UHST logo

Logo path:

```text
frontend/public/images/uhst-logo.png
```

When the logo is absent:

- Do not display a broken image.
- Use a text-based brand.
- Do not invent a logo.

### Desktop Layout

```text
[Logo/Mark] UHST-IIT PDF Merge Tools       [English] [ភាសាខ្មែរ]
            University of Heng Samrin
            Thbongkhmum
            Institute of Information Technology
```

### Mobile Layout

Allow brand and language controls to stack.

Khmer text must wrap correctly.

---

## 11. Tool Introduction

Show:

### English

**Merge PDF Documents**

Combine multiple PDF files into one document. Arrange the files in the exact order you want before merging.

**Privacy:** Your documents are processed securely and are not permanently stored.

### Khmer

**បញ្ចូលឯកសារ PDF**

បញ្ចូលឯកសារ PDF ច្រើនឱ្យក្លាយជាឯកសារតែមួយ។ សូមរៀបចំលំដាប់ឯកសារតាមលំដាប់ដែលអ្នកចង់បាន មុនពេលបញ្ចូល។

**ឯកជនភាព៖** ឯកសាររបស់អ្នកត្រូវបានដំណើរការដោយសុវត្ថិភាព និងមិនត្រូវបានរក្សាទុកជាអចិន្ត្រៃយ៍ទេ។

---

## 12. Main Tool Card

Style:

- White surface
- `16px` border radius
- Subtle border
- Soft shadow
- Desktop padding: `32px`
- Mobile padding: `20px`

Use visual spacing to divide:

1. Upload
2. Selected files
3. Output filename
4. Actions
5. Status/result

Avoid excessive nested cards.

---

## 13. Upload Dropzone

### Default Content

English:

```text
Drag and drop PDF files here

or

Select PDF Files

PDF files only • At least 2 files • Maximum 20 files
```

Khmer:

```text
អូស និងទម្លាក់ឯកសារ PDF នៅទីនេះ

ឬ

ជ្រើសរើសឯកសារ PDF

ទទួលយកតែឯកសារ PDF • យ៉ាងតិច ២ ឯកសារ • អតិបរមា ២០ ឯកសារ
```

### Required States

#### Idle

- Dashed border
- Light neutral or blue-tinted background
- PDF icon
- Clear button

#### Hover

- Stronger border
- Slight background shift

#### Drag Over

- Primary border
- Primary soft background
- Instruction changes to indicate dropping is allowed

#### Invalid

- Error border
- Error icon
- Clear message

#### Disabled

During processing:

- Reduced opacity
- No file selection
- Clear disabled cursor

### Behaviour

Users may:

- Click the dropzone
- Click the Select PDF Files button
- Drag multiple files
- Add more files later

New selections append to the current list.

---

## 14. Selected File List

Hide this section when no files are selected.

### Section Header

Show:

- Selected documents
- File count
- Combined file size
- Instruction to reorder

Example:

```text
Selected documents
3 files • 4.2 MB
Drag to change merge order
```

### File Row

Show:

```text
[Drag] [Order] [PDF icon] [Filename]
                          [Size • Pages]
                                      [Move up] [Move down] [Remove]
```

### Required Metadata

- Order number
- Filename
- File size
- Page count when available
- Validation state

### File States

#### Validating

- Spinner
- “Checking PDF…”

#### Valid

- Normal file row
- Page count visible

#### Invalid

- Error icon
- Error reason
- Excluded from valid file count
- Remove remains available

#### Dragging

- Elevated appearance
- Placeholder remains
- Smooth but minimal movement

### Ordering Rules

The file array is authoritative.

When reordering:

1. Update the array.
2. Update order numbers.
3. Submit the same order.

Do not sort alphabetically.

### Keyboard Ordering

Provide accessible Move Up and Move Down controls.

These may be visually compact but must have accessible labels.

---

## 15. Output Filename

Label:

- English: `Output filename`
- Khmer: `ឈ្មោះឯកសារលទ្ធផល`

Default:

```text
merged-document.pdf
```

Behaviour:

- Append `.pdf` if omitted.
- Remove unsafe path characters.
- Trim whitespace.
- Use a safe fallback if empty.
- Display a small correction message when the client adjusts the name.

Helper text:

English:

```text
The .pdf extension will be added automatically.
```

Khmer:

```text
ប្រព័ន្ធនឹងបន្ថែម .pdf ដោយស្វ័យប្រវត្តិ។
```

---

## 16. Actions

### Primary Button

English:

```text
Merge PDFs
```

Khmer:

```text
បញ្ចូលឯកសារ PDF
```

Enabled only when:

- At least two valid PDFs exist.
- No validation is running.
- No merge is running.

### Secondary Button

English:

```text
Reset
```

Khmer:

```text
កំណត់ឡើងវិញ
```

Reset clears:

- Files
- Result
- Error
- Status
- Filename changes
- Object URLs

Ask for confirmation when files are selected.

### Layout

Desktop:

```text
[Reset] [Merge PDFs]
```

Mobile:

- Full-width buttons
- Primary button visually prominent
- Minimum height about `44px`

---

## 17. Processing State

Statuses:

```text
idle
validating
ready
uploading
merging
completed
error
```

Suggested messages:

### English

```text
Checking PDF files…
Uploading files…
Merging documents…
Preparing your download…
```

### Khmer

```text
កំពុងពិនិត្យឯកសារ PDF…
កំពុងផ្ទុកឯកសារ…
កំពុងបញ្ចូលឯកសារ…
កំពុងរៀបចំឯកសារសម្រាប់ទាញយក…
```

During processing:

- Disable upload
- Disable reorder
- Disable remove
- Disable filename editing
- Disable duplicate submission
- Show an indeterminate progress bar

Do not show a fake percentage.

---

## 18. Success Result

Show:

- Success icon
- Success heading
- File count
- Total pages
- Output filename
- Download button
- Start Another Merge button

Example:

```text
Merge completed successfully

3 PDF files were combined into 18 pages.

Output: meeting-report.pdf

[Download Merged PDF] [Start Another Merge]
```

Khmer:

```text
បញ្ចូលឯកសារបានជោគជ័យ

ឯកសារ PDF ចំនួន ៣ ត្រូវបានបញ្ចូលជាឯកសារមួយ ដែលមាន ១៨ ទំព័រ។

ឯកសារលទ្ធផល៖ meeting-report.pdf

[ទាញយកឯកសារ PDF] [ចាប់ផ្តើមម្តងទៀត]
```

After success, move focus to the success heading or download button.

---

## 19. Error Design

### Error Rules

Errors should:

- Explain the problem
- Explain how to fix it
- Avoid technical jargon
- Be located near the relevant control
- Also appear in an accessible live region

### Error Codes

```text
NO_FILES
TOO_FEW_FILES
TOO_MANY_FILES
INVALID_EXTENSION
EMPTY_FILE
FILE_TOO_LARGE
TOTAL_SIZE_TOO_LARGE
INVALID_PDF
CORRUPTED_PDF
ENCRYPTED_PDF
UNSAFE_FILENAME
MERGE_FAILED
NETWORK_ERROR
SERVER_ERROR
```

### Example Messages

#### Too Few Files

English:

```text
Please select at least two valid PDF files.
```

Khmer:

```text
សូមជ្រើសរើសឯកសារ PDF ត្រឹមត្រូវយ៉ាងតិច ២ ឯកសារ។
```

#### Invalid Type

English:

```text
“document.docx” is not a PDF file.
```

Khmer:

```text
“document.docx” មិនមែនជាឯកសារ PDF ទេ។
```

#### Encrypted PDF

English:

```text
“confidential.pdf” is password-protected. Password-protected PDFs are not supported in this version.
```

Khmer:

```text
“confidential.pdf” ត្រូវបានការពារដោយពាក្យសម្ងាត់។ កំណែនេះមិនទាន់គាំទ្រឯកសារ PDF ដែលមានពាក្យសម្ងាត់ទេ។
```

#### File Too Large

English:

```text
“scan.pdf” exceeds the 50 MB file limit.
```

Khmer:

```text
“scan.pdf” មានទំហំលើសកំណត់ 50 MB។
```

#### Merge Failure

English:

```text
The PDF files could not be merged. Please check the files and try again.
```

Khmer:

```text
មិនអាចបញ្ចូលឯកសារ PDF បានទេ។ សូមពិនិត្យឯកសារ ហើយព្យាយាមម្តងទៀត។
```

Do not use browser `alert()` for normal errors.

---

## 20. Footer

Display:

```text
Developed for the Institute of Information Technology
University of Heng Samrin Thbongkhmum
```

Khmer:

```text
បង្កើតឡើងសម្រាប់វិទ្យាស្ថានបច្ចេកវិទ្យាព័ត៌មាន
សាកលវិទ្យាល័យ ហេង សំរិន ត្បូងឃ្មុំ
```

Do not add fake copyright registration, advertisements, or external links unless officially approved.

---

## 21. Visual Design System

### Colour Tokens

```css
:root {
  --colour-primary: #25457f;
  --colour-primary-hover: #1e3969;
  --colour-primary-soft: #eef3fb;

  --colour-accent: #f78a00;
  --colour-accent-hover: #d97600;
  --colour-accent-soft: #fff4e6;

  --colour-background: #f5f7fa;
  --colour-surface: #ffffff;
  --colour-surface-muted: #f8fafc;

  --colour-text: #1f2937;
  --colour-text-muted: #667085;
  --colour-border: #dfe3e8;

  --colour-success: #157347;
  --colour-success-soft: #eaf7ef;

  --colour-warning: #9a6700;
  --colour-warning-soft: #fff7d6;

  --colour-error: #b42318;
  --colour-error-soft: #fff0ee;

  --colour-focus: #f78a00;
}
```

### Colour Rules

- Primary blue is used for main actions and active controls.
- Orange is an accent and focus colour.
- Do not overuse orange.
- Status colours require icons and text.

### Typography

Recommended size scale:

```css
--font-size-xs: 0.75rem;
--font-size-sm: 0.875rem;
--font-size-base: 1rem;
--font-size-lg: 1.125rem;
--font-size-xl: 1.375rem;
--font-size-2xl: 1.75rem;
--font-size-3xl: 2.25rem;
```

Recommended font stack:

```css
font-family:
  "Noto Sans Khmer",
  "Khmer OS System",
  "Segoe UI",
  Arial,
  sans-serif;
```

Khmer text should use a generous line height.

### Spacing

```css
--space-1: 0.25rem;
--space-2: 0.5rem;
--space-3: 0.75rem;
--space-4: 1rem;
--space-5: 1.25rem;
--space-6: 1.5rem;
--space-8: 2rem;
--space-10: 2.5rem;
--space-12: 3rem;
```

### Radius

```css
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 16px;
--radius-pill: 999px;
```

### Shadow

```css
--shadow-card: 0 8px 24px rgba(31, 41, 55, 0.08);
--shadow-drag: 0 12px 30px rgba(31, 41, 55, 0.16);
```

---

## 22. Components

Recommended component tree:

```text
App
├── AppHeader
│   └── LanguageSwitcher
├── ToolIntroduction
├── UploadDropzone
├── SelectedFiles
│   └── PdfFileItem
├── OutputSettings
├── ActionButtons
├── ProcessingStatus
├── MergeResult
├── ErrorAlert
└── AppFooter
```

### Component Rules

- Presentation components should not contain backend logic.
- API requests belong in services or hooks.
- File state belongs in a reusable hook.
- Translation strings must not be duplicated.
- Components should have typed props.

---

## 23. Frontend State

Recommended state:

```typescript
interface AppState {
  language: "en" | "km";
  files: SelectedPdfFile[];
  outputFilename: string;
  status: MergeStatus;
  error: ApiError | null;
  result: MergeResult | null;
}
```

Selected file:

```typescript
interface SelectedPdfFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount?: number;
  status: "validating" | "valid" | "invalid";
  errorCode?: string;
}
```

The ordered `files` array is the source of truth.

---

## 24. Frontend Data Flow

```text
Select files
    ↓
Basic client validation
    ↓
Append to ordered state
    ↓
Optional server metadata validation
    ↓
Display metadata
    ↓
Reorder or remove
    ↓
Build FormData in displayed order
    ↓
POST /api/merge
    ↓
Receive PDF Blob
    ↓
Create object URL
    ↓
Show result
    ↓
Download
    ↓
Revoke object URL after reset or replacement
```

---

## 25. API Design

### `GET /health`

```json
{
  "status": "ok",
  "application": "UHST-IIT PDF Merge Tools"
}
```

### `POST /api/pdf-info`

Request:

```text
multipart/form-data
file=<pdf>
```

Success:

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

Error:

```json
{
  "ok": false,
  "error": {
    "code": "INVALID_PDF",
    "message": "The selected file is not a valid PDF."
  }
}
```

### `POST /api/merge`

Request order:

```text
files=<first.pdf>
files=<second.pdf>
files=<third.pdf>
output_filename=merged-document.pdf
```

Success:

- `application/pdf`
- Safe `Content-Disposition`
- Optional metadata headers

Error:

```json
{
  "ok": false,
  "error": {
    "code": "MERGE_FAILED",
    "message": "The PDF files could not be merged."
  }
}
```

---

## 26. Development and Production

### Development

- Vite serves React.
- Flask serves API.
- Vite proxies `/api` and `/health`.
- Avoid hard-coded backend URLs.

### Production

- Build React into `frontend/dist`.
- Serve static build through Flask or a reverse proxy.
- Keep API and frontend on the same origin where practical.
- Do not require Vite in production.

---

## 27. Responsive Design

Suggested breakpoints:

```css
--breakpoint-mobile: 480px;
--breakpoint-tablet: 768px;
--breakpoint-desktop: 1024px;
```

### Desktop

- Header in one row
- Centred card
- Horizontal actions
- Full file metadata

### Tablet

- Reduced padding
- Header may wrap
- File rows remain horizontal when possible

### Mobile

- Full-width card
- Stacked buttons
- Compact metadata
- Visible remove action
- Accessible reorder controls
- No horizontal scrolling
- Long filenames truncated

### Very Small Screens

Below `360px`:

- Stack metadata under filenames
- Keep buttons readable
- Allow Khmer text to wrap
- Do not hide errors

---

## 28. Accessibility

Target WCAG 2.1 AA principles.

### Keyboard

All controls must be reachable using Tab.

### Focus

Visible focus required for:

- Language switcher
- File picker
- Remove
- Move up
- Move down
- Filename input
- Reset
- Merge
- Download

### Screen Readers

Use:

- Semantic headings
- Proper labels
- Accessible button names
- `aria-live="polite"` for routine status
- `aria-live="assertive"` only for urgent errors
- Order descriptions for file rows

### Focus Management

After error:

- Focus relevant error summary or control.

After success:

- Focus success heading or Download button.

### Motion

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

---

## 29. Privacy and Security Design

### File Handling

- No permanent uploads
- Secure temporary storage
- Random temporary names
- Automatic cleanup
- No document history
- No third-party document upload

### Validation

Validate:

- File count
- File size
- Total size
- Extension
- PDF readability
- Corruption
- Encryption
- Filename safety

### Logging

Do not log:

- PDF content
- Extracted text
- Raw binary
- Passwords
- Detailed confidential filenames without need

### Headers

Recommended:

```text
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: no-referrer
Cache-Control: no-store
```

Add an appropriate Content Security Policy.

---

## 30. Performance

Default limits:

```text
Minimum files: 2
Maximum files: 20
Maximum file size: 50 MB
Maximum combined size: 200 MB
```

For larger files:

- Prefer secure temporary files over excessive memory use.

Duplicate files are allowed.

---

## 31. Edge Cases

### One File

Show:

```text
Add at least one more PDF to enable merging.
```

### Too Many Files

Reject extra files with a clear message.

### Duplicate Filenames

Use unique client IDs.

### Long Filenames

Truncate visually and preserve full accessible text.

### Network Failure

Keep the selected list for retry when possible.

### Download Failure

Keep the result state and allow the user to try again.

---

## 32. Testing Design

### Frontend

Test:

- Empty state
- Multiple selection
- Add more files
- Invalid type
- Remove
- Reorder
- Keyboard reorder
- Disabled merge state
- Exact submission order
- Processing state
- Success Blob handling
- Error handling
- English/Khmer switching
- Language persistence
- Reset
- Object URL cleanup

### Backend

Test:

- Correct merge
- Correct order
- Page count
- Limits
- Empty PDF
- Corrupted PDF
- Encrypted PDF
- Filename safety
- Correct MIME type
- Health route
- Security headers
- Cleanup
- No traceback exposure

---

## 33. Wireframe

```text
┌──────────────────────────────────────────────────────────────┐
│ [UHST] UHST-IIT PDF Merge Tools          English | ភាសាខ្មែរ │
│        University of Heng Samrin Thbongkhmum                 │
│        Institute of Information Technology                   │
└──────────────────────────────────────────────────────────────┘

                    Merge PDF Documents
       Combine multiple PDF files into one document.
 Files are processed securely and are not permanently stored.

┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                         [PDF]                                │
│                                                              │
│              Drag and drop PDF files here                    │
│                            or                                │
│                  [ Select PDF Files ]                        │
│                                                              │
│          PDF only • At least 2 files • Max 20 files          │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Selected documents                          3 files • 4.2 MB

┌──────────────────────────────────────────────────────────────┐
│ ≡  1  [PDF] cover.pdf           120 KB • 1 page  [↑][↓][×] │
├──────────────────────────────────────────────────────────────┤
│ ≡  2  [PDF] report.pdf          2.4 MB • 14 pages [↑][↓][×]│
├──────────────────────────────────────────────────────────────┤
│ ≡  3  [PDF] appendix.pdf        800 KB • 5 pages [↑][↓][×] │
└──────────────────────────────────────────────────────────────┘

Output filename
┌──────────────────────────────────────────────────────────────┐
│ meeting-report.pdf                                           │
└──────────────────────────────────────────────────────────────┘

                                      [ Reset ] [ Merge PDFs ]

┌──────────────────────────────────────────────────────────────┐
│ ✓ Merge completed successfully                              │
│                                                              │
│ 3 PDF files were combined into 20 pages.                    │
│ Output: meeting-report.pdf                                  │
│                                                              │
│ [ Download Merged PDF ] [ Start Another Merge ]             │
└──────────────────────────────────────────────────────────────┘

Developed for the Institute of Information Technology
University of Heng Samrin Thbongkhmum
```

---

## 34. Design Acceptance Criteria

The design is accepted when:

### Branding

- Correct product and institution names
- Correct colour system
- No fake logo
- Professional university appearance

### Workflow

- Workflow is understandable immediately
- File order is visible
- File order is controllable
- Merge order is exact
- File removal works
- Output filename is clear
- Download is prominent

### Bilingual Interface

- English and Khmer work
- Translation keys stay synchronised
- Khmer text does not overflow
- Language preference persists

### Accessibility

- Keyboard navigation works
- Keyboard reorder is available
- Focus indicators are visible
- Status changes are announced
- Contrast is sufficient
- Touch targets are large enough

### Responsive

- Mobile works without horizontal scrolling
- Buttons remain usable
- Long filenames do not break layout
- Header wraps correctly

### Security and Privacy

- Files are not permanently stored
- Unsafe filenames are sanitised
- Encrypted PDFs are rejected
- Technical errors are hidden
- No external processing service is used

### Quality

- No browser console errors
- Frontend tests pass
- Backend tests pass
- Production build succeeds
- README setup instructions work

---

## 35. Non-Goals

Do not implement in version 1:

- User accounts
- Cloud storage
- OCR
- PDF editing
- Password removal
- Encryption
- Digital signatures
- Watermarks
- Compression
- Page thumbnails
- Email delivery
- Analytics
- Advertising
- AI document analysis

---

## 36. Implementation Priorities

When requirements conflict, prioritise:

1. Security and privacy
2. Correct PDF output
3. Exact file order
4. Accessibility
5. Clear user experience
6. Responsive design
7. Visual polish
8. Future extensibility

---

## 37. Version History

### Version 2.0

Updated design for:

- React
- TypeScript
- Vite
- Flask API
- pypdf
- Modern component architecture
- English and Khmer localisation
- Accessible file ordering
- Responsive UX/UI
