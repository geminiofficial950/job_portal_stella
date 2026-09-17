"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Copy,
  FileSearch,
  Loader2,
  MapPin,
  Upload,
  X,
} from "lucide-react";
import type { ExtractedSeekerProfile } from "@/lib/geminiResume";
import { useAuth } from "@/app/components/AuthProvider";
import HomeJobDetailModal, {
  type HomeModalJob,
} from "@/app/components/HomeJobDetailModal";
import SuggestedMissingDetails, {
  type GapDraft,
} from "@/app/components/SuggestedMissingDetails";
import { profileGapKeys, type GapKey } from "@/lib/profileGaps";
import styles from "./ResumeDiscoveryPopup.module.css";
import "@/app/jobs/jobs.css";

type BrowseJob = {
  id: string;
  title: string;
  location?: string;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  skills?: string[];
  employmentType?: string;
  workMode?: string;
  experienceLevel?: string;
  category?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: string;
  source?: string;
  applyUrl?: string;
  adref?: string;
  countryLabel?: string;
  createdAt?: string | null;
  company?: {
    name?: string;
    logoUrl?: string;
    about?: string;
  } | null;
  matchedSkills: string[];
};

type Props = {
  delayMs?: number;
  surface?: "home" | "jobs";
};

const LEVEL_LABELS: Record<string, string> = {
  entry: "Entry Level",
  mid: "Mid Level",
  senior: "Senior",
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

const TAG_VARIANTS = [
  "jobs-tag--green",
  "jobs-tag--orange",
  "jobs-tag--purple",
  "jobs-tag--blue",
  "jobs-tag--slate",
] as const;

function dismissKeyFor(surface: "home" | "jobs") {
  return `resume-discovery-dismissed:${surface}`;
}

function tagVariant(index: number) {
  return TAG_VARIANTS[index % TAG_VARIANTS.length];
}

function formatSalary(job: BrowseJob) {
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

function toModalJob(job: BrowseJob): HomeModalJob {
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

export default function ResumeDiscoveryPopup({
  delayMs = 20_000,
  surface = "home",
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const jobsBoardRef = useRef<HTMLDivElement>(null);
  const [dialogNode, setDialogNode] = useState<HTMLDialogElement | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<ExtractedSeekerProfile | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [emailExists, setEmailExists] = useState(false);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [jobs, setJobs] = useState<BrowseJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<HomeModalJob | null>(null);
  // Keep popup alive after register even though auth user becomes set.
  const [onboardingActive, setOnboardingActive] = useState(false);
  const [askMissing, setAskMissing] = useState(false);
  const [missingGaps, setMissingGaps] = useState<GapKey[]>([]);
  const [gapDraft, setGapDraft] = useState<GapDraft | null>(null);

  const dismissKey = dismissKeyFor(surface);
  const stepLabels = [
    "Scan resume",
    "Create account",
    "Save password",
    "Find jobs",
  ];
  const indicatorStep = step <= 1 ? step : step === 2 ? 2 : 3;

  useEffect(() => {
    if (authLoading || user) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(dismissKey)) return;

    let cancelled = false;
    const open = () => {
      if (cancelled) return;
      const node = dialog.current;
      if (!node || node.open) return;
      openDialog();
    };

    if (delayMs <= 0) {
      const id = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(open);
      });
      return () => {
        cancelled = true;
        window.cancelAnimationFrame(id);
      };
    }

    const timer = window.setTimeout(open, delayMs);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, delayMs, dismissKey]);

  // QA preview without AI scan: /jobs?previewResumeJobs=1
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const enabled =
      params.get("previewResumeJobs") === "1" ||
      params.get("previewResumeJobs") === "true";
    if (!enabled) return;

    let cancelled = false;
    const previewSkills = ["React", "TypeScript", "Node", "Full-Stack"];
    setOnboardingActive(true);
    setProfile({
      headline: "Full-Stack Developer",
      location: "Australia",
      about: "Preview profile for testing Apply + job detail popup.",
      skills: previewSkills,
      experienceLevel: "mid",
      experiences: [
        {
          company: "Preview Co",
          title: "Full-Stack Developer",
          description: "Building web apps with React and Node.",
          skills: ["React", "Node"],
        },
      ],
      education: "",
      preferredEmploymentTypes: [],
      preferredWorkModes: [],
      salaryExpectation: "",
      linkedin: "",
      portfolio: "",
      openToWork: true,
    });
    setStep(3);
    sessionStorage.removeItem(dismissKey);

    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (!cancelled) openDialog();
      });
    });

    setBusy(true);
    void fetch(
      `/api/jobs/browse?${new URLSearchParams({
        q: "Full-Stack Developer",
        country: "au",
        fast: "1",
      })}`,
    )
      .then(async (response) => {
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Could not load matching jobs");
        }
        const ranked = ((data.jobs || []) as Omit<BrowseJob, "matchedSkills">[])
          .map((job) => {
            const text = [job.title, job.description, ...(job.skills || [])]
              .join(" ")
              .toLowerCase();
            return {
              ...job,
              matchedSkills: previewSkills.filter((skill) =>
                text.includes(skill.toLowerCase()),
              ),
            };
          })
          .sort((a, b) => b.matchedSkills.length - a.matchedSkills.length);
        setJobs(ranked.slice(0, 12));
      })
      .catch((cause) => {
        if (!cancelled) {
          setError(
            cause instanceof Error ? cause.message : "Could not load jobs",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dismissKey]);

  function openDialog() {
    try {
      if (!dialog.current?.open) {
        dialog.current?.showModal();
      }
      setDialogOpen(true);
    } catch {
      /* ignore */
    }
  }

  function close() {
    dialog.current?.close();
    setDialogOpen(false);
    sessionStorage.setItem(dismissKey, "1");
    setOnboardingActive(false);
    setSelectedJob(null);
  }

  // Keep page behind locked; route mouse-wheel into the jobs list.
  useEffect(() => {
    if (!dialogOpen) return;

    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const onWheel = (event: WheelEvent) => {
      if (!dialog.current?.open) return;
      const target = event.target as HTMLElement | null;
      const detailScroll = target?.closest?.(
        ".job-detail-panel__scroll",
      ) as HTMLElement | null;
      const overModal = Boolean(target?.closest?.(".job-detail-modal"));
      event.preventDefault();
      event.stopPropagation();
      if (detailScroll) {
        detailScroll.scrollTop += event.deltaY;
        return;
      }
      if (overModal) return;
      const board = jobsBoardRef.current;
      if (board) {
        board.scrollTop += event.deltaY;
        return;
      }
      dialog.current.scrollTop += event.deltaY;
    };

    const onTouchMove = (event: TouchEvent) => {
      const target = event.target as HTMLElement | null;
      const detailScroll = target?.closest?.(".job-detail-panel__scroll");
      if (detailScroll) return;
      const board = jobsBoardRef.current;
      if (board && target && board.contains(target)) return;
      event.preventDefault();
    };

    document.addEventListener("wheel", onWheel, { passive: false, capture: true });
    document.addEventListener("touchmove", onTouchMove, {
      passive: false,
      capture: true,
    });

    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
      document.removeEventListener("wheel", onWheel, true);
      document.removeEventListener("touchmove", onTouchMove, true);
    };
  }, [dialogOpen]);

  async function scan(event: React.FormEvent) {
    event.preventDefault();
    if (!file || busy) return;
    setBusy(true);
    setError("");
    setOnboardingActive(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/resume-discovery/scan", {
        method: "POST",
        body,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Resume scan failed");
      setProfile(data.profile);
      setName(data.profile.name || "");
      setEmail(data.profile.email || "");
      setStep(1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Resume scan failed");
    } finally {
      setBusy(false);
    }
  }

  function openJobs() {
    if (!profile) return;
    const missing = profileGapKeys(
      { ...profile, phone: profile.phone },
      { includePhone: !profile.phone, includeResumeUrl: false },
    );
    if (missing.length) {
      setMissingGaps(missing);
      setGapDraft({
        headline: profile.headline || "",
        location: profile.location || "",
        experienceLevel: profile.experienceLevel || "",
        about: profile.about || "",
        skills: (profile.skills || []).join(", "),
        education: profile.education || "",
        preferredEmploymentTypes: profile.preferredEmploymentTypes || [],
        preferredWorkModes: profile.preferredWorkModes || [],
        linkedin: profile.linkedin || "",
        resumeUrl: "",
        phone: profile.phone || "",
      });
      setAskMissing(true);
      setStep(3);
      setError("");
      return;
    }
    void findJobs();
  }

  async function saveFilledProfile(next: ExtractedSeekerProfile) {
    const response = await fetch("/api/seeker/profile", { cache: "no-store" });
    if (response.status === 401) return;
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Could not save those details");
    }
    const current = data.profile;
    const education = next.education?.trim() || "";
    const merged = { ...current };
    if (missingGaps.includes("headline") && next.headline) merged.headline = next.headline;
    if (missingGaps.includes("location") && next.location) merged.location = next.location;
    if (missingGaps.includes("experienceLevel") && next.experienceLevel) {
      merged.experienceLevel = next.experienceLevel;
    }
    if (missingGaps.includes("about") && next.about) merged.about = next.about;
    if (missingGaps.includes("skills") && next.skills?.length) merged.skills = next.skills;
    if (missingGaps.includes("linkedin") && next.linkedin) merged.linkedin = next.linkedin;
    if (missingGaps.includes("preferredEmploymentTypes") && next.preferredEmploymentTypes?.length) {
      merged.preferredEmploymentTypes = next.preferredEmploymentTypes;
    }
    if (missingGaps.includes("preferredWorkModes") && next.preferredWorkModes?.length) {
      merged.preferredWorkModes = next.preferredWorkModes;
    }
    if (merged.portfolio && !/^https?:\/\//i.test(String(merged.portfolio))) {
      merged.portfolio = "";
    }
    if (missingGaps.includes("education") && education) {
      merged.education = education;
      merged.educations = [
        {
          institution: education,
          degree: "",
          level: "",
          yearCompleted: "",
          description: "",
          skills: [],
        },
      ];
    }
    const saved = await fetch("/api/seeker/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: "profile", profile: merged }),
    });
    const savedData = await saved.json();
    if (!saved.ok || !savedData.success) {
      throw new Error(savedData.message || "Could not save those details");
    }
    if (next.phone && next.phone !== data.account?.phone) {
      const account = await fetch("/api/seeker/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "account",
          name: data.account?.name || next.name || "Job seeker",
          phone: next.phone,
        }),
      });
      const accountData = await account.json();
      if (!account.ok || !accountData.success) {
        throw new Error(accountData.message || "Could not save phone");
      }
    }
  }

  async function submitMissing(event: FormEvent) {
    event.preventDefault();
    if (!profile || !gapDraft || busy) return;
    if (
      missingGaps.includes("preferredEmploymentTypes") &&
      !gapDraft.preferredEmploymentTypes.length
    ) {
      setError("Select at least one employment type");
      return;
    }
    if (missingGaps.includes("preferredWorkModes") && !gapDraft.preferredWorkModes.length) {
      setError("Select at least one work mode");
      return;
    }
    const skills = gapDraft.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
    const next: ExtractedSeekerProfile = {
      ...profile,
      headline: missingGaps.includes("headline") ? gapDraft.headline.trim() : profile.headline,
      location: missingGaps.includes("location") ? gapDraft.location.trim() : profile.location,
      experienceLevel: missingGaps.includes("experienceLevel")
        ? gapDraft.experienceLevel
        : profile.experienceLevel,
      about: missingGaps.includes("about") ? gapDraft.about.trim() : profile.about,
      skills: missingGaps.includes("skills") ? skills : profile.skills,
      education: missingGaps.includes("education")
        ? gapDraft.education.trim()
        : profile.education,
      preferredEmploymentTypes: missingGaps.includes("preferredEmploymentTypes")
        ? gapDraft.preferredEmploymentTypes
        : profile.preferredEmploymentTypes,
      preferredWorkModes: missingGaps.includes("preferredWorkModes")
        ? gapDraft.preferredWorkModes
        : profile.preferredWorkModes,
      linkedin: missingGaps.includes("linkedin") ? gapDraft.linkedin.trim() : profile.linkedin,
      phone: missingGaps.includes("phone") ? gapDraft.phone.trim() : profile.phone,
    };
    setProfile(next);
    setBusy(true);
    setError("");
    try {
      await saveFilledProfile(next);
      await findJobs(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save those details");
      setBusy(false);
    }
  }

  async function findJobs(source?: ExtractedSeekerProfile) {
    const active = source || profile;
    if (!active) return;
    setAskMissing(false);
    setStep(3);
    setBusy(true);
    setError("");
    try {
      const query =
        active.skills[0] ||
        active.headline ||
        active.experiences?.[0]?.title ||
        "";
      const response = await fetch(
        `/api/jobs/browse?${new URLSearchParams({
          q: query,
          country: "au",
          fast: "1",
        })}`,
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Could not load matching jobs");
      }
      const ranked = ((data.jobs || []) as Omit<BrowseJob, "matchedSkills">[])
        .map((job) => {
          const text = [job.title, job.description, ...(job.skills || [])]
            .join(" ")
            .toLowerCase();
          return {
            ...job,
            matchedSkills: (active.skills || []).filter((skill) =>
              text.includes(skill.toLowerCase()),
            ),
          };
        })
        .sort((a, b) => b.matchedSkills.length - a.matchedSkills.length);
      setJobs(ranked.slice(0, 12));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load jobs");
    } finally {
      setBusy(false);
    }
  }

  async function register(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setEmailExists(false);
    try {
      const response = await fetch("/api/resume-discovery/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, consent }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data?.code === "EMAIL_EXISTS") {
          setEmailExists(true);
          setError(
            data.message ||
              "An account already exists on this email. Please change your email address, or go to the sign in page.",
          );
          return;
        }
        throw new Error(data.message || "Could not create account");
      }
      setPassword(data.password);
      setOnboardingActive(true);
      setStep(2);
      void refreshUser();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not create account",
      );
    } finally {
      setBusy(false);
    }
  }

  // Hide for registered users unless mid-onboarding after account create.
  if (!authLoading && user && !onboardingActive) return null;

  return (
    <>
      {!authLoading && !user ? (
        <button
          type="button"
          className={styles.launcher}
          onClick={() => {
            setOnboardingActive(true);
            openDialog();
          }}
        >
          <FileSearch size={18} />
          Match my resume
        </button>
      ) : null}

      <dialog
        ref={(node) => {
          dialog.current = node;
          if (node !== dialogNode) setDialogNode(node);
        }}
        className={`${styles.dialog} ${step === 3 ? styles.dialogFullscreen : ""}`}
        aria-labelledby="resume-discovery-title"
        onCancel={() => {
          setDialogOpen(false);
          sessionStorage.setItem(dismissKey, "1");
          setOnboardingActive(false);
          setSelectedJob(null);
        }}
        onClose={() => setDialogOpen(false)}
      >
        <header className={styles.header}>
          <span>
            <FileSearch size={19} />
            Your next opportunity
          </span>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Close resume matcher"
            onClick={close}
          >
            <X size={20} />
          </button>
        </header>

        {step < 3 ? (
          <ol className={styles.steps}>
            {stepLabels.map((label, index) => (
              <li
                key={label}
                aria-current={indicatorStep === index ? "step" : undefined}
              >
                <span>
                  {index < indicatorStep ? <Check size={13} /> : index + 1}
                </span>
                {label}
              </li>
            ))}
          </ol>
        ) : null}

        <div
          className={`${styles.content} ${step === 3 && !askMissing ? styles.contentJobs : ""}`}
        >
          <h2 id="resume-discovery-title">
            {askMissing
              ? "A few details weren't on your resume"
              : [
                  "Scan your resume. Find your next job.",
                  "Want to track your applications?",
                  "Account created — save your password",
                  "Jobs matched to your resume",
                ][step]}
          </h2>

          {step === 0 && (
            <form onSubmit={scan}>
              <p className={styles.muted}>
                Start with your experience. Discover roles that fit your skills.
              </p>
              <label className={styles.upload}>
                <Upload size={30} />
                <strong>{file?.name || "Choose your resume"}</strong>
                <span>PDF or DOCX, up to 8 MB</span>
                <input
                  type="file"
                  accept="application/pdf,.docx"
                  required
                  disabled={busy}
                  onChange={(event) => {
                    setFile(event.target.files?.[0] || null);
                    setError("");
                  }}
                />
              </label>
              <p className={styles.note}>
                Your resume is processed by Google Gemini to extract career
                details. Scan details expire after one hour unless you create an
                account.
              </p>
              <button className={styles.primary} disabled={!file || busy}>
                {busy ? (
                  <Loader2 className={styles.spin} size={17} />
                ) : (
                  <FileSearch size={17} />
                )}
                {busy ? "Scanning your resume..." : "Scan resume"}
              </button>
            </form>
          )}

          {step === 1 && profile && (
            <>
              <div className={styles.summary}>
                <strong>{profile.headline || "Your career profile"}</strong>
                <p>{profile.location}</p>
                {profile.experienceLevel ? (
                  <p className={styles.levelBadge}>
                    {LEVEL_LABELS[profile.experienceLevel] ||
                      profile.experienceLevel}
                  </p>
                ) : null}
                {profile.experiences?.length ? (
                  <div className={styles.experienceList}>
                    <p className={styles.experienceHeading}>Experience</p>
                    {profile.experiences.slice(0, 4).map((role, index) => (
                      <div
                        key={`${role.company}-${role.title}-${index}`}
                        className={styles.experienceItem}
                      >
                        <strong>
                          {role.title || "Role"}
                          {role.company ? ` · ${role.company}` : ""}
                        </strong>
                        {role.description ? <p>{role.description}</p> : null}
                      </div>
                    ))}
                  </div>
                ) : profile.about ? (
                  <p className={styles.experienceFallback}>{profile.about}</p>
                ) : null}
                <div className={styles.tags}>
                  {profile.skills.slice(0, 8).map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              </div>
              <form onSubmit={register}>
                <p className={styles.muted}>
                  Create your account with the details from your resume. Your
                  generated password will appear next.
                </p>
                <div className={styles.fields}>
                  <label>
                    Full name
                    <input
                      autoComplete="name"
                      required
                      minLength={2}
                      maxLength={80}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                    />
                  </label>
                  <label>
                    Email
                    <input
                      autoComplete="email"
                      type="email"
                      required
                      maxLength={200}
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        if (emailExists) {
                          setEmailExists(false);
                          setError("");
                        }
                      }}
                    />
                  </label>
                </div>
                <label className={styles.consent}>
                  <input
                    type="checkbox"
                    checked={consent}
                    required
                    onChange={(event) => setConsent(event.target.checked)}
                  />
                  I agree to create an account and save my extracted profile.
                </label>
                <button className={styles.primary} disabled={busy || !consent}>
                  {busy ? (
                    <Loader2 size={16} className={styles.spin} />
                  ) : (
                    <Check size={16} />
                  )}
                  Yes, create my account
                </button>
                <div className={styles.secondary}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={openJobs}
                  >
                    Not now, just show jobs
                  </button>
                  <Link href="/login?role=user">
                    Already registered? Sign in
                  </Link>
                </div>
              </form>
              <button
                type="button"
                className={styles.back}
                disabled={busy}
                onClick={() => {
                  setStep(0);
                  setError("");
                }}
              >
                Scan a different resume
              </button>
            </>
          )}

          {step === 2 && (
            <div className={styles.credentials}>
              <strong>Account created</strong>
              <p>{email}</p>
              <label>
                Your generated password
                <input
                  readOnly
                  value={password}
                  aria-label="Your generated password"
                />
              </label>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(password);
                    setCopied(true);
                  } catch {
                    setError(
                      "Copy unavailable. Select the password to copy it.",
                    );
                  }
                }}
              >
                <Copy size={14} />
                {copied ? "Copied" : "Copy password"}
              </button>
              <p>
                Keep this password before continuing. You can change it later in
                Settings.
              </p>
              <button
                type="button"
                className={styles.primary}
                disabled={busy}
                onClick={openJobs}
              >
                Continue to matching jobs
                <ArrowRight size={16} />
              </button>
              <Link
                href="/dashboard/seeker/profile"
                className={styles.profileLink}
              >
                Review your profile
                <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {step === 3 && askMissing && gapDraft && (
            <SuggestedMissingDetails
              tone="popup"
              gaps={missingGaps}
              draft={gapDraft}
              saving={busy}
              error={error}
              onChange={setGapDraft}
              onSubmit={submitMissing}
            />
          )}

          {step === 3 && !askMissing && (
            <>
              <p className={styles.muted}>
                Roles matched from your resume skills
                {profile?.headline ? ` · ${profile.headline}` : ""}.
              </p>
              {busy ? (
                <p className={styles.loading}>
                  <Loader2 size={22} className={styles.spin} />
                  Finding relevant roles...
                </p>
              ) : (
                <>
                  {jobs.length ? (
                    <div
                      ref={jobsBoardRef}
                      className={`jobs-list ${styles.jobsBoard}`}
                    >
                      {jobs.map((job) => {
                        const companyName = job.company?.name || "Company";
                        const blurb = snippet(job.description);
                        const pay = formatSalary(job);
                        const tags = [
                          TYPE_LABELS[job.employmentType || ""] ||
                            job.employmentType,
                          WORK_MODE_LABELS[job.workMode || ""] || job.workMode,
                        ].filter(Boolean) as string[];

                        return (
                          <article
                            key={job.id}
                            role="button"
                            tabIndex={0}
                            className="jobs-card"
                            onClick={() => setSelectedJob(toModalJob(job))}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                setSelectedJob(toModalJob(job));
                              }
                            }}
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
                                  companyName.trim().charAt(0).toUpperCase() ||
                                  "J"
                                )}
                              </div>
                              <div className="jobs-card-body">
                                <h3 className="jobs-card-title font-manrope">
                                  {job.title}
                                </h3>
                                {blurb ? (
                                  <p className="jobs-card-snippet">{blurb}</p>
                                ) : null}
                                <div className="jobs-card-tags">
                                  {tags.map((tag, i) => (
                                    <span
                                      key={`${job.id}-${tag}`}
                                      className={`jobs-tag ${tagVariant(i)}`}
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {job.experienceLevel ? (
                                    <span
                                      className={`jobs-tag ${tagVariant(tags.length)}`}
                                    >
                                      {LEVEL_LABELS[job.experienceLevel] ||
                                        job.experienceLevel}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                            <div
                              className="jobs-card-divider"
                              aria-hidden="true"
                            />
                            <div className="jobs-card-meta jobs-card-location">
                              <span className="jobs-card-meta-label">
                                Location
                              </span>
                              <span className="jobs-card-meta-value">
                                <MapPin size={12} />
                                {job.location ||
                                  job.countryLabel ||
                                  "Location not listed"}
                              </span>
                            </div>
                            <div
                              className="jobs-card-divider"
                              aria-hidden="true"
                            />
                            <div className="jobs-card-meta jobs-card-pay">
                              <span className="jobs-card-meta-label">Pay</span>
                              <span
                                className={`jobs-card-meta-value${pay ? "" : " is-empty"}`}
                              >
                                {pay || "Not listed"}
                              </span>
                            </div>
                            <div
                              className="jobs-card-divider"
                              aria-hidden="true"
                            />
                            <div className="jobs-card-center">
                              <span className="jobs-card-meta-label">
                                Company
                              </span>
                              <span className="jobs-card-meta-value">
                                {companyName}
                              </span>
                            </div>
                            <div
                              className="jobs-card-divider"
                              aria-hidden="true"
                            />
                            <div className="jobs-card-actions">
                              <button
                                type="button"
                                className="jobs-apply-btn"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setSelectedJob(toModalJob(job));
                                }}
                              >
                                Apply
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    !error && (
                      <p className={styles.muted}>
                        No matching roles found right now. Explore all jobs or
                        try another resume.
                      </p>
                    )
                  )}
                  <div className={styles.secondary}>
                    <Link
                      href={`/jobs?q=${encodeURIComponent(profile?.skills[0] || profile?.headline || "")}`}
                    >
                      Browse more jobs
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setStep(0);
                        setError("");
                        setPassword("");
                        setJobs([]);
                      }}
                    >
                      Scan another resume
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {error && !askMissing && (
            <div role="alert" className={styles.error}>
              <p>{error}</p>
              {emailExists ? (
                <div className={styles.errorActions}>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailExists(false);
                      setError("");
                      const input = dialog.current?.querySelector(
                        'input[type="email"]',
                      ) as HTMLInputElement | null;
                      input?.focus();
                      input?.select();
                    }}
                  >
                    Change email address
                  </button>
                  <Link href="/login?role=user">Go to sign in page</Link>
                </div>
              ) : null}
              {step === 3 && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void findJobs()}
                >
                  Retry job search
                </button>
              )}
            </div>
          )}
        </div>
      </dialog>

      <HomeJobDetailModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        portalContainer={dialogNode}
      />
    </>
  );
}
