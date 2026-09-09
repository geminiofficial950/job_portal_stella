"use client";

import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
} from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { Loader2, Inbox, Briefcase } from "lucide-react";
import { jobOffersVisaSponsorship } from "@/lib/visa-sponsorship";
import HomeJobDetailModal, {
  type HomeModalJob,
} from "@/app/components/HomeJobDetailModal";
import "@/app/jobs/jobs.css";

type AppItem = {
  id: string;
  kind?: "stella" | "board";
  jobId?: string;
  externalKey?: string;
  source?: string;
  listingUrl?: string;
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
    salaryMin?: number | null;
    salaryMax?: number | null;
    salaryCurrency?: string;
    salaryPeriod?: string;
    experienceLevel?: string;
    description?: string;
    requirements?: string;
    responsibilities?: string;
    skills?: string[];
  } | null;
  company: { name: string; logoUrl: string; about?: string } | null;
};

function appToModalJob(app: AppItem): HomeModalJob | null {
  const job = app.job;
  if (!job?.title) return null;

  const source = app.source || (app.kind === "board" ? "board" : "stella");
  let id = "";
  if (app.kind === "stella" || app.jobId) {
    id = String(app.jobId || "").trim();
  } else if (app.externalKey) {
    const prefix = `${source}:`;
    id = app.externalKey.startsWith(prefix)
      ? app.externalKey.slice(prefix.length)
      : app.externalKey;
  }
  if (!id) id = app.id;

  return {
    id,
    title: job.title,
    company: app.company?.name || "Company",
    companyLogoUrl: app.company?.logoUrl || "",
    companyAbout: app.company?.about || "",
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
    source,
    applyUrl: app.listingUrl || "",
  };
}

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-[#fef3c7] text-[#92400e] border-[#fde68a]",
  reviewing: "bg-[#dbeafe] text-[#1e40af] border-[#bfdbfe]",
  shortlisted: "bg-[#d1fae5] text-[#065f46] border-[#a7f3d0]",
  rejected: "bg-[#fee2e2] text-[#991b1b] border-[#fecaca]",
  hired: "bg-[#ede9fe] text-[#5b21b6] border-[#ddd6fe]",
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

function formatSalary(job: AppItem["job"]) {
  if (!job) return null;
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

export default function SeekerApplicationsList() {
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<AppItem[]>([]);
  const [selectedJob, setSelectedJob] = useState<HomeModalJob | null>(null);

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
          href="/jobs"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1e3a5f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f2744]"
        >
          <Briefcase className="h-4 w-4" />
          Find jobs
        </Link>
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
        {apps.map((app) => {
          const companyName = app.company?.name || "Company";
          const job = app.job;
          const title = job?.title || "Job";
          const blurb = snippet(job?.description);
          const tags = [
            TYPE_LABELS[job?.employmentType || ""] || job?.employmentType,
            job?.category && job.category !== "General" ? job.category : null,
            WORK_MODE_LABELS[job?.workMode || ""] || job?.workMode,
          ].filter(Boolean) as string[];
          const level =
            LEVEL_LABELS[job?.experienceLevel || ""] || job?.experienceLevel;
          const pay = formatSalary(job);
          const hasVisa = jobOffersVisaSponsorship({
            title,
            description: job?.description,
            category: job?.category,
          });

          return (
            <article
              key={app.id}
              className="jobs-card"
              style={{ cursor: "default" }}
            >
              <div className="jobs-card-main">
                <div className="jobs-card-logo">
                  {app.company?.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={app.company.logoUrl}
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
                        key={`${app.id}-${tag}`}
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
                  </div>
                  {app.createdAt ? (
                    <p className="mt-2 text-xs text-[#94a3b8]">
                      Applied{" "}
                      {new Date(app.createdAt).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  ) : null}
                  {app.statusNote ? (
                    <p className="mt-1 text-sm text-[#475569]">
                      Note: {app.statusNote}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="jobs-card-divider" aria-hidden="true" />

              <div className="jobs-card-meta jobs-card-location">
                <span className="jobs-card-meta-label">Location</span>
                <span className="jobs-card-meta-value">
                  {job?.location || "Location not listed"}
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
                    STATUS_STYLE[app.status] ||
                    "border-[#e2e8f0] bg-[#f8fafc] text-[#475569]"
                  }`}
                >
                  {app.statusLabel}
                </span>
                <button
                  type="button"
                  className="jobs-apply-btn"
                  onClick={() => {
                    void (async () => {
                      const modalJob = appToModalJob(app);
                      if (!modalJob) {
                        toast.error("Job details unavailable");
                        return;
                      }

                      // Backfill description from Saved Jobs when older applications lack it.
                      if (!(modalJob.description || "").trim()) {
                        try {
                          const res = await fetch("/api/seeker/saved", {
                            cache: "no-store",
                          });
                          const data = await res.json();
                          if (res.ok && data.success && Array.isArray(data.saved)) {
                            const match = data.saved.find(
                              (s: {
                                jobId?: string;
                                externalKey?: string;
                                description?: string;
                                companyLogoUrl?: string;
                                applyUrl?: string;
                                experienceLevel?: string;
                                salaryMin?: number | null;
                                salaryMax?: number | null;
                                salaryCurrency?: string;
                                salaryPeriod?: string;
                              }) =>
                                s.jobId === modalJob.id ||
                                s.externalKey === app.externalKey,
                            );
                            if (match) {
                              Object.assign(modalJob, {
                                description:
                                  match.description || modalJob.description,
                                companyLogoUrl:
                                  match.companyLogoUrl ||
                                  modalJob.companyLogoUrl,
                                applyUrl:
                                  match.applyUrl || modalJob.applyUrl,
                                experienceLevel:
                                  match.experienceLevel ||
                                  modalJob.experienceLevel,
                                salaryMin:
                                  match.salaryMin ?? modalJob.salaryMin,
                                salaryMax:
                                  match.salaryMax ?? modalJob.salaryMax,
                                salaryCurrency:
                                  match.salaryCurrency ||
                                  modalJob.salaryCurrency,
                                salaryPeriod:
                                  match.salaryPeriod ||
                                  modalJob.salaryPeriod,
                              });
                            }
                          }
                        } catch {
                          /* keep sparse modal job */
                        }
                      }

                      setSelectedJob({ ...modalJob });
                    })();
                  }}
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
        onClose={() => setSelectedJob(null)}
        alreadyApplied
      />
    </>
  );
}
