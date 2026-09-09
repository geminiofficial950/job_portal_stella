"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  X,
  MapPin,
  Building2,
  Clock,
  Banknote,
  Bookmark,
  Loader2,
} from "lucide-react";
import { useAuth } from "./AuthProvider";
import { useAuthModal } from "./AuthModalProvider";
import {
  formatAdzunaDescriptionPreview,
} from "@/lib/adzuna-description";
import { normalizeJobDescriptionHtml } from "@/lib/job-description-html";
import {
  rateSkillMatch,
  type SkillMatchResult,
  type SkillMatchTier,
} from "@/lib/skill-match";
import "@/app/jobs/jobs.css";

export type HomeModalJob = {
  id: string;
  title: string;
  company?: string;
  companyLogoUrl?: string;
  companyAbout?: string;
  location?: string;
  employmentType?: string;
  workMode?: string;
  category?: string;
  experienceLevel?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
  salaryPeriod?: string;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  skills?: string[];
  source?: string;
  applyUrl?: string;
  adref?: string;
  countryLabel?: string;
  createdAt?: string | null;
};

const WORK_MODE_LABELS: Record<string, string> = {
  onsite: "Onsite",
  remote: "Remote",
  hybrid: "Hybrid",
};

const TYPE_LABELS: Record<string, string> = {
  "full-time": "Full time",
  "part-time": "Part time",
  casual: "Casual",
  contract: "Contract",
};

const LEVEL_LABELS: Record<string, string> = {
  entry: "Entry Level",
  mid: "Mid Level",
  senior: "Senior",
};

function formatSalaryDetail(job: HomeModalJob): string | null {
  const min = Math.round(job.salaryMin || 0);
  const max = Math.round(job.salaryMax || 0);
  if (min <= 0 && max <= 0) return null;

  const periodWords: Record<string, string> = {
    hour: "per hour",
    day: "per day",
    week: "per week",
    year: "per year",
  };
  const period =
    periodWords[job.salaryPeriod || ""] ||
    `per ${job.salaryPeriod || "year"}`;
  const lo = min > 0 ? min : max;
  const hi = max > 0 ? max : min;
  const fmt = (n: number) => `$${n.toLocaleString()}`;

  if (lo === hi) return `${fmt(lo)} ${period}`;
  return `${fmt(lo)} – ${fmt(hi)} ${period}`;
}

function looksLikeHtml(text: string) {
  return /<\/?[a-z][\s\S]*>/i.test(text);
}

function timeAgo(iso: string | null | undefined) {
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

function CompanyLogo({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl: string;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "J";
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={`${name} logo`}
        loading="lazy"
        decoding="async"
        className="h-12 w-12 shrink-0 rounded-2xl border border-slate-100 bg-white object-cover shadow-xs"
      />
    );
  }
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-900 text-base font-black text-white shadow-xs">
      {initial}
    </div>
  );
}

function skillMatchTierClass(tier: SkillMatchTier): string {
  return `job-skill-match job-skill-match--${tier}`;
}

