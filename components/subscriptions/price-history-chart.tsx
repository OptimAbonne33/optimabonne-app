"use client";

import { formatEuro, type PriceHistoryEntry } from "@/lib/optimization";

export function PriceHistoryChart({
  entries,
}: {
  entries: PriceHistoryEntry[];
}) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted">—</p>
    );
  }

  const prices = entries.map((e) => Number(e.price));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = Math.max(max - min, 1);
  const w = 320;
  const h = 120;
  const padX = 8;
  const padY = 16;

  const points = entries.map((e, i) => {
    const x =
      entries.length === 1
        ? w / 2
        : padX + (i / (entries.length - 1)) * (w - padX * 2);
    const y = padY + (1 - (Number(e.price) - min) / span) * (h - padY * 2);
    return { x, y, entry: e };
  });

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const area =
    points.length > 1
      ? `${path} L ${points[points.length - 1].x.toFixed(1)} ${h} L ${points[0].x.toFixed(1)} ${h} Z`
      : "";

  return (
    <div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-[140px] w-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="phFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,229,160,0.28)" />
            <stop offset="100%" stopColor="rgba(0,229,160,0)" />
          </linearGradient>
        </defs>
        {area ? (
          <path d={area} fill="url(#phFill)" />
        ) : null}
        <path
          d={path}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p) => (
          <circle
            key={p.entry.id}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="var(--bg)"
            stroke="var(--accent)"
            strokeWidth="2"
          >
            <title>
              {p.entry.recorded_at}: {formatEuro(Number(p.entry.price))}
              {p.entry.label ? ` — ${p.entry.label}` : ""}
            </title>
          </circle>
        ))}
      </svg>

      <ul className="mt-4 space-y-2">
        {[...entries].reverse().slice(0, 5).map((e) => (
          <li
            key={e.id}
            className="flex items-center justify-between text-[12px]"
          >
            <span className="text-muted">
              {e.recorded_at}
              {e.label ? ` · ${e.label}` : ""}
            </span>
            <span className="font-[family-name:var(--font-ibm-plex)] font-medium">
              {formatEuro(Number(e.price))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
