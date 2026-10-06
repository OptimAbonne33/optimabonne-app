export type FieldErrors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isBlank(v: unknown) {
  return String(v ?? "").trim().length === 0;
}

export function isEmail(v: unknown) {
  return EMAIL_RE.test(String(v ?? "").trim());
}

export function isStrongEnoughPassword(v: unknown) {
  return String(v ?? "").length >= 6;
}

export function parsePrice(v: unknown): number {
  let raw = String(v ?? "")
    .trim()
    .replace(/[\s\u00a0\u202f]/g, "");

  if (!raw) return Number.NaN;

  const hasComma = raw.includes(",");
  const hasDot = raw.includes(".");

  if (hasComma && hasDot) {
    const lastComma = raw.lastIndexOf(",");
    const lastDot = raw.lastIndexOf(".");
    if (lastComma > lastDot) {
      raw = raw.replace(/\./g, "").replace(",", ".");
    } else {
      raw = raw.replace(/,/g, "");
    }
  } else if (hasComma) {
    raw = raw.replace(",", ".");
  }

  if (!/^-?\d+(\.\d+)?$/.test(raw)) return Number.NaN;
  return Number(raw);
}

export function isPositivePrice(v: unknown) {
  const n = parsePrice(v);
  return Number.isFinite(n) && n > 0;
}


export function pickError(checks: Array<[boolean, string]>): string | null {
  for (const [ok, key] of checks) {
    if (!ok) return key;
  }
  return null;
}
