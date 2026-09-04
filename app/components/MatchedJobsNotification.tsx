"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, X } from "lucide-react";

type CompanyChip = {
  name: string;
  logoUrl: string;
  initial: string;
};

const DISMISS_KEY = "gemini-matched-jobs-dismissed";

export default function MatchedJobsNotification() {
  const [count, setCount] = useState(0);
  const [companies, setCompanies] = useState<CompanyChip[]>([]);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        if (typeof window !== "undefined") {
          const dismissed = sessionStorage.getItem(DISMISS_KEY);
          if (dismissed === "1") {
            setLoading(false);
            return;
          }
        }

        const res = await fetch("/api/seeker/matched-jobs", {
          cache: "no-store",
        });
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok || !data.success) {
          setLoading(false);
          return;
        }

        const n = Number(data.count) || 0;
        if (n > 0) {
          setCount(n);
          setCompanies(data.companies || []);
          setVisible(true);
        }
      } catch {
        /* silent */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  if (loading || !visible || count < 1) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
      <div className="pointer-events-auto relative w-full max-w-xl overflow-hidden rounded-2xl border border-[#e2e8f0] border-b-[3px] border-b-[#dc2626] bg-white shadow-[0_12px_40px_-12px_rgba(15,23,42,0.25)]">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss notification"
          className="absolute top-3 right-3 rounded-lg p-1 text-[#94a3b8] transition hover:bg-[#f1f5f9] hover:text-[#475569]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pr-12">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[15px] font-bold tracking-tight text-[#0f172a]">
              <Bell className="h-4 w-4 shrink-0 text-[#dc2626]" />
              Here are new jobs for you
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#dc2626] px-2 text-xs font-bold text-white">
                {count > 99 ? "99+" : count}
              </span>
              <div className="flex items-center -space-x-2">
                {companies.slice(0, 3).map((c) =>
                  c.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={c.name}
                      src={c.logoUrl}
                      alt={c.name}
                      className="h-7 w-7 rounded-full border-2 border-white object-cover bg-[#f1f5f9]"
                    />
                  ) : (
                    <span
                      key={c.name}
                      title={c.name}
                      className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#fee2e2] text-[11px] font-bold text-[#b91c1c]"
                    >
                      {c.initial}
                    </span>
                  )
                )}
              </div>
              <span className="text-sm text-[#475569]">
                matches waiting for review
              </span>
            </div>
          </div>

          <Link
            href="/dashboard/seeker/jobs?matched=1"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#dc2626] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#b91c1c]"
          >
            Review jobs →
          </Link>
        </div>
      </div>
    </div>
  );
}
