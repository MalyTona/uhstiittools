import type { Translate } from "../i18n";
import type { ImageOutputFormat } from "../types/pdf";

interface ImageFormatSettingsProps {
  value: ImageOutputFormat;
  disabled: boolean;
  onChange: (format: ImageOutputFormat) => void;
  t: Translate;
}

export function ImageFormatSettings({ value, disabled, onChange, t }: ImageFormatSettingsProps) {
  return (
    <div className="format-settings">
      <label htmlFor="image-output-format">{t("imageFormatLabel")}</label>
      <select
        id="image-output-format"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.currentTarget.value as ImageOutputFormat)}
      >
        <option value="png">PNG</option>
        <option value="jpg">JPEG</option>
        <option value="webp">WebP</option>
      </select>
      <p className="field-helper">{t("imageFormatHelper")}</p>
    </div>
  );
}
