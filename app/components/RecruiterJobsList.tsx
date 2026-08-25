"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { Loader2, PlusCircle, Trash2, Briefcase, MapPin, DollarSign } from "lucide-react";

type JobRow = {
  id: string;
  title: string;
  location: string;
  employmentType: string;
  status: string;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  salaryPeriod: string;
  createdAt: string | null;
};

function statusConfig(status: string) {
  if (status === "open")
    return {
      bg: "bg-gradient-to-r from-[#d1fae5] to-[#a7f3d0]",
      text: "text-[#065f46]",
      border: "border-[#6ee7b7]",
      dot: "bg-[#10b981]",
    };
  if (status === "draft")
    return {
      bg: "bg-gradient-to-r from-[#ede9fe] to-[#ddd6fe]",
      text: "text-[#4c1d95]",
      border: "border-[#a78bfa]",
      dot: "bg-[#b91c1c]",
    };
  if (status === "paused")
    return {
      bg: "bg-gradient-to-r from-[#fef3c7] to-[#fde68a]",
      text: "text-[#78350f]",
      border: "border-[#fcd34d]",
      dot: "bg-[#f59e0b]",
    };
  return {
    bg: "bg-gradient-to-r from-[#fee2e2] to-[#fecaca]",
    text: "text-[#991b1b]",
    border: "border-[#f87171]",
    dot: "bg-[#ef4444]",
  };
}

export default function RecruiterJobsList() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/jobs", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to load jobs");
        return;
      }
      setJobs(data.jobs || []);
    } catch {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function removeJob(id: string) {
    if (!confirm("Delete this job?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Delete failed");
        return;
      }
      toast.success("Job deleted");
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch {
      toast.error("Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="mt-8 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-white to-[#f8fafc] p-6 text-[#6b7a9e]">
        <Loader2 className="h-5 w-5 animate-spin text-[#dc2626]" />
        <span className="font-medium">Loading jobs…</span>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border-2 border-dashed border-[#fcd34d] bg-gradient-to-br from-[#fffbeb] to-[#fef3c7] px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f59e0b] to-[#fb923c] shadow-lg">
          <Briefcase className="h-8 w-8 text-white" />
        </div>
        <p className="text-lg font-bold text-[#78350f]">No jobs posted yet</p>
        <p className="mt-2 text-sm text-[#6b7a9e]">
          Create your first role to start receiving applications.
        </p>
        <Link
          href="/dashboard/recruiter/jobs/new"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#fb923c] px-5 py-3 text-sm font-bold text-white shadow-md hover:scale-105 transition-transform"
        >
          <PlusCircle className="h-4 w-4" />
          Post a job
        </Link>
      </div>
    );
  }

  return (
    <ul className="mt-8 space-y-3">
      {jobs.map((job) => {
        const sc = statusConfig(job.status);
        return (
          <li
            key={job.id}
            className="flex flex-col gap-3 rounded-2xl border border-[#e6eaf2] bg-white p-5 shadow-sm hover:shadow-md transition-shadow sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#1e293b] text-[15px]">{job.title}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6b7a9e]">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {job.location}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {job.employmentType}
                </span>
                <span className="inline-flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {job.salaryCurrency} {job.salaryMin.toLocaleString()}–{job.salaryMax.toLocaleString()}/{job.salaryPeriod}
                </span>
              </div>
              <span
                className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider ${sc.bg} ${sc.text} ${sc.border}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                {job.status}
              </span>
            </div>
            <button
              type="button"
              disabled={busyId === job.id}
              onClick={() => removeJob(job.id)}
              className="inline-flex items-center gap-1.5 self-start rounded-xl border border-[#fee2e2] bg-gradient-to-r from-[#fff5f5] to-[#fee2e2] px-3 py-2 text-sm font-semibold text-[#dc2626] hover:from-[#fee2e2] hover:to-[#fecaca] disabled:opacity-60 transition-all"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </li>
        );
      })}
    </ul>
  );
}
