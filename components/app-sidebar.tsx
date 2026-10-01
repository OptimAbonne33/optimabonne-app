"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/logo";
import { signOutAction } from "@/app/actions";
import {
  IconDashboard,
  IconProfile,
  IconRecommendations,
  IconSpark,
  IconSubscriptions,
} from "@/components/icons";

export function AppSidebar({ userName }: { userName: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const menuItems = [
    {
      href: "/dashboard",
      icon: IconDashboard,
      label: t("dashboard"),
      match: "/dashboard",
    },
    {
      href: "/subscriptions",
      icon: IconSubscriptions,
      label: t("subscriptions"),
      match: "/subscriptions",
    },
    {
      href: "/recommendations",
      icon: IconRecommendations,
      label: t("recommendations"),
      match: "/recommendations",
    },
  ];

  const accountItems = [
    {
      href: "/profile",
      icon: IconProfile,
      label: t("profile"),
      match: "/profile",
    },
  ];

  function NavLink({
    href,
    icon: Icon,
    label,
    match,
  }: {
    href: string;
    icon: typeof IconDashboard;
    label: string;
    match: string;
  }) {
    const active = pathname.startsWith(match);
    return (
      <Link
        href={href}
        className={`mb-px flex items-center gap-2.5 rounded-[9px] px-2.5 py-[9px] text-[13px] transition-colors ${
          active
            ? "bg-accent/10 text-accent"
            : "text-muted hover:bg-surface2 hover:text-ink"
        }`}
      >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
            active ? "bg-accent/15 text-accent" : "bg-surface2 text-muted"
          }`}
        >
          <Icon size={14} />
        </span>
        {label}
      </Link>
    );
  }

  return (
    <aside className="sticky top-0 hidden min-h-screen w-[220px] shrink-0 flex-col border-r border-border bg-surface py-6 md:flex">
      <div className="overflow-hidden border-b border-border px-5 pb-6">
        <Logo size="sm" />
      </div>

      <nav className="flex-1 px-3 py-4">
        <p className="mb-1.5 mt-1 px-2 text-[10px] uppercase tracking-[1.5px] text-muted">
          {t("menu")}
        </p>
        {menuItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}

        <p className="mb-1.5 mt-4 px-2 text-[10px] uppercase tracking-[1.5px] text-muted">
          {t("account")}
        </p>
        {accountItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>

      <div className="border-t border-border px-3 pt-4">
        <div className="mb-3 flex items-center gap-2.5 rounded-[10px] bg-surface2 p-2.5">
          <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue to-accent font-[family-name:var(--font-syne)] text-[11px] font-bold text-white">
            {initials || "U"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">{userName}</p>
            <p className="flex items-center gap-1 text-[10px] text-accent">
              <IconSpark size={10} />
              Essai
            </p>
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
