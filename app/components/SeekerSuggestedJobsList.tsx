"use client";

import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
} from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { Loader2, Sparkles, Briefcase, UserRound } from "lucide-react";
import { jobOffersVisaSponsorship } from "@/lib/visa-sponsorship";
import HomeJobDetailModal, {
  type HomeModalJob,
} from "@/app/components/HomeJobDetailModal";
import "@/app/jobs/jobs.css";

type SuggestedJob = {
  id: string;
  source?: string;
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
  description?: string;
  requirements?: string;
  responsibilities?: string;
  skills?: string[];
  applyUrl?: string;
  applied: boolean;
  applicationStatus: string | null;
  matchScore?: number;
  matchTier?: string;
  matchTitle?: string;
  matchedSkills?: string[];
  company: {
    name: string;
    logoUrl: string;
    location?: string;
    industry?: string;
    about?: string;
  } | null;
};

const TYPE_LABELS: Record<string, string> = {
  "full-time": "Full time",
  "part-time": "Part time",
  casual: "Casual",
  contract: "Contract",
};

const WORK_MODE_LABELS: Record<string, string> = {
  onsite: "Onsite",
  remote: "Remote",
  hybrid: "Hybrid",
};

const LEVEL_LABELS: Record<string, string> = {
  entry: "Entry Level",
  mid: "Mid Level",
  senior: "Senior",
};

const TAG_VARIANTS = [
  "jobs-tag--green",
  "jobs-tag--orange",
  "jobs-tag--purple",
  "jobs-tag--blue",
  "jobs-tag--slate",
] as const;

function tagVariant(index: number) {
  return TAG_VARIANTS[index % TAG_VARIANTS.length];
}

function formatSalary(job: SuggestedJob) {
  const min = Math.round(job.salaryMin || 0);
  const max = Math.round(job.salaryMax || 0);
  if (min <= 0 && max <= 0) return null;
  const currency = (job.salaryCurrency || "AUD").toUpperCase();
  const period = job.salaryPeriod ? ` / ${job.salaryPeriod}` : "";
  const lo = min > 0 ? min : max;
  const hi = max > 0 ? max : min;
  const fmt = (n: number) => n.toLocaleString("en-AU");
  if (lo === hi) return `${currency} ${fmt(lo)}${period}`;
  return `${currency} ${fmt(lo)}–${fmt(hi)}${period}`;
}

function snippet(text?: string, maxLen = 140) {
  const plain = (text || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length < 24) return null;
  if (plain.length <= maxLen) return plain;
  const cut = plain.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 60 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function toModalJob(job: SuggestedJob): HomeModalJob {
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
    source: job.source || "stella",
    applyUrl: job.applyUrl || "",
  };
}

