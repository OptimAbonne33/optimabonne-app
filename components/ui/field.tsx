"use client";

type Props = {
  label: string;
  name?: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  autoComplete?: string;
  hint?: string;
  error?: string | null;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  step?: string;
  min?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
};

export function Field({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
  value,
  autoComplete,
  hint,
  error,
  onChange,
  onBlur,
  step,
  min,
  inputMode,
}: Props) {
  const hasError = Boolean(error);

  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-[12px] font-semibold tracking-[0.3px] text-muted">
        {label}
      </label>
      <input
        className={`field-input ${hasError ? "field-input--error" : ""}`}
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value}
        autoComplete={autoComplete}
        onChange={onChange}
        onBlur={onBlur}
        step={step}
        min={min}
        inputMode={inputMode}
        aria-invalid={hasError}
      />
      {hasError ? (
        <p className="mt-1.5 text-[12px] leading-snug text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[11px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
