"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
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
  Building2,
  Clock,
  Banknote,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { useAuth } from "@/app/components/AuthProvider";
import { useAuthModal } from "@/app/components/AuthModalProvider";
import {
  formatAdzunaDescriptionPreview,
  stripHtmlToText,
} from "@/lib/adzuna-description";
import { normalizeJobDescriptionHtml } from "@/lib/job-description-html";
import {
  rateSkillMatch,
  type SkillMatchResult,
  type SkillMatchTier,
} from "@/lib/skill-match";
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
  source?: "gemini" | "adzuna" | "himalayas" | string;
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

function formatSalaryDetail(job: JobItem): string | null {
  const min = Math.round(job.salaryMin);
  const max = Math.round(job.salaryMax);
  if (min <= 0 && max <= 0) return null;

  const periodWords: Record<string, string> = {
    hour: "per hour",
    day: "per day",
    week: "per week",
    year: "per year",
  };
  const period =
    periodWords[job.salaryPeriod] || `per ${job.salaryPeriod || "year"}`;
  const lo = min > 0 ? min : max;
  const hi = max > 0 ? max : min;
  const fmt = (n: number) => `$${n.toLocaleString()}`;

  if (lo === hi) return `${fmt(lo)} ${period}`;
  return `${fmt(lo)} – ${fmt(hi)} ${period}`;
}

function jobSourceLabel(source?: string) {
  if (source === "adzuna") return "Adzuna";
  if (source === "himalayas") return "Himalayas";
  if (source === "jooble") return "Jooble";
  return "Gemini";
}

/** Short plain-text blurb for job list cards */
function jobCardSnippet(job: JobItem, maxLen = 140): string | null {
  const raw = (job.description || "").trim();
  if (!raw) return null;
  const plain = stripHtmlToText(raw)
    .replace(/\s+/g, " ")
    .replace(/^[….\s]+/, "")
    .trim();
  if (plain.length < 24) return null;
  if (plain.length <= maxLen) return plain;
  const cut = plain.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 60 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function isExternalJobSource(source?: string) {
  return source === "adzuna" || source === "himalayas" || source === "jooble";
}

function renderJobDescription(job: JobItem) {
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

  if (job.source === "himalayas" || looksLikeHtml(raw)) {
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
        __html: normalizeJobDescriptionHtml(raw),
      }}
    />
  );
}

function looksLikeHtml(text: string) {
  return /<\/?[a-z][\s\S]*>/i.test(text);
}

