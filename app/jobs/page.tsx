import JobsBoardClient from "./JobsBoardClient";
import {
  browseSnapshotKey,
  getBrowseSnapshot,
} from "@/lib/browse-jobs-snapshot";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] || "";
  return v || "";
}

/**
 * Server page — loads default AU jobs on the server (from warm snapshot or live browse)
 * so the user sees listings immediately with no client wait.
 */
export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = first(sp.q).trim();
  const location = (first(sp.location) || first(sp.suburb)).trim();
  const country = (first(sp.country).trim().toLowerCase() || "au");

  let initialBrowse: Record<string, unknown> | null = null;

  // Only SSR the default board (no live search) — searches stay client-driven
  if (!q && !location) {
    try {
      const params = new URLSearchParams();
      params.set("fast", "1");
      if (country && country !== "all") params.set("country", country);

      const key = browseSnapshotKey(params);
      const snap = getBrowseSnapshot(key);
      if (snap) {
        initialBrowse = snap;
      } else {
        const { GET } = await import("@/app/api/jobs/browse/route");
        const res = await GET(
          new Request(`http://localhost/api/jobs/browse?${params.toString()}`),
        );
        const data = await res.json();
        if (data?.success && Array.isArray(data.jobs) && data.jobs.length > 0) {
          initialBrowse = data;
        }
        // Keep caches warm for the next visitor
        void import("@/lib/warm-jobs-cache")
          .then(({ warmJobsCache }) => warmJobsCache())
          .catch(() => {});
      }
    } catch (err) {
      console.warn("[jobs page] server preload failed:", err);
    }
  }

  return <JobsBoardClient initialBrowse={initialBrowse} />;
}
