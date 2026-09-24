"use client";

import { useFormStatus } from "react-dom";

type Props = {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "ghost" | "danger" | "outline";
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
};

export function Button({
  children,
  className = "",
  variant = "primary",
  type = "button",
  onClick,
  disabled,
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 font-bold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

  const variants = {
    primary:
      "w-full rounded-[12px] bg-accent text-[#0a0f1e] px-5 py-[14px] text-sm hover:bg-[#00ffb3] hover:-translate-y-px",
    ghost:
      "rounded-xl border border-border bg-surface2 px-4 py-3 text-[13px] text-ink hover:border-muted",
    danger:
      "w-full rounded-xl border border-danger/40 bg-danger/10 px-4 py-[13px] text-sm text-danger hover:bg-danger/20",
    outline:
      "w-full rounded-[12px] border border-border bg-transparent px-5 py-[14px] text-sm text-ink hover:border-muted",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function SubmitButton({
  children,
  className,
  variant = "primary",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: Props["variant"];
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} disabled={pending} className={className}>
      {pending ? "…" : children}
    </Button>
  );
}
