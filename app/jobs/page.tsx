"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  MapPin,
  Bookmark,
  SlidersHorizontal,
  ArrowLeft,
  Loader2,
  Briefcase,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { useAuth } from "@/app/components/AuthProvider";
import {
  formatAdzunaDescriptionPreview,
} from "@/lib/adzuna-description";
import "./jobs.css";

type CompanyInfo = {
  id: string;
  name: string;
  logoUrl: string;
  location: string;
  industry: string;
  about: string;
  website: string;
  size: string;
};

type JobItem = {
  id: string;
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
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
  benefits: string;
  createdAt: string | null;
  company: CompanyInfo | null;
  source?: "stella" | "adzuna" | string;
  applyUrl?: string;
  adref?: string;
  country?: string;
  countryLabel?: string;
};

type CompanyOption = { id: string; name: string };

type CountryOption = { code: string; label: string; flag: string };

const WORK_MODE_LABELS: Record<string, string> = {
  onsite: "Onsite",
  remote: "Remote",
  hybrid: "Hybrid",
};

const TYPE_LABELS: Record<string, string> = {
  "full-time": "Fulltime",
  "part-time": "Parttime",
  casual: "Casual",
  contract: "Contract",
};

const LEVEL_LABELS: Record<string, string> = {
  entry: "Entry Level",
  mid: "Mid Level",
  senior: "Senior",
};

const PERIOD_LABELS: Record<string, string> = {
  hour: "hr",
  day: "day",
  week: "week",
  year: "year",
};

function hasSalary(job: JobItem) {
  return job.salaryMin > 0 || job.salaryMax > 0;
}

function formatSalaryAmount(amount: number) {
  if (amount >= 10000) {
    return `$${Math.round(amount / 1000).toLocaleString()}k`;
  }
  return `$${amount.toLocaleString()}`;
}

function formatSalary(job: JobItem): string | null {
  const min = Math.round(job.salaryMin);
  const max = Math.round(job.salaryMax);
  if (min <= 0 && max <= 0) return null;

  const period = PERIOD_LABELS[job.salaryPeriod] || job.salaryPeriod;
  const lo = min > 0 ? min : max;
  const hi = max > 0 ? max : min;

  if (lo === hi) return `${formatSalaryAmount(lo)} / ${period}`;
  return `${formatSalaryAmount(lo)}–${formatSalaryAmount(hi)} / ${period}`;
}

function looksLikeHtml(text: string) {
  return /<\/?[a-z][\s\S]*>/i.test(text);
}

function renderJobDescription(job: JobItem) {
  const raw = job.description || "";
  if (!raw) return null;

  if (job.source === "adzuna") {
    const preview = formatAdzunaDescriptionPreview(raw);
    if (looksLikeHtml(raw)) {
      return (
        <div
          className="prose prose-sm max-w-none text-slate-600"
          dangerouslySetInnerHTML={{ __html: raw }}
        />
      );
    }
    return (
      <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600 wrap-anywhere">
        {preview}
      </p>
    );
  }

  return (
    <div
      className="prose prose-sm max-w-none text-slate-600"
      dangerouslySetInnerHTML={{ __html: raw }}
    />
  );
}

function australiaJobPriority(job: JobItem): number {
  if (job.country === "au") return 0;
  const hay = `${job.location || ""} ${job.countryLabel || ""}`.toLowerCase();
  return hay.includes("australia") ? 0 : 1;
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

const POPULAR_KEYWORDS = [
  "Software Engineer",
  "Accountant",
  "Remote",
  "Marketing",
  "Nurse",
];

function CompanyLogo({
  name,
  logoUrl,
  size = "md",
}: {
  name: string;
  logoUrl: string;
  size?: "md" | "lg";
}) {
  const box = size === "lg" ? "h-12 w-12" : "h-11 w-11";
  const text = size === "lg" ? "text-base" : "text-sm";
  const initial = name.trim().charAt(0).toUpperCase() || "J";
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={`${name} logo`}
        className={`${box} shrink-0 rounded-2xl border border-slate-100 bg-white object-cover shadow-xs`}
      />
    );
  }
  return (
    <div
      className={`${box} ${text} flex shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-900 font-black text-white shadow-xs`}
    >
      {initial}
    </div>
  );
}

