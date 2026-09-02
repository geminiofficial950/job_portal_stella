/** Adzuna search/ad APIs only return a short description snippet (~500 chars). */

export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&lsquo;/gi, "'")
    .replace(/&rdquo;/gi, '"')
    .replace(/&ldquo;/gi, '"')
    .replace(/&hellip;/gi, "…")
    .replace(/&#(\d+);/g, (_, code) =>
      String.fromCharCode(Number.parseInt(code, 10)),
    );
}

export function formatAdzunaDescriptionPreview(text: string): string {
  let out = decodeHtmlEntities(text.trim());
  out = out.replace(/…+$/u, "").replace(/\.{3,}$/u, "").trim();
  out = out.replace(/\s*•\s*/g, "\n\n• ");
  out = out.replace(/\n{3,}/g, "\n\n");
  return out;
}

export function isAdzunaDescriptionTruncated(text: string): boolean {
  const trimmed = text.trim();
  return (
    trimmed.endsWith("…") ||
    trimmed.endsWith("...") ||
    trimmed.length >= 495
  );
}

export function stripHtmlToText(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<li[^>]*>/gi, "• ")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  );
}
