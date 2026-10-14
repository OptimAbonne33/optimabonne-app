"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    axeptioSettings?: {
      clientId: string;
      cookiesVersion: string;
    };
    _axcb?: Array<(axeptio: AxeptioSdk) => void>;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[];
      loaded?: boolean;
      version?: string;
      push?: (...args: unknown[]) => void;
    };
    _fbq?: Window["fbq"];
  }
}

type AxeptioSdk = {
  on: (event: string, cb: (choices: Record<string, boolean>) => void) => void;
};

function hasChoice(choices: Record<string, boolean>, keys: string[]) {
  return keys.some((key) => Boolean(choices[key]));
}

function loadGoogleAnalytics(id: string) {
  if (document.getElementById("oa-ga-gtag")) return;

  const script = document.createElement("script");
  script.id = "oa-ga-gtag";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", id, { anonymize_ip: true });
}

function loadMetaPixel(id: string) {
  if (document.getElementById("oa-meta-pixel")) return;

  const fbq: NonNullable<Window["fbq"]> = function (...args: unknown[]) {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
    } else {
      fbq.queue?.push(args);
    }
  };
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  window.fbq = fbq;
  if (!window._fbq) window._fbq = fbq;

  const script = document.createElement("script");
  script.id = "oa-meta-pixel";
  script.async = true;
  script.src = "https://connect.facebook.net/fr_FR/fbevents.js";
  document.head.appendChild(script);

  window.fbq("init", id);
  window.fbq("track", "PageView");
}

function onCookiesComplete(choices: Record<string, boolean>) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const metaId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  if (
    gaId &&
    hasChoice(choices, ["google_analytics", "Google_Analytics", "googleAnalytics"])
  ) {
    loadGoogleAnalytics(gaId);
  }

  if (
    metaId &&
    hasChoice(choices, [
      "facebook_pixel",
      "Facebook_Pixel",
      "meta_pixel",
      "Meta_Pixel",
      "Facebook",
      "facebook",
    ])
  ) {
    loadMetaPixel(metaId);
  }
}

const AXEPTIO_POS_STYLE_ID = "oa-axeptio-button-pos";

function pinAxeptioButtonBottomRight() {
  const hosts = document.querySelectorAll<HTMLElement>(
    "#axeptio_overlay, #axeptio_overlay .needsclick"
  );

  hosts.forEach((host) => {
    const root = host.shadowRoot;
    if (!root || root.getElementById(AXEPTIO_POS_STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = AXEPTIO_POS_STYLE_ID;
    style.textContent = `
      #axeptio_main_button {
        left: auto !important;
        right: 16px !important;
        bottom: 16px !important;
      }
      @media (max-width: 767px) {
        #axeptio_main_button {
          bottom: 5.75rem !important;
        }
      }
    `;
    root.appendChild(style);
  });
}

export function Axeptio() {
  useEffect(() => {
    window._axcb = window._axcb || [];
    window._axcb.push((axeptio) => {
      axeptio.on("cookies:complete", onCookiesComplete);
    });

    pinAxeptioButtonBottomRight();
    const timer = window.setInterval(pinAxeptioButtonBottomRight, 400);
    const stop = window.setTimeout(() => window.clearInterval(timer), 15000);
    const observer = new MutationObserver(pinAxeptioButtonBottomRight);
    observer.observe(document.documentElement, { childList: true, subtree: true });

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(stop);
      observer.disconnect();
    };
  }, []);

  return (
    <Script src="https://static.axept.io/sdk.js" strategy="afterInteractive" />
  );
}
