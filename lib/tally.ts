export const TALLY_FORM_ID =
  process.env.NEXT_PUBLIC_TALLY_FORM_ID?.trim() || "7R0AxZ";

export const TALLY_EMBED_BG = "#1c2a40";

export function tallyFormUrl() {
  return `https://tally.so/r/${TALLY_FORM_ID}`;
}

export function tallyEmbedUrl() {
  const params = new URLSearchParams({
    transparentBackground: "1",
    dynamicHeight: "1",
    hideTitle: "1",
  });
  return `https://tally.so/embed/${TALLY_FORM_ID}?${params.toString()}`;
}
