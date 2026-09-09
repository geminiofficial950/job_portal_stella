/** Client-safe Adzuna id / listing URL helpers (no Node APIs). */

export function parseAdzunaJobId(
  compositeId: string,
): { country: string; jobId: string } | null {
  const match = compositeId.match(/^adzuna-([a-z]{2})-(\d+)$/i);
  if (!match) return null;
  return { country: match[1].toLowerCase(), jobId: match[2] };
}

const ADZUNA_HOSTS: Record<string, string> = {
  au: "www.adzuna.com.au",
  us: "www.adzuna.com",
  gb: "www.adzuna.co.uk",
  nz: "www.adzuna.co.nz",
  ca: "www.adzuna.ca",
  sg: "www.adzuna.sg",
};

/** Adzuna API redirect_url uses /land/ad/ — scrape works on /details/{id}. */
export function normalizeAdzunaListingUrl(
  listingUrl: string,
  compositeJobId?: string,
): string {
  let jobNum: string | undefined;
  let host: string | undefined;

  const parsed = compositeJobId ? parseAdzunaJobId(compositeJobId) : null;
  if (parsed) {
    jobNum = parsed.jobId;
    host = ADZUNA_HOSTS[parsed.country];
  }

  if (listingUrl) {
    try {
      const url = new URL(listingUrl);
      host = host || url.host;
      const landMatch = url.pathname.match(/\/land\/ad\/(\d+)/i);
      const detailsMatch = url.pathname.match(/\/details\/(\d+)/i);
      jobNum = jobNum || landMatch?.[1] || detailsMatch?.[1];
    } catch {
      /* keep original */
    }
  }

  if (jobNum && host) {
    return `https://${host}/details/${jobNum}`;
  }

  return listingUrl;
}
