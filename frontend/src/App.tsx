import { useCallback, useMemo, useState } from "react";
import { ActionButtons } from "./components/ActionButtons";
import { AppFooter } from "./components/AppFooter";
import { AppHeader } from "./components/AppHeader";
import { ErrorAlert } from "./components/ErrorAlert";
import { MergeResult } from "./components/MergeResult";
import { OutputSettings } from "./components/OutputSettings";
import { PdfToImageTool } from "./components/PdfToImageTool";
import { ProcessingStatus } from "./components/ProcessingStatus";
import { SelectedFiles } from "./components/SelectedFiles";
import { SplitPdfTool } from "./components/SplitPdfTool";
import { ToolIntroduction } from "./components/ToolIntroduction";
import { ToolSwitcher } from "./components/ToolSwitcher";
import { UploadDropzone } from "./components/UploadDropzone";
import { useLanguage } from "./hooks/useLanguage";
import { usePdfFiles } from "./hooks/usePdfFiles";
import { usePdfMerge } from "./hooks/usePdfMerge";
import type { MergeStatus, PdfTool } from "./types/pdf";
import { DEFAULT_OUTPUT_FILENAME, normalisePdfFilename } from "./utils/filename";

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const { status: mergeStatus, result, error, setError, merge, resetMerge } = usePdfMerge();
  const { files, addFiles, removeFile, moveFile, reorderFile, clearFiles } = usePdfFiles(setError);
  const [outputFilename, setOutputFilename] = useState(DEFAULT_OUTPUT_FILENAME);
  const [filenameAdjusted, setFilenameAdjusted] = useState(false);
  const [activeTool, setActiveTool] = useState<PdfTool>("merge");

  const hasValidating = files.some((item) => item.status === "validating");
  const validFiles = useMemo(() => files.filter((item) => item.status === "valid"), [files]);
  const isBusy = mergeStatus === "uploading" || mergeStatus === "merging";
  const editingDisabled = isBusy || mergeStatus === "completed";
  const displayStatus: MergeStatus = hasValidating ? "validating" : mergeStatus;
  const canMerge = validFiles.length >= 2 && !hasValidating && !isBusy && mergeStatus !== "completed";

  const finishFilename = useCallback(() => {
    const normalised = normalisePdfFilename(outputFilename);
    setFilenameAdjusted(normalised !== outputFilename);
    setOutputFilename(normalised);
    return normalised;
  }, [outputFilename]);

  const resetAll = useCallback(
    (confirm = true) => {
      if (confirm && files.length > 0 && !window.confirm(t("confirmReset"))) return;
      clearFiles();
      resetMerge();
      setOutputFilename(DEFAULT_OUTPUT_FILENAME);
      setFilenameAdjusted(false);
    },
    [clearFiles, files.length, resetMerge, t],
  );

  return (
    <div className="app" data-language={language}>
      <AppHeader language={language} onLanguageChange={setLanguage} t={t} />
      <main className="page-shell main-content">
        <ToolIntroduction t={t} tool={activeTool} />
        <ToolSwitcher activeTool={activeTool} onChange={setActiveTool} t={t} />
        {activeTool === "merge" ? (
        <section
          className="tool-card"
          id="pdf-tools"
          role="tabpanel"
          aria-labelledby="merge-tool-tab"
        >
          <UploadDropzone disabled={editingDisabled} onFiles={(selected) => void addFiles(selected)} t={t} />
          <SelectedFiles
            files={files}
            disabled={editingDisabled}
            onMove={moveFile}
            onRemove={removeFile}
            onReorder={reorderFile}
            t={t}
          />
          {files.length > 0 && (
            <div className="configuration-panel">
              <OutputSettings
                value={outputFilename}
                disabled={editingDisabled}
                adjusted={filenameAdjusted}
                onChange={(value) => {
                  setOutputFilename(value);
                  setFilenameAdjusted(false);
                }}
                onBlur={finishFilename}
                t={t}
              />
              <ActionButtons
                mergeDisabled={!canMerge}
                resetDisabled={isBusy}
                showAddAnother={validFiles.length === 1 && !hasValidating}
                onMerge={() => void merge(validFiles, finishFilename())}
                onReset={() => resetAll(true)}
                t={t}
              />
            </div>
          )}
          <ProcessingStatus status={displayStatus} t={t} />
          <ErrorAlert error={error} t={t} />
          {result && <MergeResult result={result} onStartAnother={() => resetAll(false)} t={t} />}
        </section>
        ) : activeTool === "split" ? (
          <SplitPdfTool t={t} />
        ) : (
          <PdfToImageTool t={t} />
        )}
      </main>
      <AppFooter t={t} />
    </div>
  );
}
