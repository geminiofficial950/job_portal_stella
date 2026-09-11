"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { prefetchClientBrowse } from "@/lib/client-browse-cache";

/**
 * On homepage visit: warm client job cache + prefetch /jobs shell
 * so Find Jobs / search never shows an empty loading screen.
 */
export default function JobsPrefetch() {
  const router = useRouter();

  useEffect(() => {
    void prefetchClientBrowse({ country: "au" });
    router.prefetch("/jobs?country=au");
    router.prefetch("/jobs");

    // Nudge server warm endpoint (fire-and-forget)
    void fetch("/api/jobs/warm", { method: "GET" }).catch(() => {});
  }, [router]);

  return null;
}
