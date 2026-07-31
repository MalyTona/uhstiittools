import type { Translate } from "../i18n";
import type { MergeStatus, SplitStatus } from "../types/pdf";

export function ProcessingStatus({ status, t }: { status: MergeStatus | SplitStatus; t: Translate }) {
  if (!(["validating", "uploading", "merging", "splitting"] as Array<MergeStatus | SplitStatus>).includes(status)) return null;
  const message =
    status === "validating"
      ? t("processingChecking")
      : status === "uploading"
        ? t("processingUploading")
        : status === "splitting"
          ? t("processingSplitting")
          : t("processingMerging");
  return (
    <div className="processing-status" role="status" aria-live="polite">
      <div className="indeterminate-progress" aria-hidden="true"><span /></div>
      <p>{message}</p>
    </div>
  );
}
