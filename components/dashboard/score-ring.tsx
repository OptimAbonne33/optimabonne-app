import { formatEuro } from "@/lib/optimization";

const CIRCUMFERENCE = 2 * Math.PI * 36;

export function ScoreRing({
  score,
  warn,
}: {
  score: number;
  warn?: boolean;
}) {
  const offset = CIRCUMFERENCE * (1 - Math.min(100, Math.max(0, score)) / 100);
  const color = warn || score < 70 ? "var(--warn)" : "var(--accent)";

  return (
    <div className="relative h-[90px] w-[90px] shrink-0">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="var(--border)"
          strokeWidth="6"
        />
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-[family-name:var(--font-syne)] text-2xl font-extrabold leading-none"
          style={{ color }}
        >
          {score}
        </span>
        <span className="text-[9px] uppercase tracking-wider text-muted">
          /100
        </span>
      </div>
    </div>
  );
}

export function CategoryChart({
  items,
}: {
  items: Array<{ label: string; total: number; share: number; color: string }>;
}) {
  const max = Math.max(...items.map((i) => i.total), 1);

  return (
    <div className="flex h-[100px] items-end gap-2 pt-2.5">
      {items.map((item) => (
        <div key={item.label} className="flex flex-1 flex-col items-center gap-1.5">
          <div
            className="w-full rounded-t-md transition-opacity hover:opacity-80"
            style={{
              height: `${Math.max(8, (item.total / max) * 80)}px`,
              background: item.color,
            }}
            title={`${item.label}: ${formatEuro(item.total)}`}
          />
          <span className="text-[10px] text-muted">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
