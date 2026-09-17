"use client";

import ApplyWithCoverLetter from "./ApplyWithCoverLetter";

import styles from "@/app/dashboard/seeker/seeker.module.css";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Loader2, MapPin, Search, Check } from "lucide-react";

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
  applied: boolean;
  applicationStatus: string | null;
  company: {
    name: string;
    logoUrl: string;
    location: string;
    industry: string;
  } | null;
};

function SeekerJobsListInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const matchedMode = searchParams.get("matched") === "1";
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
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

  async function applyToJob(jobId: string, coverNote: string) {
    setApplyingId(jobId);
    try {
      const res = await fetch("/api/seeker/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, coverNote }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Could not apply");
        if (
          typeof data.message === "string" &&
          data.message.toLowerCase().includes("profile")
        ) {
          setTimeout(() => router.push("/dashboard/seeker/profile"), 1200);
        }
        return;
      }
      toast.success("Applied successfully");
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? { ...j, applied: true, applicationStatus: "pending" }
            : j
        )
      );
      return true;
    } catch {
      toast.error("Could not apply");
    } finally {
      setApplyingId(null);
    }
  }

  return (
    <div>
      {matchedMode ? (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#2d4463] bg-[#19283e] px-4 py-3 text-sm text-[#8ab4ff]">
          <Check className="h-4 w-4 shrink-0" />
          Showing jobs that match your profile skills.
        </div>
      ) : null}

      <div className={`${styles.searchBar} grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]`}>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#a1b0c7]" />
          <input
            value={q}
            onChange={(e) => {
              setLoading(true);
              setQ(e.target.value);
            }}
            placeholder="Title, skill, category..."
            className="w-full rounded-lg border border-[#2d4463] bg-[#131d30] py-2.5 pr-3 pl-9 text-sm outline-none focus:border-[#2d4463]"
          />
        </div>
        <div className="relative">
          <MapPin className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#a1b0c7]" />
          <input
            value={location}
            onChange={(e) => {
              setLoading(true);
              setLocation(e.target.value);
            }}
            placeholder="Location"
            className="w-full rounded-lg border border-[#2d4463] bg-[#131d30] py-2.5 pr-3 pl-9 text-sm outline-none focus:border-[#2d4463]"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            void load();
          }}
          className={`${styles.formButton} rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white`}
        >
          Search
        </button>
      </div>

      {loading ? (
        <div className={`${styles.loadingState} mt-8 flex items-center gap-2 text-[#a1b0c7]`}>
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading jobs…
        </div>
      ) : jobs.length === 0 ? (
        <div className={`${styles.emptyState} mt-8 rounded-2xl border border-dashed border-[#2d4463] bg-[#131d30] px-6 py-16 text-center`}>
          <p className="font-semibold text-[#e5edf9]">
            {matchedMode ? "No skill matches right now" : "No open jobs yet"}
          </p>
          <p className="mt-2 text-sm text-[#a1b0c7]">
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
              className={`${styles.surface} rounded-2xl border border-[#2d4463] bg-[#131d30] p-5`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  {job.company?.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={job.company.logoUrl}
                      alt=""
                      className="h-12 w-12 rounded-xl border border-[#2d4463] object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#19283e] text-sm font-semibold text-[#e5edf9]">
                      {(job.company?.name || "J").slice(0, 1)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-[#e5edf9]">{job.title}</p>
                    <p className="mt-1 text-sm text-[#a1b0c7]">
                      {job.company?.name || "Company"} · {job.location} ·{" "}
                      {job.employmentType} · {job.workMode}
                    </p>
                    <p className="mt-1 text-sm text-[#a1b0c7]">
                      {job.salaryCurrency} {job.salaryMin}–{job.salaryMax}/
                      {job.salaryPeriod} · {job.experienceLevel} ·{" "}
                      {job.category}
                    </p>
                    {job.skills?.length ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {job.skills.slice(0, 6).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-[#19283e] px-2.5 py-0.5 text-xs text-[#a1b0c7]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
                {job.applied ? (
                  <Link
                    href="/dashboard/seeker/applications"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#2d4463] bg-[#19283e] px-3.5 py-2 text-sm font-semibold text-[#8ab4ff]"
                  >
                    <Check className="h-4 w-4" />
                    Applied
                  </Link>
                ) : (
                  <ApplyWithCoverLetter
                    jobId={job.id}
                    jobTitle={job.title}
                    jobSkills={job.skills}
                    company={job.company?.name}
                    disabled={applyingId === job.id}
                    onSubmit={(coverNote) => applyToJob(job.id, coverNote)}
                    className={`${styles.formButton} shrink-0 rounded-lg bg-[#2563eb] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#2563eb] disabled:opacity-60`}
                  />
                )}
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
        <div className={`${styles.loadingState} mt-8 flex items-center gap-2 text-[#a1b0c7]`}>
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading jobs…
        </div>
      }
    >
      <SeekerJobsListInner />
    </Suspense>
  );
}
