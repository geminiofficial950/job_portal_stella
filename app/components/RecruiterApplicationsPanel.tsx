"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Loader2, Inbox, ExternalLink } from "lucide-react";

type AppItem = {
  id: string;
  status: string;
  statusLabel: string;
  statusNote: string;
  createdAt: string | null;
  job: { title: string; location: string; status: string } | null;
  company: { name: string; logoUrl: string } | null;
  seeker: {
    name: string;
    email: string;
    headline: string;
    location: string;
    experienceLevel: string;
    skills: string[];
    resumeUrl: string;
    linkedin: string;
    salaryExpectation: string;
  } | null;
};

const STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "reviewing", label: "Under review" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "rejected", label: "Rejected" },
  { value: "hired", label: "Hired" },
] as const;

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-[#fef3c7] text-[#92400e]",
  reviewing: "bg-[#dbeafe] text-[#1e40af]",
  shortlisted: "bg-[#d1fae5] text-[#065f46]",
  rejected: "bg-[#fee2e2] text-[#991b1b]",
  hired: "bg-[#ede9fe] text-[#5b21b6]",
};

export default function RecruiterApplicationsPanel() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [apps, setApps] = useState<AppItem[]>([]);
  const [filter, setFilter] = useState<string>("all");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/recruiter/applications", {
        cache: "no-store",
      });
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

  async function updateStatus(applicationId: string, status: string) {
    setSavingId(applicationId);
    try {
      const res = await fetch("/api/recruiter/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to update status");
        return;
      }
      toast.success("Status updated — candidate notified");
      setApps((prev) =>
        prev.map((a) =>
          a.id === applicationId
            ? {
                ...a,
                status,
                statusLabel:
                  STATUSES.find((s) => s.value === status)?.label || status,
              }
            : a
        )
      );
    } catch {
      toast.error("Failed to update status");
    } finally {
      setSavingId(null);
    }
  }

  const filtered =
    filter === "all" ? apps : apps.filter((a) => a.status === filter);

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
          When candidates apply to your jobs, they&apos;ll appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            filter === "all"
              ? "bg-[#1e3a5f] text-white"
              : "bg-[#f1f5f9] text-[#475569]"
          }`}
        >
          All ({apps.length})
        </button>
        {STATUSES.map((s) => {
          const count = apps.filter((a) => a.status === s.value).length;
          if (!count) return null;
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => setFilter(s.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                filter === s.value
                  ? "bg-[#1e3a5f] text-white"
                  : "bg-[#f1f5f9] text-[#475569]"
              }`}
            >
              {s.label} ({count})
            </button>
          );
        })}
      </div>

      <ul className="space-y-3">
        {filtered.map((app) => (
          <li
            key={app.id}
            className="rounded-2xl border border-[#e6eaf2] bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-[#1e293b]">
                    {app.seeker?.name || "Candidate"}
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      STATUS_STYLE[app.status] || "bg-[#f1f5f9] text-[#475569]"
                    }`}
                  >
                    {app.statusLabel}
                  </span>
                </div>
                {app.seeker?.headline ? (
                  <p className="mt-1 text-sm text-[#475569]">
                    {app.seeker.headline}
                  </p>
                ) : null}
                <p className="mt-1 text-sm text-[#6b7a9e]">
                  Applied for{" "}
                  <span className="font-semibold text-[#1e293b]">
                    {app.job?.title || "Job"}
                  </span>
                  {app.job?.location ? ` · ${app.job.location}` : ""}
                </p>
                <p className="mt-1 text-xs text-[#94a3b8]">
                  {app.seeker?.email}
                  {app.seeker?.experienceLevel
                    ? ` · ${app.seeker.experienceLevel}`
                    : ""}
                  {app.seeker?.salaryExpectation
                    ? ` · ${app.seeker.salaryExpectation}`
                    : ""}
                </p>
                {app.seeker?.skills?.length ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {app.seeker.skills.slice(0, 8).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-[#f1f5f9] px-2 py-0.5 text-[11px] text-[#4a5878]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-3 text-sm">
                  {app.seeker?.resumeUrl ? (
                    <a
                      href={app.seeker.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-[#1e3a5f] hover:underline"
                    >
                      Resume <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                  {app.seeker?.linkedin ? (
                    <a
                      href={app.seeker.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-[#1e3a5f] hover:underline"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>{" "}
                      LinkedIn
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="shrink-0">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                  Update status
                </label>
                <select
                  value={app.status}
                  disabled={savingId === app.id}
                  onChange={(e) => void updateStatus(app.id, e.target.value)}
                  className="w-full min-w-[180px] rounded-lg border border-[#cdd3e0] bg-white px-3 py-2.5 text-sm font-medium text-[#1e293b] outline-none focus:border-[#1e3a5f] disabled:opacity-60"
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                {savingId === app.id ? (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-[#6b7a9e]">
                    <Loader2 className="h-3 w-3 animate-spin" /> Saving…
                  </p>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
