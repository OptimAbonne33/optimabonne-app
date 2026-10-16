import Link from "next/link";
import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";
import { LEGAL } from "@/lib/legal";

export function LegalShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="border-b border-border bg-surface px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Logo size="sm" href="/login" />
          <div className="flex gap-4 text-[13px]">
            <Link href="/cgu" className="text-muted hover:text-accent">
              CGU
            </Link>
            <Link href="/cgv" className="text-muted hover:text-accent">
              CGV
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-8">
        <h1 className="font-[family-name:var(--font-syne)] text-[28px] font-bold leading-tight">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted">
          En vigueur au {LEGAL.effectiveDate}
        </p>
        <div className="prose-legal mt-8 space-y-6 text-[15px] leading-relaxed text-ink">
          {children}
        </div>
        <aside className="mt-12 rounded-2xl border border-border bg-surface p-5 text-[13px] text-muted">
          <p className="font-semibold text-ink">Mentions légales</p>
          <p className="mt-2">
            {LEGAL.company}, au capital de {LEGAL.capital} € — SIREN{" "}
            {LEGAL.siren} — SIRET {LEGAL.siret}
          </p>
          <p className="mt-1">
            Représentée par {LEGAL.representative}
          </p>
          <p className="mt-1">{LEGAL.address}</p>
          <p className="mt-1">
            <a className="text-accent" href={`tel:${LEGAL.phoneTel}`}>
              {LEGAL.phone}
            </a>
            {" · "}
            <a className="text-accent" href={`mailto:${LEGAL.contactEmail}`}>
              {LEGAL.contactEmail}
            </a>
          </p>
        </aside>
      </main>
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-8">
        <SiteFooter />
      </div>
    </div>
  );
}

export function LegalArticle({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-[family-name:var(--font-syne)] text-lg font-bold">
        {title}
      </h2>
      <div className="mt-2 space-y-3 text-muted [&_strong]:font-semibold [&_strong]:text-ink">
        {children}
      </div>
    </section>
  );
}