function JobSearchInner() {
  const searchParams = useSearchParams();
  const companyFromUrl = searchParams.get("company")?.trim() || "";
  const { user, loading: authLoading } = useAuth();

  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([]);
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adzunaWarning, setAdzunaWarning] = useState("");
  const [adzunaCacheNote, setAdzunaCacheNote] = useState("");

  const SESSION_JOBS_KEY = "stella-jobs-browse-v6";
  const SESSION_JOBS_TTL_MS = 5 * 60 * 1000;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedCompanyId, setSelectedCompanyId] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [enrichedJobDetail, setEnrichedJobDetail] = useState<JobItem | null>(
    null,
  );
  const [detailLoading, setDetailLoading] = useState(false);
  const [descriptionIsPreview, setDescriptionIsPreview] = useState(false);
  const [descriptionHtml, setDescriptionHtml] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [sortBy, setSortBy] = useState<"relevant" | "newest">("relevant");
  const [openFilters, setOpenFilters] = useState({
    country: true,
    employment: true,
    category: true,
    workModel: true,
    level: true,
  });

  const placeholderWords = useMemo(
    () =>
      jobs.length > 0
        ? jobs.slice(0, 6).map((j) => `${j.title}...`)
        : [
            "UI/UX Designer...",
            "Software Engineer...",
            "Product Manager...",
            "Data Analyst...",
          ],
    [jobs],
  );
  const [wordIdx, setWordIdx] = useState(0);
  const [currentPlaceholderText, setCurrentPlaceholderText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (typeof window !== "undefined") {
        const raw = sessionStorage.getItem(SESSION_JOBS_KEY);
        if (raw) {
          const cached = JSON.parse(raw) as {
            at: number;
            payload: {
              jobs: JobItem[];
              companies: CompanyOption[];
              categories: string[];
              countries: CountryOption[];
              adzuna?: {
                configured?: boolean;
                error?: string;
                fromCache?: boolean;
                cacheTtlHours?: number;
              };
            };
          };
          if (Date.now() - cached.at < SESSION_JOBS_TTL_MS) {
            setJobs(cached.payload.jobs ?? []);
            setCompanyOptions(cached.payload.companies ?? []);
            setCategories([
              "All",
              ...((cached.payload.categories as string[]) ?? []),
            ]);
            setCountryOptions(cached.payload.countries ?? []);
            if (
              cached.payload.adzuna?.configured === false &&
              cached.payload.adzuna?.error
            ) {
              setAdzunaWarning(cached.payload.adzuna.error);
            } else {
              setAdzunaWarning("");
            }
            if (cached.payload.adzuna?.fromCache) {
              setAdzunaCacheNote(
                `External jobs loaded from cache (refreshes every ${cached.payload.adzuna.cacheTtlHours ?? 6}h).`,
              );
            } else {
              setAdzunaCacheNote("");
            }
            setLoading(false);
            return;
          }
        }
      }

      const res = await fetch("/api/jobs/browse");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load jobs");
      }
      setJobs(data.jobs ?? []);
      setCompanyOptions(data.companies ?? []);
      setCategories(["All", ...((data.categories as string[]) ?? [])]);
      setCountryOptions(data.countries ?? []);
      if (
        data.adzuna &&
        data.adzuna.configured === false &&
        data.adzuna.error
      ) {
        setAdzunaWarning(data.adzuna.error);
      } else {
        setAdzunaWarning("");
      }
      if (data.adzuna?.fromCache) {
        setAdzunaCacheNote(
          `External jobs loaded from cache (refreshes every ${data.adzuna.cacheTtlHours ?? 6}h).`,
        );
      } else {
        setAdzunaCacheNote("");
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          SESSION_JOBS_KEY,
          JSON.stringify({
            at: Date.now(),
            payload: {
              jobs: data.jobs ?? [],
              companies: data.companies ?? [],
              categories: data.categories ?? [],
              countries: data.countries ?? [],
              adzuna: data.adzuna,
            },
          }),
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  // Preselect company filter from /jobs?company=Name
  useEffect(() => {
    if (!companyFromUrl || companyOptions.length === 0) return;
    const match = companyOptions.find(
      (c) => c.name.toLowerCase() === companyFromUrl.toLowerCase(),
    );
    if (match) setSelectedCompanyId(match.id);
  }, [companyFromUrl, companyOptions]);

  useEffect(() => {
    const targetWord = placeholderWords[wordIdx % placeholderWords.length];
    const speed = isDeleting ? 40 : 85;

    if (!isDeleting && currentPlaceholderText === targetWord) {
      const timeout = setTimeout(() => setIsDeleting(true), 1800);
      return () => clearTimeout(timeout);
    }
    if (isDeleting && currentPlaceholderText === "") {
      setIsDeleting(false);
      setWordIdx((prev) => (prev + 1) % placeholderWords.length);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentPlaceholderText((prev) =>
        isDeleting
          ? targetWord.substring(0, prev.length - 1)
          : targetWord.substring(0, prev.length + 1),
      );
    }, speed);

    return () => clearTimeout(timer);
  }, [currentPlaceholderText, isDeleting, wordIdx, placeholderWords]);

  const jobTypes = ["full-time", "part-time", "contract", "casual"];
  const workModels = ["onsite", "remote", "hybrid"];
  const experienceLevels = [
    { value: "All", label: "All" },
    { value: "entry", label: "Entry Level" },
    { value: "mid", label: "Mid Level" },
    { value: "senior", label: "Senior" },
  ];

  const toggleBookmark = (id: string) => {
    if (!user) return;
    setSavedJobs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const canSaveJob = !authLoading && Boolean(user);

  const toggleTypeFilter = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const toggleModelFilter = (model: string) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model],
    );
  };

  const resetFilters = () => {
    setSearchQuery("");
    setLocationQuery("");
    setSelectedTypes([]);
    setSelectedModels([]);
    setSelectedCategory("All");
    setSelectedLevel("All");
    setSelectedCompanyId("All");
    setSelectedCountry("all");
  };

  const matchesSelectedCountry = useCallback(
    (job: JobItem) => {
      if (selectedCountry === "all") return true;
      if (job.source === "adzuna") {
        return job.country === selectedCountry;
      }
      const loc = job.location.toLowerCase();
      const label =
        countryOptions
          .find((c) => c.code === selectedCountry)
          ?.label.toLowerCase() || "";
      const needles = [
        selectedCountry,
        label,
        selectedCountry === "gb" ? "uk" : "",
        selectedCountry === "gb" ? "united kingdom" : "",
        selectedCountry === "us" ? "united states" : "",
        selectedCountry === "us" ? "usa" : "",
      ].filter(Boolean);
      return needles.some((needle) => loc.includes(needle));
    },
    [selectedCountry, countryOptions],
  );

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (!matchesSelectedCountry(job)) return false;
      const companyName = job.company?.name || "";
      if (
        searchQuery &&
        !job.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !companyName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !job.location.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (
        locationQuery &&
        !job.location.toLowerCase().includes(locationQuery.toLowerCase())
      ) {
        return false;
      }
      if (
        selectedCategory !== "All" &&
        job.category.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }
      if (selectedLevel !== "All" && job.experienceLevel !== selectedLevel) {
        return false;
      }
      if (
        selectedTypes.length > 0 &&
        !selectedTypes.includes(job.employmentType)
      ) {
        return false;
      }
      if (selectedModels.length > 0 && !selectedModels.includes(job.workMode)) {
        return false;
      }
      if (
        selectedCompanyId !== "All" &&
        job.company?.id !== selectedCompanyId
      ) {
        return false;
      }
      return true;
    });
  }, [
    jobs,
    searchQuery,
    selectedCategory,
    selectedLevel,
    selectedTypes,
    selectedModels,
    selectedCompanyId,
    matchesSelectedCountry,
    locationQuery,
  ]);

  const sortedJobs = useMemo(() => {
    const list = [...filteredJobs];
    list.sort((a, b) => {
      const auDiff = australiaJobPriority(a) - australiaJobPriority(b);
      if (auDiff !== 0) return auDiff;

      if (sortBy === "newest") {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      }
      return 0;
    });
    return list;
  }, [filteredJobs, sortBy]);

  const jobsForCounts = useMemo(
    () => jobs.filter((job) => matchesSelectedCountry(job)),
    [jobs, matchesSelectedCountry],
  );

  const employmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const job of jobsForCounts) {
      counts[job.employmentType] = (counts[job.employmentType] || 0) + 1;
    }
    return counts;
  }, [jobsForCounts]);

  const workModeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const job of jobsForCounts) {
      counts[job.workMode] = (counts[job.workMode] || 0) + 1;
    }
    return counts;
  }, [jobsForCounts]);

  const toggleFilterSection = (key: keyof typeof openFilters) => {
    setOpenFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    setSelectedJobId((prev) => (prev !== null ? null : prev));
  }, [
    searchQuery,
    selectedCategory,
    selectedLevel,
    selectedTypes,
    selectedModels,
    selectedCompanyId,
    selectedCountry,
    locationQuery,
  ]);

  const activeJobDetail = useMemo(
    () => filteredJobs.find((job) => job.id === selectedJobId) || null,
    [filteredJobs, selectedJobId],
  );

  const displayJobDetail = enrichedJobDetail || activeJobDetail;

  useEffect(() => {
    const job = activeJobDetail;
    if (!job || job.source !== "adzuna") {
      setEnrichedJobDetail(null);
      setDetailLoading(false);
      setDescriptionIsPreview(false);
      setDescriptionHtml("");
      return;
    }

    if (!job.applyUrl) {
      setEnrichedJobDetail(null);
      setDetailLoading(false);
      setDescriptionIsPreview(true);
      setDescriptionHtml("");
      return;
    }

    let cancelled = false;
    setEnrichedJobDetail(null);
    setDetailLoading(true);
    setDescriptionIsPreview(false);
    setDescriptionHtml("");

    const params = new URLSearchParams({
      id: job.id,
    });
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
        setEnrichedJobDetail({
          ...job,
          ...data.job,
          company: data.job.company
            ? {
                id: data.job.company.id,
                name: data.job.company.name,
                logoUrl: data.job.company.logoUrl || "",
                location: data.job.company.location || "",
                industry: data.job.company.industry || "",
                about: data.job.company.about || "",
                website: data.job.company.website || "",
                size: data.job.company.size || "",
              }
            : job.company,
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
  }, [activeJobDetail]);

  const adzunaEmbedSrc =
    displayJobDetail?.source === "adzuna" && displayJobDetail.applyUrl
      ? `/api/jobs/adzuna-embed?id=${encodeURIComponent(displayJobDetail.id)}&url=${encodeURIComponent(displayJobDetail.applyUrl)}&title=${encodeURIComponent(displayJobDetail.title)}`
      : "";

  useEffect(() => {
    if (!displayJobDetail) return;
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedJobId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [displayJobDetail]);

  useEffect(() => {
    if (!selectedJobId) return;
    if (window.matchMedia("(max-width: 1023px)").matches) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [selectedJobId]);

  const renderApplyAction = () => {
    if (!displayJobDetail) return null;
    if (displayJobDetail.source === "adzuna" && displayJobDetail.applyUrl) {
      return (
        <a
          href={displayJobDetail.applyUrl}
          target="_blank"
          rel="noreferrer"
          className="job-detail-apply-btn"
        >
          Apply
        </a>
      );
    }
    if (!authLoading && !user) {
      return (
        <Link
          href={`/login?role=user&next=${encodeURIComponent(`/jobs?job=${displayJobDetail.id}`)}`}
          className="job-detail-apply-btn"
        >
          Sign in to apply
        </Link>
      );
    }
    return (
      <Link
        href={
          user?.role === "user"
            ? "/dashboard/seeker/jobs"
            : "/login?role=user"
        }
        className="job-detail-apply-btn"
      >
        Apply now
      </Link>
    );
  };

  const renderJobDetailContent = (variant: "mobile" | "modal") => {
    if (!displayJobDetail) return null;
    const isModal = variant === "modal";

    return (
      <div
        className={`job-detail-panel ${isModal ? "job-detail-panel--modal" : ""}`}
      >
        <div className="job-detail-panel__toolbar">
          {isModal ? (
            <>
              <p className="job-detail-panel__toolbar-label">Job details</p>
              <div className="job-detail-panel__toolbar-actions">
                <button
                  type="button"
                  onClick={() => toggleBookmark(displayJobDetail.id)}
                  disabled={!canSaveJob}
                  title={
                    canSaveJob ? "Save job" : "Sign in to save jobs"
                  }
                  className={`job-detail-icon-btn ${
                    savedJobs.includes(displayJobDetail.id) ? "is-saved" : ""
                  }`}
                  aria-label={
                    canSaveJob ? "Save job" : "Sign in to save jobs"
                  }
                >
                  <Bookmark className="h-4 w-4 fill-current" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedJobId(null)}
                  className="job-detail-icon-btn"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setSelectedJobId(null)}
                className="job-detail-back-btn"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to jobs
              </button>
            </>
          )}
        </div>

        <div className="job-detail-panel__scroll">
          <div className="job-detail-panel__hero">
            <div className="job-detail-panel__hero-top">
              <CompanyLogo
                name={displayJobDetail.company?.name || "Company"}
                logoUrl={displayJobDetail.company?.logoUrl || ""}
                size="lg"
              />
              <div className="job-detail-panel__hero-text">
                <p className="job-detail-company">
                  {displayJobDetail.company?.name || "Company"}
                </p>
                <h2 className="job-detail-title font-manrope">
                  {displayJobDetail.title}
                </h2>
                {displayJobDetail.category ? (
                  <p className="job-detail-category">
                    {displayJobDetail.category}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="job-detail-salary-box">
              <span className="job-detail-salary-label">
                {hasSalary(displayJobDetail) ? "Salary range" : "Compensation"}
              </span>
              {formatSalary(displayJobDetail) ? (
                <span className="job-detail-salary-value">
                  {formatSalary(displayJobDetail)}
                </span>
              ) : (
                <span className="job-detail-salary-muted">
                  Salary not disclosed
                </span>
              )}
            </div>

            <div className="job-detail-meta">
              <span className="job-detail-meta-chip">
                <MapPin className="h-3.5 w-3.5" />
                {displayJobDetail.location}
              </span>
              <span className="job-detail-meta-chip">
                {WORK_MODE_LABELS[displayJobDetail.workMode] ||
                  displayJobDetail.workMode}
              </span>
              <span className="job-detail-meta-chip">
                {TYPE_LABELS[displayJobDetail.employmentType] ||
                  displayJobDetail.employmentType}
              </span>
              <span className="job-detail-meta-chip">
                {LEVEL_LABELS[displayJobDetail.experienceLevel] ||
                  displayJobDetail.experienceLevel}
              </span>
              {displayJobDetail.countryLabel ? (
                <span className="job-detail-meta-chip">
                  {displayJobDetail.countryLabel}
                </span>
              ) : null}
              <span className="job-detail-meta-time">
                Posted {timeAgo(displayJobDetail.createdAt)}
              </span>
            </div>
          </div>

          <div className="job-detail-panel__body">
            <section className="job-detail-section">
              <h3 className="job-detail-section-title">About the role</h3>
              {detailLoading ? (
                <div className="job-detail-loading">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading full job description…
                </div>
              ) : descriptionHtml && !descriptionIsPreview ? (
                <div
                  className="job-detail-prose"
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
              ) : displayJobDetail.source === "adzuna" && adzunaEmbedSrc ? (
                <div className="job-detail-iframe-wrap">
                  <iframe
                    src={adzunaEmbedSrc}
                    title={`${displayJobDetail.title} full description`}
                    className="job-detail-iframe"
                  />
                </div>
              ) : displayJobDetail.description ? (
                <div className="job-detail-prose">
                  {renderJobDescription(displayJobDetail)}
                </div>
              ) : (
                <p className="job-detail-empty">No description provided.</p>
              )}
            </section>

            {displayJobDetail.source !== "adzuna" ? (
              <>
                <section className="job-detail-section">
                  <h3 className="job-detail-section-title">
                    Key responsibilities
                  </h3>
                  <div
                    className="job-detail-prose"
                    dangerouslySetInnerHTML={{
                      __html: displayJobDetail.responsibilities,
                    }}
                  />
                </section>
                <section className="job-detail-section">
                  <h3 className="job-detail-section-title">
                    Qualifications & requirements
                  </h3>
                  <div
                    className="job-detail-prose"
                    dangerouslySetInnerHTML={{
                      __html: displayJobDetail.requirements,
                    }}
                  />
                </section>
              </>
            ) : null}

            {displayJobDetail.skills.length > 0 ? (
              <section className="job-detail-section">
                <h3 className="job-detail-section-title">Required skills</h3>
                <div className="job-detail-skills">
                  {displayJobDetail.skills.map((skill) => (
                    <span key={skill} className="job-detail-skill">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            {displayJobDetail.company?.about ? (
              <section className="job-detail-section">
                <h3 className="job-detail-section-title">
                  About {displayJobDetail.company.name}
                </h3>
                <p className="job-detail-about">{displayJobDetail.company.about}</p>
              </section>
            ) : null}
          </div>
        </div>

        <div className="job-detail-panel__footer">{renderApplyAction()}</div>
      </div>
    );
  };

  return (
    <div className="jobs-page font-inter" style={{ fontFamily: "var(--font-inter)" }}>
      <section className="jobs-hero">
        <div className="jobs-hero-inner">
          <h1 className="font-manrope">
            Find your <em>dream job</em>
          </h1>
          <p className="jobs-hero-sub">
            Discover your next career at verified employers and top companies
            across Australia and beyond.
          </p>

          <div className="jobs-search-bar">
            <div className="jobs-search-field">
              <Search className="h-5 w-5 shrink-0 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  searchQuery ? "" : `Job title or keyword — ${currentPlaceholderText}`
                }
              />
            </div>
            <div className="jobs-search-field">
              <MapPin className="h-5 w-5 shrink-0 text-slate-400" />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="City or region"
              />
            </div>
            <button type="button" className="jobs-search-btn">
              Search
            </button>
          </div>

          <p className="jobs-popular">
            Popular:
            {POPULAR_KEYWORDS.map((kw, i) => (
              <span key={kw}>
                {i > 0 ? ", " : " "}
                <button type="button" onClick={() => setSearchQuery(kw)}>
                  {kw}
                </button>
              </span>
            ))}
          </p>
        </div>
      </section>

      <div className="jobs-layout">
        {!displayJobDetail ? (
        <div className="jobs-mobile-filter-bar lg:hidden">
          <span className="text-sm font-bold text-slate-900">
            {filteredJobs.length} jobs found
          </span>
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="inline-flex items-center gap-2 rounded-lg border border-[#4640de]/30 bg-[#4640de]/10 px-3 py-1.5 text-xs font-bold text-[#4640de]"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>
        ) : null}

        <aside
          className={`jobs-sidebar ${
            displayJobDetail
              ? "hidden lg:block"
              : isMobileFilterOpen
                ? "block"
                : "hidden lg:block"
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">Filters</h3>
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-bold text-[#4640de] hover:underline"
            >
              Reset all
            </button>
          </div>

          <div className="jobs-filter-section">
            <button
              type="button"
              className="jobs-filter-toggle"
              onClick={() => toggleFilterSection("country")}
            >
              Country
              {openFilters.country ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>
            {openFilters.country ? (
              <div className="jobs-filter-options">
                <label className="jobs-filter-option">
                  <input
                    type="radio"
                    name="country"
                    checked={selectedCountry === "all"}
                    onChange={() => setSelectedCountry("all")}
                  />
                  All countries
                </label>
                {(countryOptions.length
                  ? countryOptions
                  : [
                      { code: "au", label: "Australia", flag: "🇦🇺" },
                      { code: "us", label: "USA", flag: "🇺🇸" },
                      { code: "gb", label: "UK", flag: "🇬🇧" },
                      { code: "nz", label: "New Zealand", flag: "🇳🇿" },
                      { code: "ca", label: "Canada", flag: "🇨🇦" },
                      { code: "sg", label: "Singapore", flag: "🇸🇬" },
                    ]
                ).map((c) => (
                  <label key={c.code} className="jobs-filter-option">
                    <input
                      type="radio"
                      name="country"
                      checked={selectedCountry === c.code}
                      onChange={() => setSelectedCountry(c.code)}
                    />
                    {c.flag} {c.label}
                  </label>
                ))}
              </div>
            ) : null}
          </div>

          <div className="jobs-filter-section">
            <button
              type="button"
              className="jobs-filter-toggle"
              onClick={() => toggleFilterSection("employment")}
            >
              Type of Employment
              {openFilters.employment ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>
            {openFilters.employment ? (
              <div className="jobs-filter-options">
                {jobTypes.map((type) => (
                  <label key={type} className="jobs-filter-option">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={() => toggleTypeFilter(type)}
                    />
                    {TYPE_LABELS[type] || type}
                    <span className="jobs-filter-count">
                      ({employmentCounts[type] || 0})
                    </span>
                  </label>
                ))}
              </div>
            ) : null}
          </div>

          <div className="jobs-filter-section">
            <button
              type="button"
              className="jobs-filter-toggle"
              onClick={() => toggleFilterSection("category")}
            >
              Categories
              {openFilters.category ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>
            {openFilters.category ? (
              <div className="jobs-filter-options max-h-48 overflow-y-auto">
                {categories.map((cat) => (
                  <label key={cat} className="jobs-filter-option">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(cat)}
                    />
                    {cat}
                  </label>
                ))}
              </div>
            ) : null}
          </div>

          <div className="jobs-filter-section">
            <button
              type="button"
              className="jobs-filter-toggle"
              onClick={() => toggleFilterSection("workModel")}
            >
              Work Model
              {openFilters.workModel ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>
            {openFilters.workModel ? (
              <div className="jobs-filter-options">
                {workModels.map((model) => (
                  <label key={model} className="jobs-filter-option">
                    <input
                      type="checkbox"
                      checked={selectedModels.includes(model)}
                      onChange={() => toggleModelFilter(model)}
                    />
                    {WORK_MODE_LABELS[model] || model}
                    <span className="jobs-filter-count">
                      ({workModeCounts[model] || 0})
                    </span>
                  </label>
                ))}
              </div>
            ) : null}
          </div>

          <div className="jobs-filter-section">
            <button
              type="button"
              className="jobs-filter-toggle"
              onClick={() => toggleFilterSection("level")}
            >
              Job Level
              {openFilters.level ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>
            {openFilters.level ? (
              <div className="jobs-filter-options">
                {experienceLevels.map((lvl) => (
                  <label key={lvl.value} className="jobs-filter-option">
                    <input
                      type="radio"
                      name="level"
                      checked={selectedLevel === lvl.value}
                      onChange={() => setSelectedLevel(lvl.value)}
                    />
                    {lvl.label}
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        </aside>

        <section className="min-w-0 flex-1">
            {adzunaCacheNote ? (
              <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                {adzunaCacheNote}
              </div>
            ) : null}
            {adzunaWarning ? (
              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Adzuna jobs need both keys in <code>.env</code>:{" "}
                <strong>ADZUNA_APP_ID</strong> + <strong>ADZUNA_API_KEY</strong>
                . Get Application ID from{" "}
                <a
                  href="https://developer.adzuna.com/admin/access_details"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold underline"
                >
                  Adzuna dashboard
                </a>
                . Stella jobs still show below.
              </div>
            ) : null}
            {loading ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-20 text-sm text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading jobs…
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                <Briefcase className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                <h3 className="mb-1 text-lg font-bold text-slate-900">
                  Couldn’t load jobs
                </h3>
                <p className="mb-4 text-xs text-slate-500">{error}</p>
                <button
                  type="button"
                  onClick={() => void loadJobs()}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-white"
                  style={{ background: "#4640de" }}
                >
                  Try again
                </button>
              </div>
            ) : (
              <>
                {displayJobDetail ? (
                  <div className="job-detail-mobile lg:hidden">
                    {renderJobDetailContent("mobile")}
                  </div>
                ) : null}

                {displayJobDetail ? (
                  <div
                    className="job-detail-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Job details"
                    onClick={() => setSelectedJobId(null)}
                  >
                    <div
                      className="job-detail-modal__panel"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {renderJobDetailContent("modal")}
                    </div>
                  </div>
                ) : null}

                <div
                  className={
                    displayJobDetail
                      ? "jobs-list-wrap jobs-list-wrap--hidden-mobile"
                      : "jobs-list-wrap"
                  }
                >
                <div className="jobs-results-header">
                  <div>
                    <h2 className="jobs-results-title font-manrope">All Jobs</h2>
                    <p className="jobs-results-meta">
                      Showing {sortedJobs.length} result
                      {sortedJobs.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="jobs-sort">
                    <span>Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(e.target.value as "relevant" | "newest")
                      }
                    >
                      <option value="relevant">Most relevant</option>
                      <option value="newest">Newest first</option>
                    </select>
                  </div>
                </div>

                {sortedJobs.length > 0 ? (
                  <div className="jobs-list">
                    {sortedJobs.map((job) => {
                      const isBookmarked = savedJobs.includes(job.id);
                      const companyName = job.company?.name || "Company";
                      const tags = [
                        TYPE_LABELS[job.employmentType] || job.employmentType,
                        job.category !== "General" ? job.category : null,
                        WORK_MODE_LABELS[job.workMode] || job.workMode,
                      ].filter(Boolean) as string[];

                      return (
                        <article
                          key={job.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedJobId(job.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedJobId(job.id);
                            }
                          }}
                          className="jobs-card"
                        >
                          <div className="jobs-card-logo">
                            {job.company?.logoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={job.company.logoUrl}
                                alt={`${companyName} logo`}
                              />
                            ) : (
                              companyName.trim().charAt(0).toUpperCase() || "J"
                            )}
                          </div>

                          <div className="jobs-card-body">
                            <h3 className="jobs-card-title font-manrope">
                              {job.title}
                            </h3>
                            <p className="jobs-card-company">
                              {companyName}
                              {job.source === "adzuna" ? " · Adzuna" : " · Stella"}
                              {" · "}
                              {job.location}
                              {job.countryLabel ? ` · ${job.countryLabel}` : ""}
                            </p>
                            <div className="jobs-card-tags">
                              {tags.map((tag, i) => (
                                <span
                                  key={`${job.id}-${tag}`}
                                  className={`jobs-tag ${tagVariant(i)}`}
                                >
                                  {tag}
                                </span>
                              ))}
                              <span className={`jobs-tag ${tagVariant(tags.length)}`}>
                                {LEVEL_LABELS[job.experienceLevel] ||
                                  job.experienceLevel}
                              </span>
                            </div>
                          </div>

                          <div className="jobs-card-actions">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleBookmark(job.id);
                              }}
                              disabled={!canSaveJob}
                              title={
                                canSaveJob ? "Save job" : "Sign in to save jobs"
                              }
                              className={`jobs-bookmark-btn ${isBookmarked ? "is-saved" : ""}`}
                              aria-label={
                                canSaveJob ? "Save job" : "Sign in to save jobs"
                              }
                            >
                              <Bookmark className="h-4 w-4 fill-current" />
                            </button>
                            {formatSalary(job) ? (
                              <p className="jobs-salary">{formatSalary(job)}</p>
                            ) : null}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedJobId(job.id);
                              }}
                              className="jobs-apply-btn"
                            >
                              Apply
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                    <Briefcase className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                    <h3 className="mb-1 text-lg font-bold text-slate-900">
                      No Jobs Found
                    </h3>
                    <p className="mb-4 text-xs text-slate-500">
                      Try adjusting filters or search, or check back later for
                      new postings.
                    </p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="rounded-xl px-4 py-2 text-xs font-bold text-white"
                      style={{ background: "#1e3a5f" }}
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
                </div>
              </>
            )}
          </section>
      </div>
    </div>
  );
}

export default function JobSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="jobs-page flex min-h-screen items-center justify-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading jobs…
        </div>
      }
    >
      <JobSearchInner />
    </Suspense>
  );
}
