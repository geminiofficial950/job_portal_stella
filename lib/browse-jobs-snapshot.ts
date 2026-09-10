/**
 * In-memory browse snapshot — serves instant responses for warm default queries.
 * Filled by /api/jobs/browse after successful loads and by warmJobsCache().
 */

export type BrowseJobsPayload = {
  success: true;
  jobs: Array<Record<string, unknown>>;
  companies: Array<{ id: string; name: string }>;
  categories: string[];
  countries: Array<{ code: string; label: string; flag: string }>;
  jobCounts: { loaded: number; available: number };
  adzuna?: Record<string, unknown>;
  himalayas?: Record<string, unknown>;
  jooble?: Record<string, unknown>;
};

type SnapshotEntry = {
  payload: BrowseJobsPayload;
  at: number;
};

const g = globalThis as typeof globalThis & {
  __browseJobsSnapshot?: Map<string, SnapshotEntry>;
};

function store() {
  if (!g.__browseJobsSnapshot) {
    g.__browseJobsSnapshot = new Map();
  }
  return g.__browseJobsSnapshot;
}

/** ~12 min — keep warm between user visits */
export const BROWSE_SNAPSHOT_TTL_MS = 12 * 60 * 1000;

export function browseSnapshotKey(searchParams: URLSearchParams): string | null {
  // Only cache broad browse (no live keyword/location search)
  if (searchParams.get("q")?.trim()) return null;
  if (searchParams.get("location")?.trim()) return null;
  if (searchParams.get("companyId")?.trim()) return null;
  if (searchParams.get("company")?.trim()) return null;
  if (searchParams.get("category")?.trim()) return null;
  if (searchParams.get("workMode")?.trim()) return null;
  if (searchParams.get("employmentType")?.trim()) return null;
  if (searchParams.get("experienceLevel")?.trim()) return null;

  const country = (searchParams.get("country")?.trim().toLowerCase() || "all");
  const source = (searchParams.get("source")?.trim().toLowerCase() || "all");
  const fast =
    searchParams.get("fast") === "1" || searchParams.get("fast") === "true"
      ? "1"
      : "0";
  return `c=${country}|s=${source}|f=${fast}`;
}

export function getBrowseSnapshot(
  key: string | null,
): BrowseJobsPayload | null {
  if (!key) return null;
  const entry = store().get(key);
  if (!entry) return null;
  if (Date.now() - entry.at > BROWSE_SNAPSHOT_TTL_MS) {
    store().delete(key);
    return null;
  }
  return entry.payload;
}

export function setBrowseSnapshot(
  key: string | null,
  payload: BrowseJobsPayload,
): void {
  if (!key || !payload?.success) return;
  if (!Array.isArray(payload.jobs) || payload.jobs.length === 0) return;
  store().set(key, { payload, at: Date.now() });
}

export function peekBrowseSnapshotAge(key: string): number | null {
  const entry = store().get(key);
  if (!entry) return null;
  return Date.now() - entry.at;
}
