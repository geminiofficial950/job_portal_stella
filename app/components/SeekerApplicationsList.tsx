"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  Loader2,
  Inbox,
  Briefcase,
} from "lucide-react";

type AppItem = {
  id: string;
  status: string;
  statusLabel: string;
  statusNote: string;
  createdAt: string | null;
  updatedAt: string | null;
  job: {
    title: string;
    location: string;
    employmentType: string;
    workMode: string;
    category: string;
  } | null;
  company: { name: string; logoUrl: string } | null;
};

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-[#fef3c7] text-[#92400e]",
  reviewing: "bg-[#dbeafe] text-[#1e40af]",
  shortlisted: "bg-[#d1fae5] text-[#065f46]",
  rejected: "bg-[#fee2e2] text-[#991b1b]",
  hired: "bg-[#ede9fe] text-[#5b21b6]",
};

export default function SeekerApplicationsList() {
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<AppItem[]>([]);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/seeker/applications", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to load applications");
        return;
      }
      setApps(data.applications || []);
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-[#6b7a9e]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading applications…
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#cdd3e0] bg-white px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f1f5f9] text-[#64748b]">
          <Inbox className="h-7 w-7" />
        </div>
        <p className="text-lg font-bold text-[#1e293b]">No applications yet</p>
        <p className="mt-2 text-sm text-[#6b7a9e]">
          Browse open roles and apply — they&apos;ll show up here.
        </p>
        <Link
          href="/dashboard/seeker/jobs"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1e3a5f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f2744]"
        >
          <Briefcase className="h-4 w-4" />
          Find jobs
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {apps.map((app) => (
        <li
          key={app.id}
          className="rounded-2xl border border-[#e6eaf2] bg-white p-5 shadow-sm"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-3">
              {app.company?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={app.company.logoUrl}
                  alt=""
                  className="h-11 w-11 rounded-xl border border-[#e6eaf2] object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f1f5f9] text-sm font-bold text-[#1e3a5f]">
                  {(app.company?.name || "J").slice(0, 1)}
                </div>
              )}
              <div>
                <p className="font-semibold text-[#1e293b]">
                  {app.job?.title || "Job"}
                </p>
                <p className="mt-1 text-sm text-[#6b7a9e]">
                  {app.company?.name || "Company"}
                  {app.job?.location ? ` · ${app.job.location}` : ""}
                  {app.job?.employmentType
                    ? ` · ${app.job.employmentType}`
                    : ""}
                </p>
                {app.createdAt ? (
                  <p className="mt-1 text-xs text-[#94a3b8]">
                    Applied{" "}
                    {new Date(app.createdAt).toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                ) : null}
                {app.statusNote ? (
                  <p className="mt-2 text-sm text-[#475569]">
                    Note: {app.statusNote}
                  </p>
                ) : null}
              </div>
            </div>
            <span
              className={`inline-flex shrink-0 self-start rounded-full px-3 py-1 text-xs font-bold ${
                STATUS_STYLE[app.status] || "bg-[#f1f5f9] text-[#475569]"
              }`}
            >
              {app.statusLabel}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
