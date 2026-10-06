import Link from "next/link";

export function Logo({
  size = "md",
  className = "",
  href = "/dashboard",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
}) {
  const height = size === "lg" ? 32 : size === "sm" ? 22 : 26;
  const maxWidth = size === "lg" ? 220 : 160;

  return (
    <Link
      href={href}
      className={`inline-flex max-w-full items-center ${className}`}
      aria-label="OptimAbonne"
    >
      <img
        src="/optimabonne-logo.svg"
        alt="OptimAbonne"
        height={height}
        className="block h-auto w-auto max-w-full"
        style={{ height, maxWidth }}
      />
    </Link>
  );
}
