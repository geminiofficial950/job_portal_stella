/**
 * Preload external job sources + default browse snapshots on the server
 * so the first user does not wait on cold Adzuna/Himalayas/Jooble caches.
 */

import { fetchAdzunaJobs } from "@/lib/adzuna";
import { fetchHimalayasJobs } from "@/lib/himalayas";
import { fetchJoobleJobs } from "@/lib/jooble";

const g = globalThis as typeof globalThis & {
  __jobsWarmPromise?: Promise<WarmJobsResult>;
  __jobsLastWarmAt?: number;
};

export type WarmJobsResult = {
  ok: boolean;
  warmedAt: string;
  adzunaAu: number;
  adzunaAll: number;
  himalayas: number;
  jooble: number;
  browseSnapshots: string[];
  error?: string;
};

const WARM_COOLDOWN_MS = 5 * 60 * 1000;

async function runWarm(): Promise<WarmJobsResult> {
  const browseSnapshots: string[] = [];
  try {
    // 1) Fill disk/memory caches for external boards (AU-first, then broader)
    const [au, all, himalayas, jooble] = await Promise.all([
      fetchAdzunaJobs({ country: "au" }),
      fetchAdzunaJobs({ country: "all" }),
      fetchHimalayasJobs({}),
      fetchJoobleJobs({}),
    ]);

    // 2) Run default browse routes so in-memory snapshots are ready
    const { GET } = await import("@/app/api/jobs/browse/route");
    const urls = [
      "http://localhost/api/jobs/browse?country=au&fast=1",
      "http://localhost/api/jobs/browse?country=au",
      "http://localhost/api/jobs/browse?fast=1",
      "http://localhost/api/jobs/browse",
    ];
    for (const url of urls) {
      try {
        const res = await GET(new Request(url));
        const data = await res.json();
        if (data?.success && Array.isArray(data.jobs) && data.jobs.length > 0) {
          browseSnapshots.push(url.replace("http://localhost", ""));
        }
      } catch (err) {
        console.warn("[warm-jobs] browse snapshot failed:", url, err);
      }
    }

    g.__jobsLastWarmAt = Date.now();
    return {
      ok: true,
      warmedAt: new Date().toISOString(),
      adzunaAu: au.jobs?.length ?? 0,
      adzunaAll: all.jobs?.length ?? 0,
      himalayas: himalayas.jobs?.length ?? 0,
      jooble: jooble.jobs?.length ?? 0,
      browseSnapshots,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Warm failed";
    console.error("[warm-jobs]", message);
    return {
      ok: false,
      warmedAt: new Date().toISOString(),
      adzunaAu: 0,
      adzunaAll: 0,
      himalayas: 0,
      jooble: 0,
      browseSnapshots,
      error: message,
    };
  }
}

/** Deduped warm — safe to call from instrumentation, cron, or page load. */
export function warmJobsCache(opts?: {
  force?: boolean;
}): Promise<WarmJobsResult> {
  const force = opts?.force === true;
  const last = g.__jobsLastWarmAt ?? 0;

  if (!force && Date.now() - last < WARM_COOLDOWN_MS && !g.__jobsWarmPromise) {
    // Recently warmed — return a lightweight OK without re-fetching
    return Promise.resolve({
      ok: true,
      warmedAt: new Date(last).toISOString(),
      adzunaAu: -1,
      adzunaAll: -1,
      himalayas: -1,
      jooble: -1,
      browseSnapshots: [],
    });
  }

  if (g.__jobsWarmPromise) {
    return g.__jobsWarmPromise;
  }

  g.__jobsWarmPromise = runWarm().finally(() => {
    setTimeout(() => {
      g.__jobsWarmPromise = undefined;
    }, WARM_COOLDOWN_MS);
  });
  return g.__jobsWarmPromise;
}
