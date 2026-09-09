"use client";

import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
} from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { Loader2, BookmarkX, Briefcase, Trash2 } from "lucide-react";
import { jobOffersVisaSponsorship } from "@/lib/visa-sponsorship";
import HomeJobDetailModal, {
  type HomeModalJob,
} from "@/app/components/HomeJobDetailModal";
import "@/app/jobs/jobs.css";

type SavedItem = {
  id: string;
  jobId: string;
  source: string;
  title: string;
  companyName: string;
  companyLogoUrl: string;
  location: string;
  employmentType: string;
  workMode: string;
  category: string;
  experienceLevel?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
  salaryPeriod?: string;
  applyUrl?: string;
  description?: string;
  createdAt: string | null;
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

function formatSalary(item: SavedItem) {
  const min = Math.round(item.salaryMin || 0);
  const max = Math.round(item.salaryMax || 0);
  if (min <= 0 && max <= 0) return null;
  const currency = (item.salaryCurrency || "AUD").toUpperCase();
  const period = item.salaryPeriod ? ` / ${item.salaryPeriod}` : "";
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

function savedToModalJob(item: SavedItem): HomeModalJob {
  return {
    id: item.jobId,
    title: item.title,
    company: item.companyName || "Company",
    companyLogoUrl: item.companyLogoUrl || "",
    location: item.location || "",
    employmentType: item.employmentType || "",
    workMode: item.workMode || "",
    category: item.category || "",
    experienceLevel: item.experienceLevel || "",
    salaryMin: item.salaryMin ?? null,
    salaryMax: item.salaryMax ?? null,
    salaryCurrency: item.salaryCurrency || "AUD",
    salaryPeriod: item.salaryPeriod || "",
    description: item.description || "",
    source: item.source || "board",
    applyUrl: item.applyUrl || "",
  };
}

export default function SeekerSavedJobsList() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<SavedItem[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<HomeModalJob | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/seeker/saved", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to load saved jobs");
        return;
      }
      setItems(data.saved || []);
    } catch {
      toast.error("Failed to load saved jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function removeSaved(item: SavedItem) {
    setRemovingId(item.id);
    try {
      const res = await fetch(
        `/api/seeker/saved?jobId=${encodeURIComponent(item.jobId)}&source=${encodeURIComponent(item.source || "board")}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Could not remove");
        return;
      }
      setItems((prev) => prev.filter((x) => x.id !== item.id));
      if (selectedJob?.id === item.jobId) setSelectedJob(null);
      toast.success("Removed from saved");
    } catch {
      toast.error("Could not remove");
    } finally {
      setRemovingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-[#6b7a9e]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading saved jobs…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#cdd3e0] bg-white px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f1f5f9] text-[#64748b]">
          <BookmarkX className="h-7 w-7" />
        </div>
        <p className="text-lg font-bold text-[#1e293b]">No saved jobs</p>
        <p className="mt-2 text-sm text-[#6b7a9e]">
          Bookmark roles from Find Jobs and they&apos;ll land here.
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
        {items.map((item) => {
          const companyName = item.companyName || "Company";
          const title = item.title || "Job";
          const blurb = snippet(item.description);
          const tags = [
            TYPE_LABELS[item.employmentType] || item.employmentType,
            item.category && item.category !== "General" ? item.category : null,
            WORK_MODE_LABELS[item.workMode] || item.workMode,
          ].filter(Boolean) as string[];
          const level =
            LEVEL_LABELS[item.experienceLevel || ""] || item.experienceLevel;
          const pay = formatSalary(item);
          const hasVisa = jobOffersVisaSponsorship({
            title,
            description: item.description,
            category: item.category,
          });
          const removing = removingId === item.id;

          return (
            <article
              key={item.id}
              className="jobs-card"
              style={{ cursor: "default" }}
            >
              <div className="jobs-card-main">
                <div className="jobs-card-logo">
                  {item.companyLogoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.companyLogoUrl}
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
                        key={`${item.id}-${tag}`}
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
                  {item.createdAt ? (
                    <p className="mt-2 text-xs text-[#94a3b8]">
                      Saved{" "}
                      {new Date(item.createdAt).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="jobs-card-divider" aria-hidden="true" />

              <div className="jobs-card-meta jobs-card-location">
                <span className="jobs-card-meta-label">Location</span>
                <span className="jobs-card-meta-value">
                  {item.location || "Location not listed"}
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
                <div className="flex items-stretch gap-2">
                  <span className="inline-flex flex-1 items-center justify-center rounded-full border border-[#fbcfe8] bg-[#fdf2f8] px-3 py-2 text-xs font-bold text-[#9d174d]">
                    Saved
                  </span>
                  <button
                    type="button"
                    disabled={removing}
                    onClick={() => void removeSaved(item)}
                    title="Remove"
                    aria-label="Remove saved job"
                    className="inline-flex shrink-0 items-center justify-center rounded-full border border-[#fecdd3] bg-[#fff1f2] px-2.5 text-[#9f1239] hover:bg-[#ffe4e6] disabled:opacity-60"
                  >
                    {removing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <button
                  type="button"
                  className="jobs-apply-btn"
                  onClick={() => setSelectedJob(savedToModalJob(item))}
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
      />
    </>
  );
}
