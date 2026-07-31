import type { Translate } from "../i18n";

interface OutputSettingsProps {
  value: string;
  disabled: boolean;
  adjusted: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
  t: Translate;
  extension?: ".pdf";
  label?: string;
  helper?: string;
}

export function OutputSettings({
  value,
  disabled,
  adjusted,
  onChange,
  onBlur,
  t,
  extension = ".pdf",
  label = t("outputLabel"),
  helper = t("outputHelper"),
}: OutputSettingsProps) {
  const stem = value.toLowerCase().endsWith(extension) ? value.slice(0, -4) : value;
  return (
    <div className="output-settings">
      <label htmlFor="output-filename">{label}</label>
      <div className="filename-control">
        <input
          id="output-filename"
          type="text"
          value={stem}
          maxLength={116}
          disabled={disabled}
          onChange={(event) => onChange(`${event.currentTarget.value}${extension}`)}
          onBlur={onBlur}
          aria-describedby="filename-helper"
        />
        <span className="filename-extension" aria-hidden="true">{extension}</span>
      </div>
      <p id="filename-helper" className="field-helper">
        {adjusted ? t("filenameAdjusted") : <span className="visually-hidden">{helper}</span>}
      </p>
    </div>
  );
}
