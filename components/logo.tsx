import Link from "next/link";

export function Logo({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const cls =
    size === "lg"
      ? "text-[22px]"
      : size === "sm"
        ? "text-[15px]"
        : "text-xl";

  return (
    <Link
      href="/dashboard"
      className={`inline-block max-w-full truncate font-[family-name:var(--font-syne)] font-extrabold tracking-[-0.5px] ${cls} ${className}`}
    >
      Optim<span className="text-accent">Abonne</span>
    </Link>
  );
}
