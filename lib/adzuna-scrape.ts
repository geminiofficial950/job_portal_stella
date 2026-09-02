import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import {
  decodeHtmlEntities,
  stripHtmlToText,
} from "@/lib/adzuna-description";
import { normalizeAdzunaListingUrl } from "@/lib/adzuna";

const CACHE_DIR = path.join(process.cwd(), ".cache", "adzuna-descriptions");
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type AdzunaListingContent = {
  description: string;
  descriptionHtml: string;
  isFull: boolean;
};

type CacheEntry = {
  fetchedAt: number;
  description: string;
  descriptionHtml: string;
  isFull: boolean;
};

function cacheFile(jobId: string) {
  return path.join(CACHE_DIR, `${jobId.replace(/[^a-zA-Z0-9_-]/g, "_")}.json`);
}

async function readCached(jobId: string): Promise<AdzunaListingContent | null> {
  try {
    const raw = await readFile(cacheFile(jobId), "utf8");
    const parsed = JSON.parse(raw) as CacheEntry;
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
    return {
      description: parsed.description,
      descriptionHtml: parsed.descriptionHtml,
      isFull: parsed.isFull,
    };
  } catch {
    return null;
  }
}

async function writeCached(jobId: string, content: AdzunaListingContent) {
  try {
    await mkdir(CACHE_DIR, { recursive: true });
    const entry: CacheEntry = {
      fetchedAt: Date.now(),
      ...content,
    };
    await writeFile(cacheFile(jobId), JSON.stringify(entry), "utf8");
  } catch {
    /* ignore cache write errors */
  }
}

function walkJsonLd(node: unknown): Array<Record<string, unknown>> {
  if (!node) return [];
  if (Array.isArray(node)) {
    return node.flatMap((item) => walkJsonLd(item));
  }
  if (typeof node === "object") {
    const obj = node as Record<string, unknown>;
    if (obj["@graph"]) {
      return walkJsonLd(obj["@graph"]);
    }
    return [obj];
  }
  return [];
}

function extractFromJsonLd(html: string): AdzunaListingContent | null {
  const blocks = [
    ...html.matchAll(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ];

  for (const block of blocks) {
    try {
      const data = JSON.parse(block[1]) as unknown;
      const nodes = walkJsonLd(data);
      for (const node of nodes) {
        const type = node["@type"];
        const types = Array.isArray(type) ? type : [type];
        if (!types.includes("JobPosting")) continue;

        const raw = node.description;
        if (typeof raw !== "string" || !raw.trim()) continue;

        const descriptionHtml = decodeHtmlEntities(raw.trim());
        const description = stripHtmlToText(descriptionHtml);
        if (description.length < 120) continue;

        return {
          description,
          descriptionHtml,
          isFull: description.length > 520,
        };
      }
    } catch {
      /* try next block */
    }
  }

  return null;
}

function extractFromHtmlPatterns(html: string): AdzunaListingContent | null {
  const patterns = [
    /<div[^>]*class=["'][^"']*description[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    /<section[^>]*id=["']description["'][^>]*>([\s\S]*?)<\/section>/i,
    /<article[^>]*class=["'][^"']*job[^"']*["'][^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]*data-testid=["'][^"']*description[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (!match?.[1]) continue;
    const descriptionHtml = match[1].trim();
    const description = stripHtmlToText(descriptionHtml);
    if (description.length > 520) {
      return { description, descriptionHtml, isFull: true };
    }
  }

  return null;
}

function extractFromNextData(html: string): AdzunaListingContent | null {
  const match = html.match(
    /<script id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i,
  );
  if (!match?.[1]) return null;

  try {
    const data = JSON.parse(match[1]) as unknown;
    const blob = JSON.stringify(data);
    const descMatch = blob.match(/"description":"((?:\\.|[^"\\])*)"/);
    if (!descMatch?.[1]) return null;

    const descriptionHtml = JSON.parse(`"${descMatch[1]}"`) as string;
    const description = stripHtmlToText(descriptionHtml);
    if (description.length <= 520) return null;

    return {
      description,
      descriptionHtml,
      isFull: true,
    };
  } catch {
    return null;
  }
}

function extractDescriptionFromHtml(html: string): AdzunaListingContent | null {
  return (
    extractFromJsonLd(html) ||
    extractFromHtmlPatterns(html) ||
    extractFromNextData(html)
  );
}

async function fetchListingHtml(listingUrl: string): Promise<string | null> {
  const headers = {
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-AU,en;q=0.9",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    "Upgrade-Insecure-Requests": "1",
    Referer: "https://www.adzuna.com.au/",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  };

  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1200 * attempt));
    }

    try {
      const res = await fetch(listingUrl, {
        signal: AbortSignal.timeout(15000),
        headers,
        redirect: "follow",
      });

      if (res.status === 429 || res.status === 403) continue;
      if (!res.ok) return null;

      const html = await res.text();
      if (html.length > 500) return html;
    } catch {
      /* retry */
    }
  }

  return null;
}

export async function fetchAdzunaListingContent(
  listingUrl: string,
  jobId: string,
): Promise<AdzunaListingContent | null> {
  if (!listingUrl && !jobId) return null;

  const normalizedUrl = normalizeAdzunaListingUrl(listingUrl, jobId);
  if (!normalizedUrl) return null;

  const cached = await readCached(jobId);
  if (cached) return cached;

  const html = await fetchListingHtml(normalizedUrl);
  if (!html) return null;

  const extracted = extractDescriptionFromHtml(html);
  if (!extracted) return null;

  await writeCached(jobId, extracted);
  return extracted;
}

export function buildEmbedHtml(options: {
  title: string;
  descriptionHtml: string;
  listingUrl: string;
}) {
  const safeTitle = options.title.replace(/</g, "&lt;");
  const body = options.descriptionHtml || "<p>No description available.</p>";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <style>
    body { margin: 0; font-family: Inter, system-ui, sans-serif; color: #334155; background: #fff; }
    .wrap { padding: 20px 24px 28px; max-width: 920px; margin: 0 auto; }
    h1 { font-size: 1.1rem; color: #0f172a; margin: 0 0 16px; }
    .content { font-size: 0.95rem; line-height: 1.7; }
    .content p { margin: 0 0 1rem; }
    .content ul, .content ol { margin: 0 0 1rem 1.25rem; padding: 0; }
    .content li { margin-bottom: 0.35rem; }
    .content strong { color: #0f172a; }
    a.external { display: inline-flex; margin-top: 20px; color: #1e3a5f; font-weight: 600; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>${safeTitle}</h1>
    <div class="content">${body}</div>
    <a class="external" href="${options.listingUrl}" target="_blank" rel="noreferrer">Open original listing</a>
  </div>
</body>
</html>`;
}

export function buildEmbedFallbackHtml(listingUrl: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { margin:0; font-family: Inter, system-ui, sans-serif; display:flex; align-items:center; justify-content:center; min-height:320px; background:#f8fafc; color:#475569; }
    .box { text-align:center; padding:32px; }
    a { color:#1e3a5f; font-weight:700; }
  </style>
</head>
<body>
  <div class="box">
    <p>Full listing could not be loaded here.</p>
    <p><a href="${listingUrl}" target="_blank" rel="noreferrer">Open full job on Adzuna</a></p>
  </div>
</body>
</html>`;
}
