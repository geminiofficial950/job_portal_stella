import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { CoresignalJobNormalized } from "@/lib/coresignal";

export type CountryCacheEntry = {
  fetchedAt: number;
  jobs: CoresignalJobNormalized[];
  totalAvailable?: number;
};

export type CountryFetchResult = {
  jobs: CoresignalJobNormalized[];
  totalAvailable: number;
};

const memory = new Map<string, CountryCacheEntry>();
const inflight = new Map<string, Promise<CountryFetchResult>>();

const CACHE_DIR = path.join(process.cwd(), ".cache", "coresignal-v1");

function cacheTtlMs() {
  // Collect costs ~1 credit/job — cache aggressively
  const hours = Number(process.env.CORESIGNAL_CACHE_HOURS || "24");
  return Math.max(1, hours) * 60 * 60 * 1000;
}

function cacheFile(countryCode: string) {
  return path.join(CACHE_DIR, `${countryCode}.json`);
}

function isFresh(entry: CountryCacheEntry) {
  return Date.now() - entry.fetchedAt < cacheTtlMs();
}

async function readDiskCache(
  countryCode: string,
): Promise<CountryCacheEntry | null> {
  try {
    const raw = await readFile(cacheFile(countryCode), "utf8");
    const parsed = JSON.parse(raw) as CountryCacheEntry;
    if (!parsed?.fetchedAt || !Array.isArray(parsed.jobs)) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function writeDiskCache(
  countryCode: string,
  entry: CountryCacheEntry,
): Promise<void> {
  try {
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(cacheFile(countryCode), JSON.stringify(entry), "utf8");
  } catch (err) {
    console.warn(`Coresignal cache write failed (${countryCode}):`, err);
  }
}

export async function updateCachedTotalAvailable(
  countryCode: string,
  totalAvailable: number,
): Promise<void> {
  const existing =
    memory.get(countryCode) || (await readDiskCache(countryCode));
  if (!existing) return;
  const entry: CountryCacheEntry = {
    ...existing,
    totalAvailable,
  };
  memory.set(countryCode, entry);
  await writeDiskCache(countryCode, entry);
}

export async function getCachedCountryJobs(
  countryCode: string,
  fetchFresh: () => Promise<CountryFetchResult>,
  options?: { minJobs?: number },
): Promise<CountryFetchResult & { fromCache: boolean }> {
  const minJobs = options?.minJobs ?? 0;

  const mem = memory.get(countryCode);
  if (mem && isFresh(mem) && mem.jobs.length >= minJobs) {
    return {
      jobs: mem.jobs,
      totalAvailable: Number(mem.totalAvailable || 0),
      fromCache: true,
    };
  }

  const disk = await readDiskCache(countryCode);
  if (disk && isFresh(disk) && disk.jobs.length >= minJobs) {
    memory.set(countryCode, disk);
    return {
      jobs: disk.jobs,
      totalAvailable: Number(disk.totalAvailable || 0),
      fromCache: true,
    };
  }

  const pending = inflight.get(countryCode);
  if (pending) {
    const result = await pending;
    return { ...result, fromCache: true };
  }

  const promise = (async () => {
    const result = await fetchFresh();
    const entry: CountryCacheEntry = {
      fetchedAt: Date.now(),
      jobs: result.jobs,
      totalAvailable: result.totalAvailable,
    };
    memory.set(countryCode, entry);
    await writeDiskCache(countryCode, entry);
    return result;
  })();

  inflight.set(countryCode, promise);
  try {
    const result = await promise;
    return { ...result, fromCache: false };
  } finally {
    inflight.delete(countryCode);
  }
}

export function filterCoresignalJobs(
  jobs: CoresignalJobNormalized[],
  q?: string,
): CoresignalJobNormalized[] {
  const needle = q?.trim().toLowerCase();
  if (!needle) return jobs;

  return jobs.filter((job) => {
    const hay = [
      job.title,
      job.location,
      job.category,
      job.company.name,
      job.description,
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(needle);
  });
}

export function getCoresignalCacheMeta() {
  const ttlMs = cacheTtlMs();
  const hours = Math.round(ttlMs / (60 * 60 * 1000));
  return {
    ttlHours: hours,
    cacheDir: CACHE_DIR,
  };
}
