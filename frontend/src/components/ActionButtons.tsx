import type { Translate } from "../i18n";

interface ActionButtonsProps {
  mergeDisabled: boolean;
  resetDisabled: boolean;
  showAddAnother: boolean;
  onMerge: () => void;
  onReset: () => void;
  t: Translate;
}

export function ActionButtons({
  mergeDisabled,
  resetDisabled,
  showAddAnother,
  onMerge,
  onReset,
  t,
}: ActionButtonsProps) {
  return (
    <div className="action-area">
      {showAddAnother && <p className="action-helper">{t("addAnother")}</p>}
      <div className="action-buttons">
        <button type="button" className="button button-ghost" disabled={resetDisabled} onClick={onReset}>
          {t("reset")}
        </button>
        <button type="button" className="button button-primary" disabled={mergeDisabled} onClick={onMerge}>
          <svg className="merge-button-icon" aria-hidden="true" viewBox="0 0 18 22">
            <path d="m4 8 5-5 5 5M9 3v12m-5 0 5 5 5-5" />
          </svg>
          {t("merge")}
        </button>
      </div>
    </div>
  );
}
