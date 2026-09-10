"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import HomeJobDetailModal, {
  type HomeModalJob,
} from "@/app/components/HomeJobDetailModal";

type FeaturedJob = {
  id: string;
  title: string;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  location: string;
  category?: string;
  employmentType: string;
  workMode?: string;
  experienceLevel?: string;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  salaryPeriod: string;
  skills?: string[];
  createdAt: string | null;
  source?: string;
  applyUrl?: string;
  adref?: string;
  countryLabel?: string;
  company: {
    name: string;
    logoUrl: string;
    about?: string;
  } | null;
};

const TYPE_LABELS: Record<string, string> = {
  "full-time": "Full time",
  "part-time": "Part time",
  casual: "Casual",
  contract: "Contract",
};

const FEATURED_LIMIT = 5;

function hasSalary(job: FeaturedJob) {
  return job.salaryMin > 0 || job.salaryMax > 0;
}

function timeAgo(iso: string | null) {
  if (!iso) return "Recently";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(mins, 1)} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString();
}

function companyInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "J";
}

function toModalJob(job: FeaturedJob): HomeModalJob {
  return {
    id: job.id,
    title: job.title,
    company: job.company?.name || "Company",
    companyLogoUrl: job.company?.logoUrl || "",
    companyAbout: job.company?.about || "",
    location: job.location || "",
    employmentType: job.employmentType || "",
    workMode: job.workMode || "",
    category: job.category || "",
    experienceLevel: job.experienceLevel || "",
    salaryMin: job.salaryMin ?? null,
    salaryMax: job.salaryMax ?? null,
    salaryCurrency: job.salaryCurrency || "AUD",
    salaryPeriod: job.salaryPeriod || "",
    description: job.description || "",
    requirements: job.requirements || "",
    responsibilities: job.responsibilities || "",
    skills: Array.isArray(job.skills) ? job.skills : [],
    source: job.source || "board",
    applyUrl: job.applyUrl || "",
    adref: job.adref || "",
    countryLabel: job.countryLabel || "Australia",
    createdAt: job.createdAt,
  };
}

export default function FeaturedJobsSection() {
  const [jobs, setJobs] = useState<FeaturedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<HomeModalJob | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/jobs/browse?country=au&fast=1");
        if (!res.ok) throw new Error("Failed to load jobs");
        const data = (await res.json()) as { jobs?: FeaturedJob[] };
        const paidAu = (data.jobs || [])
          .filter((job) => hasSalary(job))
          .slice(0, FEATURED_LIMIT);

        if (!cancelled) setJobs(paidAu);
      } catch {
        if (!cancelled) setJobs([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="featured-jobs-section w-full bg-[#f4f7fb]">
      <div className="mx-auto max-w-[1450px] px-5 py-7 sm:px-8 sm:py-8 lg:px-12 lg:py-9">
        <div className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
            <h2 className="text-[1.45rem] font-bold tracking-tight text-[#0a1628] sm:text-[1.65rem]">
              Featured Jobs
            </h2>
            <p className="text-[13px] font-medium text-slate-500 sm:text-[14px]">
              Latest opportunities from top employers across Australia.
            </p>
          </div>
          <Link
            href="/jobs?country=au"
            className="shrink-0 text-[13.5px] font-semibold text-[#3b59ff] transition hover:text-[#2f4ae6]"
          >
            View all jobs →
          </Link>
        </div>

        {loading ? (
          <div className="featured-jobs-row flex gap-3 overflow-x-auto pb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-[196px] min-w-[220px] flex-1 animate-pulse rounded-xl border-0 bg-white/80"
              />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-xl border border-slate-200/60 bg-white px-5 py-8 text-center text-sm text-slate-500">
            No paid Australian roles to feature right now.{" "}
            <Link href="/jobs?country=au" className="font-semibold text-[#3b59ff]">
              Browse all jobs
            </Link>
          </div>
        ) : (
          <div className="featured-jobs-row flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:overflow-visible [&::-webkit-scrollbar]:hidden">
            {jobs.map((job) => {
              const companyName = job.company?.name || "Employer";
              const typeLabel =
                TYPE_LABELS[job.employmentType] ||
                job.employmentType ||
                "Role";

              return (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => setSelectedJob(toModalJob(job))}
                  className="featured-job-card flex min-h-[196px] w-[min(78vw,260px)] shrink-0 flex-col rounded-xl border-0 bg-white p-4 text-left outline-none focus:outline-none focus-visible:outline-none sm:w-[240px] lg:w-auto lg:min-w-0 lg:flex-1"
                >
                  <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-slate-50 text-[13px] font-bold text-slate-600">
                    {job.company?.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={job.company.logoUrl}
                        alt=""
                        className="h-full w-full object-contain p-0.5"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      companyInitial(companyName)
                    )}
                  </span>

                  <h3 className="mt-3 line-clamp-2 text-[15px] font-bold leading-snug tracking-tight text-[#0b1b3a]">
                    {job.title}
                  </h3>
                  <p className="mt-1 truncate text-[13px] font-medium text-slate-500">
                    {companyName}
                  </p>

                  <p className="mt-3 flex items-center gap-1.5 text-[13px] font-medium text-slate-500">
                    <MapPin
                      className="h-3.5 w-3.5 shrink-0 text-slate-400"
                      strokeWidth={2.2}
                    />
                    <span className="truncate">
                      {job.location || "Australia"}
                    </span>
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-2 pt-5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11.5px] font-semibold text-slate-600">
                      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-slate-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                      </span>
                      {typeLabel}
                    </span>
                    <span className="shrink-0 text-[12px] font-medium text-slate-400">
                      {timeAgo(job.createdAt)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <HomeJobDetailModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
      />
    </section>
  );
}
