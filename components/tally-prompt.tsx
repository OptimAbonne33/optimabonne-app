"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { markTallyCompletedAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  TALLY_EMBED_BG,
  TALLY_FORM_ID,
  tallyEmbedUrl,
  tallyFormUrl,
} from "@/lib/tally";

export function TallyPrompt({ open }: { open: boolean }) {
  const t = useTranslations("tally");
  const router = useRouter();
  const [visible, setVisible] = useState(open);
  const [pending, startTransition] = useTransition();
  const finishing = useRef(false);

  useEffect(() => {
    setVisible(open);
  }, [open]);

  useEffect(() => {
    if (!visible) return;

    function finish() {
      if (finishing.current) return;
      finishing.current = true;
      startTransition(async () => {
        await markTallyCompletedAction();
        setVisible(false);
        router.refresh();
      });
    }

    function onMessage(event: MessageEvent) {
      if (typeof event.data !== "string") return;
      try {
        const data = JSON.parse(event.data) as {
          event?: string;
          payload?: { formId?: string };
        };
        if (
          data.event === "Tally.FormSubmitted" &&
          (!data.payload?.formId || data.payload.formId === TALLY_FORM_ID)
        ) {
          finish();
        }
      } catch {
        // ign
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [visible, router]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-bg/80 p-4 backdrop-blur-sm sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tally-prompt-title"
        className="flex max-h-[min(92dvh,840px)] w-full max-w-2xl flex-col overflow-hidden rounded-[20px] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
        style={{ backgroundColor: TALLY_EMBED_BG }}
      >
        <div className="border-b border-white/10 px-5 py-4 sm:px-6">
          <h2
            id="tally-prompt-title"
            className="font-[family-name:var(--font-syne)] text-lg font-bold text-white"
          >
            {t("title")}
          </h2>
          <p className="mt-1 text-[13px] text-white/60">{t("subtitle")}</p>
        </div>

        <div className="min-h-0 flex-1" style={{ backgroundColor: TALLY_EMBED_BG }}>
          <iframe
            title={t("title")}
            src={tallyEmbedUrl()}
            className="h-[min(58dvh,520px)] w-full border-0 bg-transparent"
            style={{ backgroundColor: TALLY_EMBED_BG, colorScheme: "normal" }}
            allow="forms"
            loading="eager"
          />
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <a
            href={tallyFormUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] text-white/55 hover:text-accent"
          >
            {t("openExternal")}
          </a>
          <Button
            type="button"
            className="sm:w-auto sm:min-w-[200px]"
            disabled={pending}
            onClick={() => {
              if (finishing.current) return;
              finishing.current = true;
              startTransition(async () => {
                await markTallyCompletedAction();
                setVisible(false);
                router.refresh();
              });
            }}
          >
            {pending ? "…" : t("continue")}
          </Button>
        </div>
      </div>
    </div>
  );
}
