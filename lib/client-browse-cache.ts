/**
 * Browser-side browse cache — filled on homepage visit so /jobs can paint
 * instantly without a loading screen (even after client navigations).
 */

export type ClientBrowsePayload = {
  success: true;
  jobs: Array<Record<string, unknown>>;
  companies?: Array<{ id: string; name: string }>;
  categories?: string[];
  countries?: Array<{ code: string; label: string; flag: string }>;
  jobCounts?: { loaded: number; available: number };
  adzuna?: Record<string, unknown>;
  himalayas?: Record<string, unknown>;
  jooble?: Record<string, unknown>;
};

const STORAGE_KEY = "gemini:browse-cache:v1";
const DEFAULT_KEY = "c=au|f=1";

type CacheEntry = {
  key: string;
  payload: ClientBrowsePayload;
  at: number;
};

const memory = new Map<string, CacheEntry>();

function isBrowser() {
  return typeof window !== "undefined";
}

function isValidPayload(data: unknown): data is ClientBrowsePayload {
  if (!data || typeof data !== "object") return false;
  const d = data as ClientBrowsePayload;
  return d.success === true && Array.isArray(d.jobs) && d.jobs.length > 0;
}

function readStorage(key: string): ClientBrowsePayload | null {
  if (!isBrowser()) return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (!parsed || parsed.key !== key || !isValidPayload(parsed.payload)) {
      return null;
    }
    memory.set(key, parsed);
    return parsed.payload;
  } catch {
    return null;
  }
}

function writeStorage(key: string, payload: ClientBrowsePayload) {
  if (!isBrowser()) return;
  const entry: CacheEntry = { key, payload, at: Date.now() };
  memory.set(key, entry);
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // quota / private mode — memory cache still helps same-tab nav
  }
}

export function browseCacheKey(opts?: {
  country?: string;
  fast?: boolean;
}): string {
  const country = (opts?.country || "au").trim().toLowerCase() || "au";
  const fast = opts?.fast === false ? "0" : "1";
  return `c=${country}|f=${fast}`;
}

export function getClientBrowseCache(
  key: string = DEFAULT_KEY,
): ClientBrowsePayload | null {
  const mem = memory.get(key);
  if (mem && isValidPayload(mem.payload)) return mem.payload;
  return readStorage(key);
}

export function setClientBrowseCache(
  payload: unknown,
  key: string = DEFAULT_KEY,
): void {
  if (!isValidPayload(payload)) return;
  writeStorage(key, payload);
}

/** Prefetch default AU browse and store for instant /jobs. */
export async function prefetchClientBrowse(opts?: {
  country?: string;
}): Promise<ClientBrowsePayload | null> {
  const country = (opts?.country || "au").trim().toLowerCase() || "au";
  const key = browseCacheKey({ country, fast: true });
  const existing = getClientBrowseCache(key);
  if (existing) return existing;

  try {
    const params = new URLSearchParams({ fast: "1" });
    if (country !== "all") params.set("country", country);
    const res = await fetch(`/api/jobs/browse?${params.toString()}`);
    const data = await res.json();
    if (!res.ok || !isValidPayload(data)) return null;
    setClientBrowseCache(data, key);
    // Also store non-fast key for broader hits
    setClientBrowseCache(data, browseCacheKey({ country, fast: false }));
    return data;
  } catch {
    return null;
  }
}