function SkillMatchCard({
  match,
  signedIn,
  hasProfileSkills,
  loading,
  onSignIn,
}: {
  match: SkillMatchResult | null;
  signedIn: boolean;
  hasProfileSkills: boolean;
  loading: boolean;
  onSignIn?: () => void;
}) {
  return (
    <section
      className="job-skill-match-wrap"
      aria-label="Job 2 Skill Match Rating"
    >
      <p className="job-skill-match-kicker">Job 2 Skill Match Rating</p>

      {loading ? (
        <div className="job-skill-match job-skill-match--loading">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking your skill match…
        </div>
      ) : !signedIn ? (
        <div className="job-skill-match job-skill-match--locked">
          <p className="job-skill-match-title">Sign in to see your match</p>
          <p className="job-skill-match-desc">
            See how this role rates against your profile skills.
          </p>
          <button
            type="button"
            className="job-skill-match-cta"
            onClick={onSignIn}
          >
            Sign in as job seeker
          </button>
        </div>
      ) : !hasProfileSkills ? (
        <div className="job-skill-match job-skill-match--locked">
          <p className="job-skill-match-title">Add skills to unlock rating</p>
          <p className="job-skill-match-desc">
            Add skills on your profile to get a match rating for this job.
          </p>
          <Link
            href="/dashboard/seeker/profile"
            className="job-skill-match-cta"
          >
            Edit profile skills
          </Link>
        </div>
      ) : match ? (
        <div className={skillMatchTierClass(match.tier)}>
          <div className="job-skill-match-body">
            <div className="job-skill-match-main">
              <div
                className={`job-skill-match-ring job-skill-match-ring--${match.tier}`}
                style={
                  {
                    "--match-pct": `${match.score}`,
                  } as React.CSSProperties
                }
                aria-label={`${match.score}% match`}
              >
                <span className="job-skill-match-ring-value">
                  {match.score}%
                </span>
              </div>

              <div className="job-skill-match-copy">
                <span
                  className={`job-skill-match-badge job-skill-match-badge--${match.tier}`}
                >
                  {match.title}
                </span>
                <p className="job-skill-match-desc">{match.description}</p>
              </div>
            </div>

            {(match.matchedSkills.length > 0 ||
              match.missingSkills.length > 0) && (
              <div className="job-skill-match-tags">
                {match.matchedSkills.length > 0 ? (
                  <div className="job-skill-match-tags-group">
                    <p className="job-skill-match-tags-label">You have</p>
                    <div className="job-skill-match-tags-row">
                      {match.matchedSkills.slice(0, 6).map((skill) => (
                        <span
                          key={`m-${skill}`}
                          className="job-skill-match-tag is-matched"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {match.missingSkills.length > 0 ? (
                  <div className="job-skill-match-tags-group">
                    <p className="job-skill-match-tags-label">
                      Missing for this role
                    </p>
                    <div className="job-skill-match-tags-row">
                      {match.missingSkills.slice(0, 6).map((skill) => (
                        <span
                          key={`x-${skill}`}
                          className="job-skill-match-tag is-missing"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function renderJobDescription(job: HomeModalJob) {
  const raw = job.description || "";
  if (!raw) return null;

  if (job.source === "adzuna") {
    const preview = formatAdzunaDescriptionPreview(raw);
    if (looksLikeHtml(raw)) {
      return (
        <div
          className="job-detail-prose"
          dangerouslySetInnerHTML={{
            __html: normalizeJobDescriptionHtml(raw),
          }}
        />
      );
    }
    return (
      <div
        className="job-detail-prose"
        dangerouslySetInnerHTML={{
          __html: normalizeJobDescriptionHtml(preview),
        }}
      />
    );
  }

  return (
    <div
      className="job-detail-prose"
      dangerouslySetInnerHTML={{
        __html: normalizeJobDescriptionHtml(raw),
      }}
    />
  );
}

type Props = {
  job: HomeModalJob | null;
  onClose: () => void;
};

export default function HomeJobDetailModal({ job, onClose }: Props) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { openAuth } = useAuthModal();
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [applying, setApplying] = useState(false);
  const [profileSkills, setProfileSkills] = useState<string[]>([]);
  const [profileSkillsLoaded, setProfileSkillsLoaded] = useState(false);
  const [enrichedJob, setEnrichedJob] = useState<HomeModalJob | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [descriptionIsPreview, setDescriptionIsPreview] = useState(false);
  const [descriptionHtml, setDescriptionHtml] = useState("");

  const displayJob = enrichedJob || job;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setApplying(false);
  }, [job?.id]);

  useEffect(() => {
    if (!job) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [job, onClose]);

  useEffect(() => {
    setSaved(false);
    setEnrichedJob(null);
    setDescriptionHtml("");
    setDescriptionIsPreview(false);
  }, [job?.id]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "user") {
      setProfileSkills([]);
      setProfileSkillsLoaded(true);
      return;
    }

    let cancelled = false;
    setProfileSkillsLoaded(false);
    fetch("/api/seeker/profile", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const skills = Array.isArray(data?.profile?.skills)
          ? data.profile.skills
              .map((s: unknown) => String(s).trim())
              .filter(Boolean)
          : [];
        setProfileSkills(skills);
      })
      .catch(() => {
        if (!cancelled) setProfileSkills([]);
      })
      .finally(() => {
        if (!cancelled) setProfileSkillsLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  useEffect(() => {
    if (!job || job.source !== "adzuna") {
      setEnrichedJob(null);
      setDetailLoading(false);
      setDescriptionIsPreview(false);
      setDescriptionHtml("");
      return;
    }

    if (!job.applyUrl) {
      setEnrichedJob(null);
      setDetailLoading(false);
      setDescriptionIsPreview(true);
      setDescriptionHtml("");
      return;
    }

    let cancelled = false;
    setEnrichedJob(null);
    setDetailLoading(true);
    setDescriptionIsPreview(false);
    setDescriptionHtml("");

    const params = new URLSearchParams({ id: job.id });
    if (job.adref) params.set("adref", job.adref);
    if (job.applyUrl) params.set("applyUrl", job.applyUrl);
    if (job.title) params.set("title", job.title);

    fetch(`/api/jobs/adzuna-detail?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data.success || !data.job) {
          if (!cancelled) {
            setDescriptionIsPreview(true);
            setDescriptionHtml("");
          }
          return;
        }
        setDescriptionIsPreview(data.descriptionSource !== "listing");
        setDescriptionHtml(
          typeof data.descriptionHtml === "string" ? data.descriptionHtml : "",
        );
        setEnrichedJob({
          ...job,
          ...data.job,
          company: data.job.company?.name || job.company,
          companyLogoUrl: data.job.company?.logoUrl || job.companyLogoUrl,
          companyAbout: data.job.company?.about || job.companyAbout,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setDescriptionIsPreview(true);
          setDescriptionHtml("");
        }
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [job]);

  const skillMatch = useMemo(() => {
    if (!displayJob || !profileSkills.length) return null;
    return rateSkillMatch(profileSkills, {
      skills: displayJob.skills || [],
      title: displayJob.title,
      category: displayJob.category,
      description: descriptionHtml || displayJob.description,
      requirements: displayJob.requirements,
    });
  }, [displayJob, profileSkills, descriptionHtml]);

  if (!displayJob || !mounted) return null;

  const activeJob = displayJob;
  const canSaveJob = !authLoading && Boolean(user);
  const adzunaEmbedSrc =
    activeJob.source === "adzuna" && activeJob.applyUrl
      ? `/api/jobs/adzuna-embed?id=${encodeURIComponent(activeJob.id)}&url=${encodeURIComponent(activeJob.applyUrl)}&title=${encodeURIComponent(activeJob.title)}&preview=${encodeURIComponent(activeJob.description || "")}`
      : "";

  const isExternalSource =
    activeJob.source === "adzuna" ||
    activeJob.source === "himalayas" ||
    activeJob.source === "jooble";

  function renderApplyAction() {
    const isStellaJob = /^[a-f\d]{24}$/i.test(activeJob.id);

    if (!authLoading && !user) {
      return (
        <button
          type="button"
          className="job-detail-apply-btn"
          onClick={() => openAuth({ mode: "login", role: "user" })}
        >
          Sign in to apply
        </button>
      );
    }

    return (
      <button
        type="button"
        className="job-detail-apply-btn"
        disabled={applying}
        onClick={async () => {
          if (!user || user.role !== "user") {
            openAuth({ mode: "login", role: "user" });
            return;
          }
          setApplying(true);
          try {
            const body = isStellaJob
              ? { jobId: activeJob.id }
              : {
                  jobId: activeJob.id,
                  boardJob: {
                    id: activeJob.id,
                    source: activeJob.source || "board",
                    title: activeJob.title,
                    companyName: activeJob.company || "",
                    location: activeJob.location || "",
                    employmentType: activeJob.employmentType || "",
                    workMode: activeJob.workMode || "",
                    category: activeJob.category || "",
                    applyUrl: activeJob.applyUrl || "",
                  },
                };
            const res = await fetch("/api/seeker/applications", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
              toast.error(data.message || "Could not apply");
              if (
                typeof data.message === "string" &&
                data.message.toLowerCase().includes("profile")
              ) {
                setTimeout(
                  () => router.push("/dashboard/seeker/profile"),
                  1200,
                );
              }
              return;
            }
            toast.success("Applied successfully");
            onClose();
          } catch {
            toast.error("Could not apply");
          } finally {
            setApplying(false);
          }
        }}
      >
        {applying ? "Applying…" : "Apply"}
      </button>
    );
  }

  return createPortal(
    <div
      className="job-detail-modal home-job-detail-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Job details"
      onClick={onClose}
    >
      <div
        className="job-detail-modal__panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="job-detail-panel job-detail-panel--modal">
          <div className="job-detail-panel__toolbar">
            <p className="job-detail-panel__toolbar-label">Job details</p>
            <div className="job-detail-panel__toolbar-actions">
              <button
                type="button"
                onClick={() => {
                  if (!canSaveJob) {
                    openAuth({ mode: "login", role: "user" });
                    return;
                  }
                  setSaved((v) => !v);
                }}
                className={`job-detail-icon-btn ${saved ? "is-saved" : ""}`}
                aria-label={canSaveJob ? "Save job" : "Sign in to save jobs"}
              >
                <Bookmark className="h-4 w-4 fill-current" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="job-detail-icon-btn"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="job-detail-panel__scroll">
            <div className="job-detail-panel__hero">
              <div className="job-detail-panel__hero-top">
                <CompanyLogo
                  name={displayJob.company || "Company"}
                  logoUrl={displayJob.companyLogoUrl || ""}
                />
                <div className="job-detail-panel__hero-text">
                  <p className="job-detail-company">
                    {displayJob.company || "Company"}
                  </p>
                  <p className="job-detail-title">{displayJob.title}</p>
                </div>
              </div>

              <ul className="job-detail-facts">
                <li className="job-detail-fact">
                  <MapPin className="job-detail-fact-icon" aria-hidden />
                  <span>
                    {displayJob.location || "Australia"}
                    {displayJob.workMode
                      ? ` (${WORK_MODE_LABELS[displayJob.workMode] || displayJob.workMode})`
                      : ""}
                  </span>
                </li>
                {displayJob.category ? (
                  <li className="job-detail-fact">
                    <Building2 className="job-detail-fact-icon" aria-hidden />
                    <span>
                      {displayJob.category}
                      {displayJob.experienceLevel &&
                      LEVEL_LABELS[displayJob.experienceLevel]
                        ? ` · ${LEVEL_LABELS[displayJob.experienceLevel]}`
                        : ""}
                    </span>
                  </li>
                ) : null}
                <li className="job-detail-fact">
                  <Clock className="job-detail-fact-icon" aria-hidden />
                  <span>
                    {TYPE_LABELS[displayJob.employmentType || ""] ||
                      displayJob.employmentType ||
                      "Full time"}
                  </span>
                </li>
                <li className="job-detail-fact">
                  <Banknote className="job-detail-fact-icon" aria-hidden />
                  <span>
                    {formatSalaryDetail(displayJob) || "Salary not disclosed"}
                  </span>
                </li>
              </ul>

              <p className="job-detail-posted">
                Posted {timeAgo(displayJob.createdAt)}
                {displayJob.countryLabel
                  ? ` · ${displayJob.countryLabel}`
                  : ""}
              </p>

              <SkillMatchCard
                match={skillMatch}
                signedIn={!authLoading && Boolean(user)}
                hasProfileSkills={profileSkills.length > 0}
                loading={
                  authLoading ||
                  (Boolean(user?.role === "user") && !profileSkillsLoaded)
                }
                onSignIn={() => openAuth({ mode: "login", role: "user" })}
              />
            </div>

            <div className="job-detail-panel__body">
              <section className="job-detail-section job-detail-section--description">
                {detailLoading ? (
                  <div className="job-detail-loading">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading full job description…
                  </div>
                ) : descriptionHtml ? (
                  <div
                    className="job-detail-prose"
                    dangerouslySetInnerHTML={{
                      __html: normalizeJobDescriptionHtml(descriptionHtml),
                    }}
                  />
                ) : displayJob.description ? (
                  renderJobDescription(displayJob)
                ) : displayJob.source === "adzuna" && adzunaEmbedSrc ? (
                  <div className="job-detail-iframe-wrap">
                    <iframe
                      src={adzunaEmbedSrc}
                      title={`${displayJob.title} full description`}
                      className="job-detail-iframe"
                    />
                  </div>
                ) : (
                  <p className="job-detail-empty">No description provided.</p>
                )}

                {displayJob.source === "adzuna" &&
                descriptionIsPreview &&
                displayJob.applyUrl ? (
                  <div className="job-detail-external-cta">
                    <p>
                      Showing the Adzuna preview. Open the original listing for
                      the complete posting if needed.
                    </p>
                    <a
                      href={displayJob.applyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="job-detail-external-cta__btn"
                    >
                      Open full job on Adzuna
                    </a>
                  </div>
                ) : null}

                {displayJob.source === "jooble" && displayJob.applyUrl ? (
                  <div className="job-detail-external-cta">
                    <p>
                      Jooble only shares a short preview here. Open the full
                      posting for complete details.
                    </p>
                    <a
                      href={displayJob.applyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="job-detail-external-cta__btn"
                    >
                      View full description on Jooble
                    </a>
                  </div>
                ) : null}

                {displayJob.source === "himalayas" ? (
                  <p className="job-detail-source-note">
                    Originally posted on{" "}
                    <a
                      href="https://himalayas.app"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Himalayas
                    </a>
                  </p>
                ) : null}

                {displayJob.source === "jooble" ? (
                  <p className="job-detail-source-note">
                    Aggregated via{" "}
                    <a
                      href="https://jooble.org"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Jooble
                    </a>
                  </p>
                ) : null}
              </section>

              {!isExternalSource ? (
                <>
                  {displayJob.responsibilities ? (
                    <section className="job-detail-section">
                      <p className="job-detail-section-title">
                        Key responsibilities
                      </p>
                      <div
                        className="job-detail-prose"
                        dangerouslySetInnerHTML={{
                          __html: normalizeJobDescriptionHtml(
                            displayJob.responsibilities,
                          ),
                        }}
                      />
                    </section>
                  ) : null}
                  {displayJob.requirements ? (
                    <section className="job-detail-section">
                      <p className="job-detail-section-title">
                        Qualifications & requirements
                      </p>
                      <div
                        className="job-detail-prose"
                        dangerouslySetInnerHTML={{
                          __html: normalizeJobDescriptionHtml(
                            displayJob.requirements,
                          ),
                        }}
                      />
                    </section>
                  ) : null}
                </>
              ) : null}

              {(displayJob.skills || []).length > 0 ? (
                <section className="job-detail-section">
                  <p className="job-detail-section-title">Required skills</p>
                  <div className="job-detail-skills">
                    {(displayJob.skills || []).map((skill) => (
                      <span key={skill} className="job-detail-skill">
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              ) : skillMatch &&
                (skillMatch.matchedSkills.length > 0 ||
                  skillMatch.missingSkills.length > 0) ? (
                <section className="job-detail-section">
                  <p className="job-detail-section-title">Skills</p>
                  <div className="job-detail-skills">
                    {skillMatch.matchedSkills.map((skill) => (
                      <span
                        key={`m-${skill}`}
                        className="job-detail-skill is-matched"
                      >
                        {skill}
                      </span>
                    ))}
                    {skillMatch.missingSkills.slice(0, 8).map((skill) => (
                      <span
                        key={`x-${skill}`}
                        className="job-detail-skill is-missing"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}

              {displayJob.companyAbout ? (
                <section className="job-detail-section">
                  <p className="job-detail-section-title">
                    About {displayJob.company || "company"}
                  </p>
                  <p className="job-detail-about">{displayJob.companyAbout}</p>
                </section>
              ) : null}
            </div>
          </div>

          <div className="job-detail-panel__footer">{renderApplyAction()}</div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
