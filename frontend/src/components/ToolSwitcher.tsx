import type { Translate } from "../i18n";
import type { PdfTool } from "../types/pdf";

interface ToolSwitcherProps {
  activeTool: PdfTool;
  onChange: (tool: PdfTool) => void;
  t: Translate;
}

export function ToolSwitcher({ activeTool, onChange, t }: ToolSwitcherProps) {
  return (
    <div className="tool-switcher" role="tablist" aria-label={t("navTools")}>
      <button
        id="merge-tool-tab"
        type="button"
        role="tab"
        aria-selected={activeTool === "merge"}
        aria-controls="pdf-tools"
        className={activeTool === "merge" ? "is-active" : ""}
        onClick={() => onChange("merge")}
      >
        {t("mergeTool")}
      </button>
      <button
        id="split-tool-tab"
        type="button"
        role="tab"
        aria-selected={activeTool === "split"}
        aria-controls="pdf-tools"
        className={activeTool === "split" ? "is-active" : ""}
        onClick={() => onChange("split")}
      >
        {t("splitTool")}
      </button>
      <button
        id="convert-tool-tab"
        type="button"
        role="tab"
        aria-selected={activeTool === "convert"}
        aria-controls="pdf-tools"
        className={activeTool === "convert" ? "is-active" : ""}
        onClick={() => onChange("convert")}
      >
        {t("convertTool")}
      </button>
    </div>
  );
}
