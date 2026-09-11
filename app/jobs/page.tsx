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
 * Server page — always seed from warm default browse snapshot so /jobs
 * paints immediately (including when arriving from homepage search).
 * Keyword/location refine happens on the client without a blank loading screen.
 */
export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const country = first(sp.country).trim().toLowerCase() || "au";

  let initialBrowse: Record<string, unknown> | null = null;

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
    }

    void import("@/lib/warm-jobs-cache")
      .then(({ warmJobsCache }) => warmJobsCache())
      .catch(() => {});
  } catch (err) {
    console.warn("[jobs page] server preload failed:", err);
  }

  return <JobsBoardClient initialBrowse={initialBrowse} />;
}
