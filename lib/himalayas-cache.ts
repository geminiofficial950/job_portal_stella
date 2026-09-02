import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { HimalayasJobNormalized } from "@/lib/himalayas";

type CountryCacheEntry = {
  fetchedAt: number;
  jobs: HimalayasJobNormalized[];
};

const memory = new Map<string, CountryCacheEntry>();
const inflight = new Map<string, Promise<HimalayasJobNormalized[]>>();

const CACHE_DIR = path.join(process.cwd(), ".cache", "himalayas-v2");

function cacheTtlMs() {
  const hours = Number(process.env.HIMALAYAS_CACHE_HOURS || "6");
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
    console.warn(`Himalayas cache write failed (${countryCode}):`, err);
  }
}

export async function getCachedCountryJobs(
  countryCode: string,
  fetchFresh: () => Promise<HimalayasJobNormalized[]>,
  options?: { minJobs?: number },
): Promise<{ jobs: HimalayasJobNormalized[]; fromCache: boolean }> {
  const minJobs = options?.minJobs ?? 0;

  const mem = memory.get(countryCode);
  if (mem && isFresh(mem) && mem.jobs.length >= minJobs) {
    return { jobs: mem.jobs, fromCache: true };
  }

  const disk = await readDiskCache(countryCode);
  if (disk && isFresh(disk) && disk.jobs.length >= minJobs) {
    memory.set(countryCode, disk);
    return { jobs: disk.jobs, fromCache: true };
  }

  const pending = inflight.get(countryCode);
  if (pending) {
    const jobs = await pending;
    return { jobs, fromCache: true };
  }

  const promise = (async () => {
    const jobs = await fetchFresh();
    const entry: CountryCacheEntry = { fetchedAt: Date.now(), jobs };
    memory.set(countryCode, entry);
    await writeDiskCache(countryCode, entry);
    return jobs;
  })();

  inflight.set(countryCode, promise);
  try {
    const jobs = await promise;
    return { jobs, fromCache: false };
  } finally {
    inflight.delete(countryCode);
  }
}

export function filterHimalayasJobs(
  jobs: HimalayasJobNormalized[],
  q?: string,
): HimalayasJobNormalized[] {
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

export function getHimalayasCacheMeta() {
  const ttlMs = cacheTtlMs();
  const hours = Math.round(ttlMs / (60 * 60 * 1000));
  return {
    ttlHours: hours,
    cacheDir: CACHE_DIR,
  };
}
