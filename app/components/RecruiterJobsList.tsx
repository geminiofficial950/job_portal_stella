"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { Loader2, PlusCircle, Briefcase } from "lucide-react";
import RecruiterJobCard, {
  type RecruiterJobCardData,
} from "./RecruiterJobCard";

export default function RecruiterJobsList() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<RecruiterJobCardData[]>([]);
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
      <div className="mt-8 flex items-center gap-3 rounded-2xl border border-[#e8ecf3] bg-white p-6 text-[#64748b]">
        <Loader2 className="h-5 w-5 animate-spin text-[#1e3a5f]" />
        <span className="font-medium">Loading jobs…</span>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border-2 border-dashed border-[#e2e8f0] bg-[#f8fafc] px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ede9fe] text-[#1e3a5f]">
          <Briefcase className="h-8 w-8" />
        </div>
        <p className="text-lg font-bold text-[#0f172a]">No jobs posted yet</p>
        <p className="mt-2 text-sm text-[#64748b]">
          Create your first role to start receiving applications.
        </p>
        <Link
          href="/dashboard/recruiter/jobs/new"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1e3a5f] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0f2744]"
        >
          <PlusCircle className="h-4 w-4" />
          Post a job
        </Link>
      </div>
    );
  }

  return (
    <ul className="mt-8 space-y-3">
      {jobs.map((job) => (
        <li key={job.id}>
          <RecruiterJobCard
            job={job}
            onDelete={removeJob}
            deleting={busyId === job.id}
          />
        </li>
      ))}
    </ul>
  );
}
