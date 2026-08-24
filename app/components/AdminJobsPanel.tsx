"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Loader2, Search } from "lucide-react";

type AdminJob = {
  id: string;
  title: string;
  location: string;
  category: string;
  employmentType: string;
  status: string;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  salaryPeriod: string;
  vacancies: number;
  createdAt: string | null;
  recruiter: { name: string; email: string } | null;
  company: { name: string; status: string } | null;
};

export default function AdminJobsPanel() {
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (status) params.set("status", status);
      const res = await fetch(`/api/admin/jobs?${params.toString()}`, {
        cache: "no-store",
      });
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
  }, [q, status]);

  useEffect(() => {
    const t = setTimeout(() => {
      void load();
    }, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function updateStatus(jobId: string, next: string) {
    setBusyId(jobId);
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, status: next }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Update failed");
        return;
      }
      toast.success("Job status updated");
      await load();
    } catch {
      toast.error("Update failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-medium tracking-[-0.04em]">Jobs</h1>
          <p className="mt-2 text-[#6b7a9e]">
            Every job on the platform — filter, search, and change status.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#6b7a9e]" />
            <input
              value={q}
              onChange={(e) => {
                setLoading(true);
                setQ(e.target.value);
              }}
              placeholder="Search title, location..."
              className="w-full rounded-lg border border-[#cdd3e0] bg-white py-2.5 pr-3 pl-9 text-sm outline-none focus:border-[#dc2626]"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setLoading(true);
              setStatus(e.target.value);
            }}
            className="rounded-lg border border-[#cdd3e0] bg-white px-3 py-2.5 text-sm"
          >
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="draft">Draft</option>
            <option value="paused">Paused</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-[#6b7a9e]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading jobs…
        </div>
      ) : jobs.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[#cdd3e0] bg-white px-6 py-12 text-center text-[#6b7a9e]">
          No jobs found.
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="rounded-2xl border border-[#e6eaf2] bg-white p-5"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="font-semibold text-[#b91c1c]">{job.title}</p>
                  <p className="mt-1 text-sm text-[#6b7a9e]">
                    {job.location} · {job.category} · {job.employmentType} ·{" "}
                    {job.salaryCurrency} {job.salaryMin}-{job.salaryMax}/
                    {job.salaryPeriod} · {job.vacancies} vacancies
                  </p>
                  <p className="mt-1 text-sm text-[#6b7a9e]">
                    Recruiter: {job.recruiter?.name || "—"} (
                    {job.recruiter?.email || "—"})
                  </p>
                  <p className="mt-0.5 text-sm text-[#6b7a9e]">
                    Company: {job.company?.name || "—"} (
                    {job.company?.status || "—"})
                  </p>
                </div>
                <select
                  disabled={busyId === job.id}
                  value={job.status}
                  onChange={(e) => updateStatus(job.id, e.target.value)}
                  className="rounded-lg border border-[#cdd3e0] bg-white px-3 py-2 text-sm font-medium disabled:opacity-60"
                >
                  <option value="open">open</option>
                  <option value="draft">draft</option>
                  <option value="paused">paused</option>
                  <option value="closed">closed</option>
                </select>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
