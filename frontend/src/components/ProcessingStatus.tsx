import type { Translate } from "../i18n";
import type { ConvertStatus, MergeStatus, SplitStatus } from "../types/pdf";

export function ProcessingStatus({ status, t }: { status: MergeStatus | SplitStatus | ConvertStatus; t: Translate }) {
  if (!(["validating", "uploading", "merging", "splitting", "converting"] as Array<MergeStatus | SplitStatus | ConvertStatus>).includes(status)) return null;
  const message =
    status === "validating"
      ? t("processingChecking")
      : status === "uploading"
        ? t("processingUploading")
        : status === "splitting"
          ? t("processingSplitting")
          : status === "converting"
            ? t("processingConverting")
            : t("processingMerging");
  return (
    <div className="processing-status" role="status" aria-live="polite">
      <div className="indeterminate-progress" aria-hidden="true"><span /></div>
      <p>{message}</p>
    </div>
  );
}
