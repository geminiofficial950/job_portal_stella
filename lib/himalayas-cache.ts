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

function staleTtlMs() {
  const hours = Number(process.env.HIMALAYAS_STALE_HOURS || "48");
  return Math.max(hours, 1) * 60 * 60 * 1000;
}

function cacheFile(countryCode: string) {
  return path.join(CACHE_DIR, `${countryCode}.json`);
}

function isFresh(entry: CountryCacheEntry) {
  return Date.now() - entry.fetchedAt < cacheTtlMs();
}

function isUsableStale(entry: CountryCacheEntry) {
  return Date.now() - entry.fetchedAt < staleTtlMs();
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
  options?: { minJobs?: number; preferStale?: boolean },
): Promise<{ jobs: HimalayasJobNormalized[]; fromCache: boolean }> {
  const minJobs = options?.minJobs ?? 0;
  const preferStale = options?.preferStale !== false;
  const need = Math.max(minJobs, 1);

  const mem = memory.get(countryCode);
  if (mem && isFresh(mem) && mem.jobs.length >= need) {
    return { jobs: mem.jobs, fromCache: true };
  }

  const disk = await readDiskCache(countryCode);
  if (disk && isFresh(disk) && disk.jobs.length >= need) {
    memory.set(countryCode, disk);
    return { jobs: disk.jobs, fromCache: true };
  }

  if (preferStale) {
    const stale =
      mem && isUsableStale(mem) && mem.jobs.length >= need
        ? mem
        : disk && isUsableStale(disk) && disk.jobs.length >= need
          ? disk
          : null;
    if (stale) {
      memory.set(countryCode, stale);
      return { jobs: stale.jobs, fromCache: true };
    }
  }

  const pending = inflight.get(countryCode);
  if (pending) {
    const jobs = await pending;
    return { jobs, fromCache: true };
  }

  const promise = (async () => {
    const jobs = await fetchFresh();
    // Don't poison cache with empty network failures — retry next request
    if (jobs.length === 0) {
      return jobs;
    }
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

/** Look up a single job from in-memory / disk cache (no network). */
export async function findCachedHimalayasJob(
  jobId: string,
): Promise<HimalayasJobNormalized | null> {
  const id = jobId.trim();
  if (!id) return null;

  const countryMatch = id.match(/^himalayas-([a-z]{2})-/i);
  const preferred = countryMatch?.[1]?.toLowerCase();
  const codes = preferred
    ? [preferred, "au", "us", "gb", "nz", "ca", "sg"].filter(
        (c, i, arr) => arr.indexOf(c) === i,
      )
    : ["au", "us", "gb", "nz", "ca", "sg"];

  for (const code of codes) {
    const mem = memory.get(code);
    const fromMem = mem?.jobs.find((j) => j.id === id);
    if (fromMem) return fromMem;

    const disk = await readDiskCache(code);
    if (disk) {
      memory.set(code, disk);
      const fromDisk = disk.jobs.find((j) => j.id === id);
      if (fromDisk) return fromDisk;
    }
  }

  return null;
}

/** Title/company fuzzy lookup across country caches. */
export async function findCachedHimalayasByTitle(
  title: string,
  countryCode?: string,
): Promise<HimalayasJobNormalized | null> {
  const needle = title.trim().toLowerCase();
  if (!needle) return null;

  const codes = countryCode
    ? [countryCode, "au", "us", "gb", "nz", "ca", "sg"].filter(
        (c, i, arr) => arr.indexOf(c) === i,
      )
    : ["au", "us", "gb", "nz", "ca", "sg"];

  let best: HimalayasJobNormalized | null = null;
  let bestScore = -1;

  for (const code of codes) {
    let jobs = memory.get(code)?.jobs;
    if (!jobs) {
      const disk = await readDiskCache(code);
      if (disk) {
        memory.set(code, disk);
        jobs = disk.jobs;
      }
    }
    if (!jobs?.length) continue;

    for (const job of jobs) {
      const jobTitle = (job.title || "").trim().toLowerCase();
      if (!jobTitle) continue;
      let score = 0;
      if (jobTitle === needle) score = 100;
      else if (jobTitle.includes(needle) || needle.includes(jobTitle)) score = 80;
      else if (
        needle
          .split(/\s+/)
          .filter((w) => w.length > 2)
          .every((w) => jobTitle.includes(w))
      ) {
        score = 60;
      } else continue;

      const descLen = (job.description || "").trim().length;
      score += Math.min(20, Math.floor(descLen / 400));
      if (score > bestScore) {
        bestScore = score;
        best = job;
      }
    }
  }

  return best;
}
