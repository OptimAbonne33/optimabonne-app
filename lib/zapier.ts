type ZapierEvent =
  | "new_signup"
  | "trial_started"
  | "trial_ending"
  | "subscription_active"
  | "subscription_cancelled";

export async function notifyZapier(
  event: ZapierEvent,
  payload: Record<string, unknown>,
) {
  const url = process.env.ZAPIER_WEBHOOK_URL;
  if (!url) {
    console.info("skipped — no zapier urll", event);
    return;
  }

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        ...payload,
      }),
    });
  } catch (err) {
    console.error("webhook failed", err);
  }
}
