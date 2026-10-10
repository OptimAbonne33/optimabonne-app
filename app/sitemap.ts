import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();

  const paths: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"] }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/login", priority: 0.9, changeFrequency: "monthly" },
    { path: "/signup", priority: 0.9, changeFrequency: "monthly" },
    { path: "/dashboard", priority: 0.7, changeFrequency: "weekly" },
    { path: "/subscriptions", priority: 0.7, changeFrequency: "weekly" },
    { path: "/recommendations", priority: 0.7, changeFrequency: "weekly" },
    { path: "/billing", priority: 0.6, changeFrequency: "monthly" },
    { path: "/profile", priority: 0.4, changeFrequency: "monthly" },
  ];

  return paths.map(({ path, priority, changeFrequency }) => ({
    url: `${base}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
