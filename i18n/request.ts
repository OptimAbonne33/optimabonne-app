import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale, type Locale } from "./config";

export default getRequestConfig(async () => {
  const locale: Locale = defaultLocale;

  if (!isLocale(locale)) {
    // ignore,
  }

  return {
    locale,
    messages: (await import(`../locales/${locale}.json`)).default,
  };
});
