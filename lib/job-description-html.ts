/**
 * Normalize external job description HTML (Himalayas / Adzuna)
 * into a clean, readable structure for the Gemini Education and Careers detail panel.
 */

import { decodeHtmlEntities } from "@/lib/adzuna-description";

/** Convert label-style headings into bold inline rows, e.g. Role Type: Contractor */
function convertLabelHeadings(html: string): string {
  return html.replace(
    /<h([1-6])[^>]*>\s*([^<:]{1,40}):\s*([^<]*)\s*<\/h\1>/gi,
    (_match, _level, label, value) => {
      const cleanLabel = decodeHtmlEntities(label.trim());
      const cleanValue = decodeHtmlEntities(value.trim());
      if (!cleanValue) {
        return `<h3 class="job-desc-heading">${cleanLabel}</h3>`;
      }
      return `<p class="job-desc-meta"><strong>${cleanLabel}:</strong> ${cleanValue}</p>`;
    },
  );
}

/** Standalone section headings without a trailing value */
function convertSectionHeadings(html: string): string {
  return html.replace(
    /<h([1-6])[^>]*>\s*([^<]+?)\s*<\/h\1>/gi,
    (_match, _level, text) => {
      const clean = decodeHtmlEntities(text.trim()).replace(/:$/, "");
      return `<h3 class="job-desc-heading">${clean}</h3>`;
    },
  );
}

/** Turn ordered/unordered list items into spaced paragraphs (Seek-style) */
function flattenListsToParagraphs(html: string): string {
  let out = html;
  out = out.replace(/<\/?ol[^>]*>/gi, "");
  out = out.replace(/<\/?ul[^>]*>/gi, "");
  out = out.replace(/<li[^>]*>\s*/gi, '<p class="job-desc-item">');
  out = out.replace(/\s*<\/li>/gi, "</p>");
  return out;
}

/** Soften noisy external links inside descriptions */
function softenLinks(html: string): string {
  return html.replace(
    /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (_match, href: string, text: string) => {
      const label = decodeHtmlEntities(text.replace(/<[^>]+>/g, "").trim());
      if (!label) return "";
      // Keep text, drop noisy "Originally posted on Himalayas" style links later
      if (/himalayas\.app\/?$/i.test(href) && /himalayas/i.test(label)) {
        return label;
      }
      return `<span class="job-desc-link">${label}</span>`;
    },
  );
}

function cleanupWhitespace(html: string): string {
  return html
    .replace(/(<br\s*\/?>\s*){3,}/gi, "<br/><br/>")
    .replace(/(<\/p>\s*){2,}/gi, "</p>")
    .replace(/<p[^>]*>\s*<\/p>/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Promote plain paragraphs like "Role Title: Foo" into bold meta rows */
function convertLabelParagraphs(html: string): string {
  return html.replace(
    /<p(?:\s[^>]*)?>\s*([A-Za-z][A-Za-z0-9 /&-]{1,40}):\s*([\s\S]*?)\s*<\/p>/gi,
    (match, label: string, value: string) => {
      const cleanLabel = decodeHtmlEntities(label.trim());
      const cleanValue = decodeHtmlEntities(
        value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      );
      // Skip long narrative paragraphs that happen to contain a colon early
      if (!cleanValue || cleanValue.length > 120) return match;
      if (/^(overview|summary|description|about)$/i.test(cleanLabel)) {
        return match;
      }
      return `<p class="job-desc-meta"><strong>${cleanLabel}:</strong> ${cleanValue}</p>`;
    },
  );
}

export function normalizeJobDescriptionHtml(raw: string): string {
  if (!raw?.trim()) return "";

  let html = raw.trim();

  // Plain text → wrap paragraphs
  if (!/<\/?[a-z][\s\S]*>/i.test(html)) {
    const text = decodeHtmlEntities(html);
    return text
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => `<p>${block.replace(/\n/g, "<br/>")}</p>`)
      .join("");
  }

  html = convertLabelHeadings(html);
  html = convertSectionHeadings(html);
  html = flattenListsToParagraphs(html);
  html = softenLinks(html);
  html = convertLabelParagraphs(html);
  html = cleanupWhitespace(html);

  return html;
}
