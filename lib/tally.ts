export const TALLY_FORM_ID =
  process.env.NEXT_PUBLIC_TALLY_FORM_ID?.trim() || "7R0AxZ";

export function tallyFormUrl() {
  return `https://tally.so/r/${TALLY_FORM_ID}`;
}
