"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  IconDashboard,
  IconProfile,
  IconRecommendations,
  IconSubscriptions,
} from "@/components/icons";

export function MobileNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const items = [
    {
      href: "/dashboard",
      label: t("dashboard"),
      match: "/dashboard",
      icon: IconDashboard,
    },
    {
      href: "/subscriptions",
      label: t("subscriptions"),
      match: "/subscriptions",
      icon: IconSubscriptions,
    },
    {
      href: "/recommendations",
      label: t("recommendations"),
      match: "/recommendations",
      icon: IconRecommendations,
    },
    {
      href: "/profile",
      label: t("profile"),
      match: "/profile",
      icon: IconProfile,
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="flex">
        {items.map((item) => {
          const active = pathname.startsWith(item.match);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-1 px-1 py-2.5 text-center text-[10px] font-medium ${
                  active ? "text-accent" : "text-muted"
                }`}
              >
                <Icon size={16} />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
