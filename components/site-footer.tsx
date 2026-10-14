import Link from "next/link";
import { LEGAL } from "@/lib/legal";

const year = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="mt-auto w-full shrink-0 border-t border-border">
      <div className="px-14 pt-5 pb-20 text-center">
        <nav
          aria-label="Liens légaux"
          className="flex flex-col items-center gap-2 text-[13px]"
        >
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            <Link
              href="/cgu"
              className="text-ink/80 underline-offset-2 transition-colors hover:text-accent hover:underline"
            >
              Conditions d&apos;utilisation
            </Link>
            <Link
              href="/cgv"
              className="text-ink/80 underline-offset-2 transition-colors hover:text-accent hover:underline"
            >
              Conditions de vente
            </Link>
          </div>
          <a
            href={`mailto:${LEGAL.contactEmail}`}
            className="text-ink/80 underline-offset-2 transition-colors hover:text-accent hover:underline"
          >
            {LEGAL.contactEmail}
          </a>
        </nav>
        <p className="mt-3 text-[12px] leading-snug text-muted">
          © {year} {LEGAL.company}
          <span aria-hidden className="mx-1.5 text-border">
            ·
          </span>
          {LEGAL.brand}
        </p>
      </div>
    </footer>
  );
}
