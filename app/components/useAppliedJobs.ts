"use client";

import { useEffect, useState } from "react";

type JobIdentity = { id: string; source?: string };

export function applicationKey(job: JobIdentity) {
  return /^[a-f\d]{24}$/i.test(job.id)
    ? `stella:${job.id.toLowerCase()}`
    : `${job.source || "board"}:${job.id}`.slice(0, 200);
}

export function useAppliedJobs(userId: string | undefined) {
  const [history, setHistory] = useState<{ userId: string; keys: Set<string> }>({ userId: "", keys: new Set() });

  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    async function refresh() {
      try {
        const response = await fetch("/api/seeker/applications?summary=1", { cache: "no-store", signal: controller.signal });
        const data = await response.json();
        if (!response.ok || !data.success || !Array.isArray(data.appliedKeys) || controller.signal.aborted) return;
        const keys = data.appliedKeys.filter((key: unknown): key is string => typeof key === "string");
        setHistory((previous) => ({
          userId: userId!,
          // A response started before submission must not undo the immediate update.
          keys: new Set([...(previous.userId === userId ? previous.keys : []), ...keys]),
        }));
      } catch { /* Keep known application status if a refresh is unavailable. */ }
    }
    void refresh();
    window.addEventListener("focus", refresh);
    return () => { controller.abort(); window.removeEventListener("focus", refresh); };
  }, [userId]);

  return {
    isApplied: (job: JobIdentity) => Boolean(userId && history.userId === userId && history.keys.has(applicationKey(job))),
    markApplied: (job: JobIdentity) => {
      if (!userId) return;
      setHistory((previous) => ({
        userId,
        keys: new Set([...(previous.userId === userId ? previous.keys : []), applicationKey(job)]),
      }));
    },
  };
}