function jobBrowseSortRank(job: JobItem): number {
  // Salary / payout first, then jobs without pay — every category/country
  return hasSalary(job) ? 0 : 1;
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
      <h3 className="job-skill-match-kicker">Job 2 Skill Match Rating</h3>

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

function SkillMatchMini({
  match,
  signedIn,
  hasProfileSkills,
  loading,
}: {
  match: SkillMatchResult | null;
  signedIn: boolean;
  hasProfileSkills: boolean;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="jobs-card-match jobs-card-match--muted">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Checking match…</span>
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="jobs-card-match jobs-card-match--muted">
        <span className="jobs-card-match-label">Skill match</span>
        <span className="jobs-card-match-title">Sign in to see rating</span>
      </div>
    );
  }

  if (!hasProfileSkills) {
    return (
      <div className="jobs-card-match jobs-card-match--muted">
        <span className="jobs-card-match-label">Skill match</span>
        <span className="jobs-card-match-title">Add skills to unlock</span>
      </div>
    );
  }

  if (!match) return null;

  return (
    <div
      className={`jobs-card-match jobs-card-match--${match.tier}`}
      aria-label={`${match.score}% skill match — ${match.title}`}
    >
      <div
        className={`jobs-card-match-ring jobs-card-match-ring--${match.tier}`}
        style={{ "--match-pct": `${match.score}` } as React.CSSProperties}
      >
        <span>{match.score}%</span>
      </div>
      <div className="jobs-card-match-copy">
        <span className="jobs-card-match-label">Skill match</span>
        <span className="jobs-card-match-title">{match.title}</span>
      </div>
    </div>
  );
}

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
  const { openAuth } = useAuthModal();

  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([]);
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adzunaWarning, setAdzunaWarning] = useState("");

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
  const [profileSkills, setProfileSkills] = useState<string[]>([]);
  const [profileSkillsLoaded, setProfileSkillsLoaded] = useState(false);
  const [openFilters, setOpenFilters] = useState({
    country: true,
    employment: true,
    category: true,
    workModel: true,
    level: true,
  });

  const selectedJobIdRef = useRef<string | null>(null);
  const detailHistoryRef = useRef(false);

  const isMobileJobsView = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 1023px)").matches;
  }, []);

  const openJobDetail = useCallback(
    (id: string) => {
      const hadDetailOpen = Boolean(selectedJobIdRef.current);

      setSelectedJobId(id);

      if (!isMobileJobsView()) return;

      if (hadDetailOpen && detailHistoryRef.current) {
        window.history.replaceState({ jobsDetail: true, jobId: id }, "");
        return;
      }

      window.history.pushState({ jobsDetail: true, jobId: id }, "");
      detailHistoryRef.current = true;
    },
    [isMobileJobsView],
  );

  const closeJobDetail = useCallback(
    (fromPopstate = false) => {
      if (!selectedJobIdRef.current) return;

      if (!fromPopstate && detailHistoryRef.current && isMobileJobsView()) {
        detailHistoryRef.current = false;
        setSelectedJobId(null);
        window.history.back();
        return;
      }

      detailHistoryRef.current = false;
      setSelectedJobId(null);
    },
    [isMobileJobsView],
  );

  selectedJobIdRef.current = selectedJobId;

  useEffect(() => {
    const onPopState = () => {
      if (!selectedJobIdRef.current) return;
      detailHistoryRef.current = false;
      setSelectedJobId(null);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    let compact = false;
    let ticking = false;

    const applyCompact = (next: boolean) => {
      if (next === compact) return;
      compact = next;
      document.documentElement.classList.toggle("jobs-search-compact", next);
    };

    const syncCompactSearch = () => {
      const y = window.scrollY;
      applyCompact(compact ? y > 24 : y > 72);
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(syncCompactSearch);
    };

    syncCompactSearch();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.documentElement.classList.remove("jobs-search-compact");
    };
  }, []);

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
    try {
      for (const key of Object.keys(sessionStorage)) {
        if (key.startsWith("gemini-jobs-browse-")) {
          sessionStorage.removeItem(key);
        }
      }
    } catch {
      /* ignore quota / private mode */
    }
  }, []);

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
      if (job.source === "adzuna" || job.source === "himalayas") {
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
      const dateDiff = () => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      };

      // Newest first = pure date order (user-selected sort wins)
      if (sortBy === "newest") {
        return dateDiff();
      }

      // Most relevant = salary jobs first, then AU priority, then newer
      const rankDiff = jobBrowseSortRank(a) - jobBrowseSortRank(b);
      if (rankDiff !== 0) return rankDiff;

      const auDiff = australiaJobPriority(a) - australiaJobPriority(b);
      if (auDiff !== 0) return auDiff;

      return dateDiff();
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
    if (!selectedJobIdRef.current) return;
    closeJobDetail();
  }, [
    searchQuery,
    selectedCategory,
    selectedLevel,
    selectedTypes,
    selectedModels,
    selectedCompanyId,
    selectedCountry,
    locationQuery,
    closeJobDetail,
  ]);

  const activeJobDetail = useMemo(
    () => filteredJobs.find((job) => job.id === selectedJobId) || null,
    [filteredJobs, selectedJobId],
  );

  const displayJobDetail = enrichedJobDetail || activeJobDetail;

  const skillMatch = useMemo(() => {
    if (!displayJobDetail) return null;
    if (!user || user.role !== "user") return null;
    if (!profileSkills.length) return null;
    return rateSkillMatch(profileSkills, {
      skills: displayJobDetail.skills,
      title: displayJobDetail.title,
      category: displayJobDetail.category,
      description: descriptionHtml || displayJobDetail.description,
      requirements: displayJobDetail.requirements,
    });
  }, [displayJobDetail, user, profileSkills, descriptionHtml]);

  const cardSkillMatches = useMemo(() => {
    const map = new Map<string, SkillMatchResult>();
    if (!user || user.role !== "user" || !profileSkills.length) return map;
    for (const job of sortedJobs) {
      map.set(
        job.id,
        rateSkillMatch(profileSkills, {
          skills: job.skills,
          title: job.title,
          category: job.category,
          description: job.description,
          requirements: job.requirements,
        }),
      );
    }
    return map;
  }, [sortedJobs, user, profileSkills]);

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
      if (e.key === "Escape") closeJobDetail();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [displayJobDetail, closeJobDetail]);

  useEffect(() => {
    if (!selectedJobId) return;
    if (window.matchMedia("(max-width: 1023px)").matches) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [selectedJobId]);

  const renderApplyAction = () => {
    if (!displayJobDetail) return null;
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
      <Link
        href={user?.role === "user" ? "/dashboard/seeker/jobs" : "#"}
        className="job-detail-apply-btn"
        onClick={(e) => {
          if (user?.role !== "user") {
            e.preventDefault();
            openAuth({ mode: "login", role: "user" });
          }
        }}
      >
        Apply
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
                  title={canSaveJob ? "Save job" : "Sign in to save jobs"}
                  className={`job-detail-icon-btn ${
                    savedJobs.includes(displayJobDetail.id) ? "is-saved" : ""
                  }`}
                  aria-label={canSaveJob ? "Save job" : "Sign in to save jobs"}
                >
                  <Bookmark className="h-4 w-4 fill-current" />
                </button>
                <button
                  type="button"
                  onClick={() => closeJobDetail()}
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
                onClick={() => closeJobDetail()}
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
                <h2 className="job-detail-title">{displayJobDetail.title}</h2>
              </div>
            </div>

            <ul className="job-detail-facts">
              <li className="job-detail-fact">
                <MapPin className="job-detail-fact-icon" aria-hidden />
                <span>
                  {displayJobDetail.location}
                  {displayJobDetail.workMode
                    ? ` (${WORK_MODE_LABELS[displayJobDetail.workMode] || displayJobDetail.workMode})`
                    : ""}
                </span>
              </li>
              {displayJobDetail.category ? (
                <li className="job-detail-fact">
                  <Building2 className="job-detail-fact-icon" aria-hidden />
                  <span>
                    {displayJobDetail.category}
                    {LEVEL_LABELS[displayJobDetail.experienceLevel]
                      ? ` · ${LEVEL_LABELS[displayJobDetail.experienceLevel]}`
                      : ""}
                  </span>
                </li>
              ) : null}
              <li className="job-detail-fact">
                <Clock className="job-detail-fact-icon" aria-hidden />
                <span>
                  {TYPE_LABELS[displayJobDetail.employmentType] ||
                    displayJobDetail.employmentType ||
                    "Full time"}
                </span>
              </li>
              <li className="job-detail-fact">
                <Banknote className="job-detail-fact-icon" aria-hidden />
                <span>
                  {formatSalaryDetail(displayJobDetail) ||
                    "Salary not disclosed"}
                </span>
              </li>
            </ul>

            <p className="job-detail-posted">
              Posted {timeAgo(displayJobDetail.createdAt)}
              {displayJobDetail.countryLabel
                ? ` · ${displayJobDetail.countryLabel}`
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
              ) : descriptionHtml && !descriptionIsPreview ? (
                <div
                  className="job-detail-prose"
                  dangerouslySetInnerHTML={{
                    __html: normalizeJobDescriptionHtml(descriptionHtml),
                  }}
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
                renderJobDescription(displayJobDetail)
              ) : (
                <p className="job-detail-empty">No description provided.</p>
              )}
              {displayJobDetail.source === "himalayas" ? (
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
            </section>

            {displayJobDetail.source !== "adzuna" &&
            displayJobDetail.source !== "himalayas" ? (
              <>
                <section className="job-detail-section">
                  <h3 className="job-detail-section-title">
                    Key responsibilities
                  </h3>
                  <div
                    className="job-detail-prose"
                    dangerouslySetInnerHTML={{
                      __html: normalizeJobDescriptionHtml(
                        displayJobDetail.responsibilities,
                      ),
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
                      __html: normalizeJobDescriptionHtml(
                        displayJobDetail.requirements,
                      ),
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
            ) : skillMatch &&
              (skillMatch.matchedSkills.length > 0 ||
                skillMatch.missingSkills.length > 0) ? (
              <section className="job-detail-section">
                <h3 className="job-detail-section-title">Skills</h3>
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

            {displayJobDetail.company?.about ? (
              <section className="job-detail-section">
                <h3 className="job-detail-section-title">
                  About {displayJobDetail.company.name}
                </h3>
                <p className="job-detail-about">
                  {displayJobDetail.company.about}
                </p>
              </section>
            ) : null}
          </div>
        </div>

        <div className="job-detail-panel__footer">{renderApplyAction()}</div>
      </div>
    );
  };

  return (
    <div
      className="jobs-page font-inter"
      style={
        {
          "--jobs-primary": "#0000B8",
          "--jobs-primary-hover": "#00009A",
          fontFamily: "var(--font-inter)",
        } as React.CSSProperties
      }
    >
      <div
        className="jobs-search-fixed"
        style={{ background: "#0000B8" }}
      >
        <div className="jobs-search-fixed-inner">
          <div className="jobs-search-bar">
            <div className="jobs-search-field">
              <Search className="h-5 w-5 shrink-0 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                tabIndex={-1}
                placeholder={
                  searchQuery
                    ? ""
                    : `Job title or keyword — ${currentPlaceholderText}`
                }
              />
            </div>
            <div className="jobs-search-field">
              <MapPin className="h-5 w-5 shrink-0 text-slate-400" />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                tabIndex={-1}
                placeholder="City or region"
              />
            </div>
            <button
              type="button"
              className="jobs-search-btn"
              tabIndex={-1}
              style={{ background: "#0000B8" }}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <section
        className="jobs-hero"
        style={{
          background: "#0000B8",
          borderBottom: "1px solid #0000B8",
        }}
      >
        <div className="jobs-hero-inner">
          <div className="jobs-hero-intro">
            <h1 className="font-manrope" style={{ color: "#ffffff" }}>
              Find your <em style={{ color: "#ffffff" }}>dream job</em>
            </h1>
            <p
              className="jobs-hero-sub"
              style={{ color: "rgba(255, 255, 255, 0.86)" }}
            >
              Discover your next career at verified employers and top companies
              across Australia and beyond.
            </p>
          </div>

          <div className="jobs-search-bar">
            <div className="jobs-search-field">
              <Search className="h-5 w-5 shrink-0 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  searchQuery
                    ? ""
                    : `Job title or keyword — ${currentPlaceholderText}`
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
            <button
              type="button"
              className="jobs-search-btn"
              style={{ background: "#0000B8" }}
            >
              Search
            </button>
          </div>

          <p className="jobs-popular">
            Popular:
            {POPULAR_KEYWORDS.map((kw, i) => (
              <span key={kw}>
                {i > 0 ? ", " : " "}
                <button
                  type="button"
                  onClick={() => setSearchQuery(kw)}
                  style={{ color: "#ffffff" }}
                >
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
              className="inline-flex items-center gap-2 rounded-lg border border-[#0000FF]/30 bg-[#0000FF]/10 px-3 py-1.5 text-xs font-bold text-[#0000FF]"
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
              className="text-xs font-bold text-[#0f2744] hover:underline"
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
              <div className="jobs-filter-options jobs-filter-options--scroll">
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
          {adzunaWarning ? (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Adzuna jobs need both keys in <code>.env</code>:{" "}
              <strong>ADZUNA_APP_ID</strong> + <strong>ADZUNA_API_KEY</strong>.
              Get Application ID from{" "}
              <a
                href="https://developer.adzuna.com/admin/access_details"
                target="_blank"
                rel="noreferrer"
                className="font-semibold underline"
              >
                Adzuna dashboard
              </a>
              . Gemini Education and Careers jobs still show below.
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
                style={{ background: "#0000FF" }}
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
                  onClick={() => closeJobDetail()}
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
                    <h2 className="jobs-results-title font-manrope">
                      All Jobs
                    </h2>
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
                      const snippet = jobCardSnippet(job);
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
                          onClick={() => openJobDetail(job.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              openJobDetail(job.id);
                            }
                          }}
                          className="jobs-card"
                        >
                          <div className="jobs-card-main">
                            <div className="jobs-card-logo">
                              {job.company?.logoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={job.company.logoUrl}
                                  alt={`${companyName} logo`}
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
                              {snippet ? (
                                <p className="jobs-card-snippet">{snippet}</p>
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
                                <span
                                  className={`jobs-tag ${tagVariant(tags.length)}`}
                                >
                                  {LEVEL_LABELS[job.experienceLevel] ||
                                    job.experienceLevel}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="jobs-card-divider" aria-hidden="true" />

                          <div className="jobs-card-center">
                            <SkillMatchMini
                              match={cardSkillMatches.get(job.id) || null}
                              signedIn={Boolean(user?.role === "user")}
                              hasProfileSkills={profileSkills.length > 0}
                              loading={
                                authLoading ||
                                (Boolean(user?.role === "user") &&
                                  !profileSkillsLoaded)
                              }
                            />
                          </div>

                          <div className="jobs-card-divider" aria-hidden="true" />

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
                            ) : (
                              <p className="jobs-salary jobs-salary--empty">
                                Salary not listed
                              </p>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openJobDetail(job.id);
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
                      style={{ background: "#0000FF" }}
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