export default function SeekerSuggestedJobsList() {
  const [loading, setLoading] = useState(true);
  const [hasSkills, setHasSkills] = useState(true);
  const [jobs, setJobs] = useState<SuggestedJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<HomeModalJob | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/seeker/suggested", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to load suggested jobs");
        return;
      }
      setHasSkills(data.hasSkills !== false);
      setJobs(data.jobs || []);
    } catch {
      toast.error("Failed to load suggested jobs");
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
        Finding roles that match your skills…
      </div>
    );
  }

  if (!hasSkills) {
    return (
      <div className="rounded-2xl border border-dashed border-[#cdd3e0] bg-white px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f1f5f9] text-[#64748b]">
          <UserRound className="h-7 w-7" />
        </div>
        <p className="text-lg font-bold text-[#1e293b]">Add skills first</p>
        <p className="mt-2 text-sm text-[#6b7a9e]">
          Suggested jobs are based on your profile skills. Add a few to unlock
          matches.
        </p>
        <Link
          href="/dashboard/seeker/profile"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1e3a5f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f2744]"
        >
          <UserRound className="h-4 w-4" />
          Complete profile
        </Link>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#cdd3e0] bg-white px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f1f5f9] text-[#64748b]">
          <Sparkles className="h-7 w-7" />
        </div>
        <p className="text-lg font-bold text-[#1e293b]">No matches yet</p>
        <p className="mt-2 text-sm text-[#6b7a9e]">
          We couldn&apos;t find open roles for your current skills. Browse all
          jobs or update your profile.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a5f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f2744]"
          >
            <Briefcase className="h-4 w-4" />
            Browse all jobs
          </Link>
          <Link
            href="/dashboard/seeker/profile"
            className="inline-flex items-center gap-2 rounded-xl border border-[#cdd3e0] bg-white px-4 py-2.5 text-sm font-semibold text-[#1e3a5f] hover:bg-[#f8fafc]"
          >
            Update skills
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="jobs-list"
        style={
          {
            "--jobs-primary": "#00082C",
            "--jobs-surface": "#ffffff",
            "--jobs-border": "#e6eaf2",
          } as CSSProperties
        }
      >
        {jobs.map((job) => {
          const companyName = job.company?.name || "Company";
          const title = job.title || "Job";
          const blurb = snippet(job.description);
          const tags = [
            TYPE_LABELS[job.employmentType] || job.employmentType,
            job.category && job.category !== "General" ? job.category : null,
            WORK_MODE_LABELS[job.workMode] || job.workMode,
          ].filter(Boolean) as string[];
          const level =
            LEVEL_LABELS[job.experienceLevel] || job.experienceLevel;
          const pay = formatSalary(job);
          const hasVisa = jobOffersVisaSponsorship({
            title,
            description: job.description,
            category: job.category,
          });
          const matchLabel =
            typeof job.matchScore === "number"
              ? `${job.matchScore}% match`
              : job.matchTitle || "Suggested";

          return (
            <article
              key={job.id}
              className="jobs-card"
              style={{ cursor: "default" }}
            >
              <div className="jobs-card-main">
                <div className="jobs-card-logo">
                  {job.company?.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={job.company.logoUrl}
                      alt={`${companyName} logo`}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    companyName.trim().charAt(0).toUpperCase() || "J"
                  )}
                </div>

                <div className="jobs-card-body">
                  <h3 className="jobs-card-title font-manrope">{title}</h3>
                  {blurb ? <p className="jobs-card-snippet">{blurb}</p> : null}
                  <div className="jobs-card-tags">
                    {hasVisa ? (
                      <span className="jobs-tag jobs-tag--visa">
                        Visa Sponsorship
                      </span>
                    ) : null}
                    {tags.map((tag, i) => (
                      <span
                        key={`${job.id}-${tag}`}
                        className={`jobs-tag ${tagVariant(i)}`}
                      >
                        {tag}
                      </span>
                    ))}
                    {level ? (
                      <span className={`jobs-tag ${tagVariant(tags.length)}`}>
                        {level}
                      </span>
                    ) : null}
                    {(job.matchedSkills || []).slice(0, 3).map((skill, i) => (
                      <span
                        key={`${job.id}-skill-${skill}`}
                        className={`jobs-tag ${tagVariant(tags.length + 1 + i)}`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="jobs-card-divider" aria-hidden="true" />

              <div className="jobs-card-meta jobs-card-location">
                <span className="jobs-card-meta-label">Location</span>
                <span className="jobs-card-meta-value">
                  {job.location || "Location not listed"}
                </span>
              </div>

              <div className="jobs-card-divider" aria-hidden="true" />

              <div className="jobs-card-meta jobs-card-pay">
                <span className="jobs-card-meta-label">Pay</span>
                <span
                  className={`jobs-card-meta-value${pay ? "" : " is-empty"}`}
                >
                  {pay || "Not listed"}
                </span>
              </div>

              <div className="jobs-card-divider" aria-hidden="true" />

              <div className="jobs-card-center">
                <span className="jobs-card-meta-label">Company</span>
                <span className="jobs-card-meta-value">{companyName}</span>
              </div>

              <div className="jobs-card-divider" aria-hidden="true" />

              <div className="jobs-card-actions">
                <span
                  className={`inline-flex items-center justify-center rounded-full border px-3 py-2 text-xs font-bold ${
                    job.applied
                      ? "border-[#a7f3d0] bg-[#d1fae5] text-[#065f46]"
                      : "border-[#bfdbfe] bg-[#dbeafe] text-[#1e40af]"
                  }`}
                >
                  {job.applied ? "Applied" : matchLabel}
                </span>
                <button
                  type="button"
                  className="jobs-apply-btn"
                  onClick={() => setSelectedJob(toModalJob(job))}
                >
                  View job
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <HomeJobDetailModal
        job={selectedJob}
        alreadyApplied={Boolean(
          selectedJob &&
            jobs.find((j) => j.id === selectedJob.id)?.applied,
        )}
        onApplied={(jobId) => {
          setJobs((prev) =>
            prev.map((j) =>
              j.id === jobId
                ? { ...j, applied: true, applicationStatus: "pending" }
                : j,
            ),
          );
        }}
        onClose={() => setSelectedJob(null)}
      />
    </>
  );
}
