"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { Loader2, MapPin, Search, Sparkles } from "lucide-react";

type SeekerJob = {
  id: string;
  title: string;
  location: string;
  category: string;
  employmentType: string;
  workMode: string;
  experienceLevel: string;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  salaryPeriod: string;
  skills: string[];
  company: {
    name: string;
    logoUrl: string;
    location: string;
    industry: string;
  } | null;
};

function SeekerJobsListInner() {
  const searchParams = useSearchParams();
  const matchedMode = searchParams.get("matched") === "1";
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState<SeekerJob[]>([]);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (location.trim()) params.set("location", location.trim());
      if (matchedMode) params.set("matched", "1");
      const res = await fetch(`/api/seeker/jobs?${params.toString()}`, {
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
  }, [q, location, matchedMode]);

  useEffect(() => {
    const t = setTimeout(() => {
      void load();
    }, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div>
      {matchedMode ? (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#fecaca] bg-[#f1f5f9] px-4 py-3 text-sm text-[#991b1b]">
          <Sparkles className="h-4 w-4 shrink-0 text-[#dc2626]" />
          Showing jobs that match your profile skills.
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#6b7a9e]" />
          <input
            value={q}
            onChange={(e) => {
              setLoading(true);
              setQ(e.target.value);
            }}
            placeholder="Title, skill, category..."
            className="w-full rounded-lg border border-[#cdd3e0] bg-white py-2.5 pr-3 pl-9 text-sm outline-none focus:border-[#dc2626]"
          />
        </div>
        <div className="relative">
          <MapPin className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#6b7a9e]" />
          <input
            value={location}
            onChange={(e) => {
              setLoading(true);
              setLocation(e.target.value);
            }}
            placeholder="Location"
            className="w-full rounded-lg border border-[#cdd3e0] bg-white py-2.5 pr-3 pl-9 text-sm outline-none focus:border-[#dc2626]"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            void load();
          }}
          className="rounded-lg bg-[#b91c1c] px-4 py-2.5 text-sm font-semibold text-white"
        >
          Search
        </button>
      </div>

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-[#6b7a9e]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading jobs…
        </div>
      ) : jobs.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[#cdd3e0] bg-white px-6 py-16 text-center">
          <p className="font-semibold text-[#1e293b]">
            {matchedMode ? "No skill matches right now" : "No open jobs yet"}
          </p>
          <p className="mt-2 text-sm text-[#6b7a9e]">
            {matchedMode
              ? "Add more skills to your profile or browse all open roles."
              : "Check back soon — approved employers post roles here."}
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="rounded-2xl border border-[#e6eaf2] bg-white p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  {job.company?.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={job.company.logoUrl}
                      alt=""
                      className="h-12 w-12 rounded-xl border border-[#e6eaf2] object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f1f5f9] text-sm font-semibold text-[#1e293b]">
                      {(job.company?.name || "J").slice(0, 1)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-[#1e293b]">{job.title}</p>
                    <p className="mt-1 text-sm text-[#6b7a9e]">
                      {job.company?.name || "Company"} · {job.location} ·{" "}
                      {job.employmentType} · {job.workMode}
                    </p>
                    <p className="mt-1 text-sm text-[#4a5878]">
                      {job.salaryCurrency} {job.salaryMin}–{job.salaryMax}/
                      {job.salaryPeriod} · {job.experienceLevel} ·{" "}
                      {job.category}
                    </p>
                    {job.skills?.length ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {job.skills.slice(0, 6).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-[#f1f5f9] px-2.5 py-0.5 text-xs text-[#4a5878]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    toast.info("Applications coming next — profile ready pehle.")
                  }
                  className="shrink-0 rounded-lg bg-[#dc2626] px-3.5 py-2 text-sm font-semibold text-white"
                >
                  Apply soon
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function SeekerJobsList() {
  return (
    <Suspense
      fallback={
        <div className="mt-8 flex items-center gap-2 text-[#6b7a9e]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading jobs…
        </div>
      }
    >
      <SeekerJobsListInner />
    </Suspense>
  );
}
