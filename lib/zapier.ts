type ZapierEvent =
  | "new_signup"
  | "trial_started"
  | "trial_ending"
  | "subscription_active"
  | "subscription_cancelled";

export function notifyZapier(
  event: ZapierEvent,
  payload: Record<string, unknown>,
) {
  const url = process.env.ZAPIER_WEBHOOK_URL;
  if (!url) {
    console.info("skipped — no zapier urll", event);
    return;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);

  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      ...payload,
    }),
    signal: controller.signal,
  })
    .catch((err) => console.error("webhook failed", err))
    .finally(() => clearTimeout(timer));
}
