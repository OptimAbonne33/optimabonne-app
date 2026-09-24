"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/logo";
import { signOutAction } from "@/app/actions";

export function AppSidebar({ userName }: { userName: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const items = [
    { href: "/dashboard", icon: "⊞", label: t("dashboard"), match: "/dashboard" },
    {
      href: "/subscriptions",
      icon: "◈",
      label: t("subscriptions"),
      match: "/subscriptions",
    },
    { href: "/profile", icon: "👤", label: t("profile"), match: "/profile" },
  ];

  return (
    <aside className="sticky top-0 hidden min-h-screen w-[220px] shrink-0 flex-col border-r border-border bg-surface py-6 md:flex">
      <div className="overflow-hidden border-b border-border px-5 pb-6">
        <Logo size="sm" />
      </div>

      <nav className="flex-1 px-3 py-4">
        <p className="mb-1.5 mt-1 px-2 text-[10px] uppercase tracking-[1.5px] text-muted">
          {t("menu")}
        </p>
        {items.slice(0, 2).map((item) => {
          const active = pathname.startsWith(item.match);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-px flex items-center gap-2.5 rounded-[9px] px-2.5 py-[9px] text-[13px] transition-colors ${
                active
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:bg-surface2 hover:text-ink"
              }`}
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-surface2 text-[9px]">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}

        <p className="mb-1.5 mt-4 px-2 text-[10px] uppercase tracking-[1.5px] text-muted">
          {t("account")}
        </p>
        {items.slice(2).map((item) => {
          const active = pathname.startsWith(item.match);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-px flex items-center gap-2.5 rounded-[9px] px-2.5 py-[9px] text-[13px] transition-colors ${
                active
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:bg-surface2 hover:text-ink"
              }`}
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-surface2 text-[9px]">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-3 pt-4">
        <div className="mb-3 flex items-center gap-2.5 rounded-[10px] bg-surface2 p-2.5">
          <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue to-accent font-[family-name:var(--font-syne)] text-[11px] font-bold text-white">
            {initials || "U"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">{userName}</p>
            <p className="text-[10px] text-accent">✦ Essai</p>
          </div>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full rounded-lg px-2 py-2 text-left text-[12px] text-muted hover:text-ink"
          >
            {t("logout")}
          </button>
        </form>
      </div>
    </aside>
  );
}
