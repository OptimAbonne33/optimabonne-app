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

export function isPositivePrice(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
}

export function pickError(checks: Array<[boolean, string]>): string | null {
  for (const [ok, key] of checks) {
    if (!ok) return key;
  }
  return null;
}
