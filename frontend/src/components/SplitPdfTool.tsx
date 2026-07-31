import { useCallback, useState } from "react";
import type { Translate } from "../i18n";
import { usePdfSplit } from "../hooks/usePdfSplit";
import { DEFAULT_SPLIT_FILENAME, normaliseSplitFilename } from "../utils/filename";
import { ErrorAlert } from "./ErrorAlert";
import { OutputSettings } from "./OutputSettings";
import { ProcessingStatus } from "./ProcessingStatus";
import { SplitResult } from "./SplitResult";
import { SplitSelectedFile } from "./SplitSelectedFile";
import { UploadDropzone } from "./UploadDropzone";

export function SplitPdfTool({ t }: { t: Translate }) {
  const { selectedFile, status, result, error, selectFiles, split, resetSplit } = usePdfSplit();
  const [outputFilename, setOutputFilename] = useState(DEFAULT_SPLIT_FILENAME);
  const [filenameAdjusted, setFilenameAdjusted] = useState(false);
  const isBusy = status === "splitting";
  const editingDisabled = isBusy || status === "completed";
  const canSplit = selectedFile?.status === "valid" && !isBusy && status !== "completed";

  const finishFilename = useCallback(() => {
    const normalised = normaliseSplitFilename(outputFilename);
    setFilenameAdjusted(normalised !== outputFilename);
    setOutputFilename(normalised);
    return normalised;
  }, [outputFilename]);

  const resetAll = useCallback(
    (confirm = true) => {
      if (confirm && selectedFile && !window.confirm(t("confirmSplitReset"))) return;
      resetSplit();
      setOutputFilename(DEFAULT_SPLIT_FILENAME);
      setFilenameAdjusted(false);
    },
    [resetSplit, selectedFile, t],
  );

  return (
    <section
      className="tool-card"
      id="pdf-tools"
      role="tabpanel"
      aria-labelledby="split-tool-tab"
    >
      <UploadDropzone
        disabled={editingDisabled}
        multiple={false}
        title={t("splitDropTitle")}
        activeTitle={t("splitDropActive")}
        secondary={t("splitDropSecondary")}
        selectText={t("splitSelectFile")}
        inputLabel={t("splitUploadLabel")}
        hint={t("splitUploadHint")}
        onFiles={(files) => void selectFiles(files)}
        t={t}
      />
      {selectedFile && (
        <>
          <SplitSelectedFile
            item={selectedFile}
            disabled={editingDisabled}
            onRemove={() => resetAll(false)}
            t={t}
          />
          <div className="configuration-panel">
            <OutputSettings
              value={outputFilename}
              disabled={editingDisabled}
              adjusted={filenameAdjusted}
              extension=".pdf"
              label={t("splitOutputLabel")}
              helper={t("splitOutputHelper")}
              onChange={(value) => {
                setOutputFilename(value);
                setFilenameAdjusted(false);
              }}
              onBlur={finishFilename}
              t={t}
            />
            <div className="action-area">
              <div className="action-buttons">
                <button
                  type="button"
                  className="button button-secondary"
                  disabled={isBusy}
                  onClick={() => resetAll(true)}
                >
                  {t("reset")}
                </button>
                <button
                  type="button"
                  className="button button-primary"
                  disabled={!canSplit}
                  onClick={() => void split(finishFilename())}
                >
                  <svg className="merge-button-icon" aria-hidden="true" viewBox="0 0 18 20">
                    <path d="M3 1h8l4 4v14H3V1Zm8 1v4h3M1 10h16M9 8v4" />
                  </svg>
                  {t("splitButton")}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      <ProcessingStatus status={status} t={t} />
      <ErrorAlert error={error} t={t} />
      {result && <SplitResult result={result} onStartAnother={() => resetAll(false)} t={t} />}
    </section>
  );
}
