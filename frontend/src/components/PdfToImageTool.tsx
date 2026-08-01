import { useCallback, useState } from "react";
import type { Translate } from "../i18n";
import { usePdfToImage } from "../hooks/usePdfToImage";
import type { ImageOutputFormat } from "../types/pdf";
import { DEFAULT_IMAGE_FILENAME, normaliseImageFilename } from "../utils/filename";
import { ErrorAlert } from "./ErrorAlert";
import { ImageFormatSettings } from "./ImageFormatSettings";
import { ImageResult } from "./ImageResult";
import { OutputSettings } from "./OutputSettings";
import { ProcessingStatus } from "./ProcessingStatus";
import { SplitSelectedFile } from "./SplitSelectedFile";
import { UploadDropzone } from "./UploadDropzone";

export function PdfToImageTool({ t }: { t: Translate }) {
  const { selectedFile, status, result, error, selectFiles, convert, resetConversion } =
    usePdfToImage();
  const [format, setFormat] = useState<ImageOutputFormat>("png");
  const [outputFilename, setOutputFilename] = useState(DEFAULT_IMAGE_FILENAME);
  const [filenameAdjusted, setFilenameAdjusted] = useState(false);
  const isBusy = status === "converting";
  const editingDisabled = isBusy || status === "completed";
  const canConvert = selectedFile?.status === "valid" && !isBusy && status !== "completed";

  const finishFilename = useCallback(() => {
    const normalised = normaliseImageFilename(outputFilename, format);
    setFilenameAdjusted(normalised !== outputFilename);
    setOutputFilename(normalised);
    return normalised;
  }, [format, outputFilename]);

  const changeFormat = useCallback((nextFormat: ImageOutputFormat) => {
    setFormat(nextFormat);
    setOutputFilename((current) => normaliseImageFilename(current, nextFormat));
    setFilenameAdjusted(false);
  }, []);

  const resetAll = useCallback(
    (confirm = true) => {
      if (confirm && selectedFile && !window.confirm(t("confirmConvertReset"))) return;
      resetConversion();
      setFormat("png");
      setOutputFilename(DEFAULT_IMAGE_FILENAME);
      setFilenameAdjusted(false);
    },
    [resetConversion, selectedFile, t],
  );

  return (
    <section className="tool-card" id="pdf-tools" role="tabpanel" aria-labelledby="convert-tool-tab">
      <UploadDropzone
        disabled={editingDisabled}
        multiple={false}
        title={t("convertDropTitle")}
        activeTitle={t("convertDropActive")}
        secondary={t("convertDropSecondary")}
        selectText={t("convertSelectFile")}
        inputLabel={t("convertUploadLabel")}
        hint={t("convertUploadHint")}
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
            <ImageFormatSettings
              value={format}
              disabled={editingDisabled}
              onChange={changeFormat}
              t={t}
            />
            <OutputSettings
              value={outputFilename}
              disabled={editingDisabled}
              adjusted={filenameAdjusted}
              extension={`.${format}`}
              label={t("convertOutputLabel")}
              helper={t("convertOutputHelper")}
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
                  disabled={!canConvert}
                  onClick={() => void convert(finishFilename(), format)}
                >
                  <svg className="merge-button-icon" aria-hidden="true" viewBox="0 0 18 20">
                    <path d="M3 1h8l4 4v14H3V1Zm8 1v4h3M1 10h16M9 8v4" />
                  </svg>
                  {t("convertButton")}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      <ProcessingStatus status={status} t={t} />
      <ErrorAlert error={error} t={t} />
      {result && <ImageResult result={result} onStartAnother={() => resetAll(false)} t={t} />}
    </section>
  );
}
