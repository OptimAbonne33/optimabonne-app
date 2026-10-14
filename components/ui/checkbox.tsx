"use client";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
  error?: boolean;
  className?: string;
  name?: string;
};

export function Checkbox({
  checked,
  onChange,
  children,
  error = false,
  className = "",
  name,
}: Props) {
  return (
    <label
      className={`group flex cursor-pointer items-start gap-3 text-[12px] leading-relaxed text-muted ${className}`}
    >
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={`mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-[6px] border bg-surface2 text-[#0a0f1e] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-150 peer-checked:border-accent peer-checked:bg-accent peer-checked:shadow-[0_0_0_3px_rgba(0,229,160,0.12)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent/50 peer-checked:[&_svg]:scale-100 peer-checked:[&_svg]:opacity-100 ${
          error
            ? "border-danger/70"
            : "border-border group-hover:border-muted"
        }`}
      >
        <svg
          viewBox="0 0 12 12"
          className="size-3 origin-center scale-75 opacity-0 transition-all duration-150"
          fill="none"
        >
          <path
            d="M2.2 6.2 4.8 8.6 9.8 3.4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="min-w-0 flex-1 pt-px">{children}</span>
    </label>
  );
}
