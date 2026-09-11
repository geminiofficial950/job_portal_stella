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
import BrandLogo from "@/app/components/BrandLogo";
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
  browseCacheKey,
  getClientBrowseCache,
  setClientBrowseCache,
} from "@/lib/client-browse-cache";
import SignInMenu from "@/app/components/SignInMenu";
import LocationSuggestInput from "@/app/components/LocationSuggestInput";
import KeywordSuggestInput from "@/app/components/KeywordSuggestInput";
import JobsSeekFilters, {
  jobMatchesPayRange,
  type PayPeriod,
} from "@/app/components/JobsSeekFilters";
import { locationSearchValue, jobMatchesLocationQuery } from "@/lib/auLocations";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
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
import { jobOffersVisaSponsorship } from "@/lib/visa-sponsorship";
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
  source?: "gemini" | "adzuna" | "himalayas" | "jooble" | string;
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

/** First paint + infinite scroll chunk size */
const JOBS_PAGE_SIZE = 24;

function hasSalary(job: JobItem) {
  return job.salaryMin > 0 || job.salaryMax > 0;
}

function isAustraliaJob(job: JobItem) {
  if (job.country === "au") return true;
  const hay = `${job.location || ""} ${job.countryLabel || ""}`.toLowerCase();
  return (
    hay.includes("australia") ||
    /\b(nsw|vic|qld|sa|wa|tas|act|nt)\b/.test(hay) ||
    hay.includes("sydney") ||
    hay.includes("melbourne") ||
    hay.includes("brisbane") ||
    hay.includes("perth") ||
    hay.includes("adelaide")
  );
}

function normalizeJobItem(job: JobItem): JobItem {
  return {
    ...job,
    title: job.title || "",
    description: job.description || "",
    requirements: job.requirements || "",
    responsibilities: job.responsibilities || "",
    location: job.location || "",
    category: job.category || "",
    employmentType: job.employmentType || "",
    workMode: job.workMode || "",
    experienceLevel: job.experienceLevel || "",
    skills: Array.isArray(job.skills) ? job.skills : [],
    benefits: job.benefits || "",
    country: job.country || (isAustraliaJob(job) ? "au" : undefined),
  };
}

/** Local filter over a seeded browse list — used when API search returns empty. */
function jobMatchesTextQuery(job: JobItem, q: string, loc: string): boolean {
  const query = q.trim().toLowerCase();
  const location = loc.trim();

  if (location && !jobMatchesLocationQuery(job.location || "", location)) {
    return false;
  }

  if (!query) return true;

  const hay = [
    job.title,
    job.category,
    job.company?.name,
    job.location,
    ...(Array.isArray(job.skills) ? job.skills : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (hay.includes(query)) return true;

  const tokens = query.split(/[\s/&,+-]+/).filter((t) => t.length >= 2);
  if (tokens.length === 0) return true;
  const hits = tokens.filter((t) => hay.includes(t)).length;
  return hits >= Math.ceil(tokens.length * 0.6);
}

function filterJobsBySearch(jobs: JobItem[], q: string, loc: string): JobItem[] {
  if (!q.trim() && !loc.trim()) return jobs;
  return jobs.filter((job) => jobMatchesTextQuery(job, q, loc));
}

/** Prefer jobs with fuller posting content (description, skills, etc.) */
function jobInfoScore(job: JobItem): number {
  let score = 0;
  const desc = stripHtmlToText(job.description || "")
    .replace(/\s+/g, " ")
    .trim();
  score += Math.min(desc.length, 3500);

  const requirements = stripHtmlToText(job.requirements || "")
    .replace(/\s+/g, " ")
    .trim();
  score += Math.min(requirements.length, 1200);

  const responsibilities = stripHtmlToText(job.responsibilities || "")
    .replace(/\s+/g, " ")
    .trim();
  score += Math.min(responsibilities.length, 1200);

  if (Array.isArray(job.skills) && job.skills.length > 0) {
    score += Math.min(job.skills.length, 20) * 60;
  }
  if ((job.benefits || "").trim()) score += 180;
  if (job.category) score += 40;
  if (job.experienceLevel) score += 30;
  if (job.company?.about) score += 80;
  if (job.applyUrl) score += 20;
  return score;
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

/** Keep card location inside column — max 2 lines */
function formatCardLocation(location: string): React.ReactNode {
  const raw = location.trim().replace(/\s+/g, " ");
  if (!raw) return "Location not listed";

  let line1 = raw;
  let line2 = "";

  const commaIdx = raw.indexOf(",");
  if (commaIdx > 0 && commaIdx < raw.length - 1) {
    line1 = raw.slice(0, commaIdx).trim();
    line2 = raw.slice(commaIdx + 1).trim();
  } else {
    const sep = raw.match(/\s*[·•|]\s*/);
    if (sep && sep.index != null && sep.index > 0) {
      line1 = raw.slice(0, sep.index).trim();
      line2 = raw.slice(sep.index + sep[0].length).trim();
    } else {
      // Long single string: wrap near midpoint at a space
      if (raw.length > 28) {
        const mid = Math.floor(raw.length / 2);
        const space = raw.lastIndexOf(" ", mid + 8);
        const at = space > 8 ? space : mid;
        line1 = raw.slice(0, at).trim();
        line2 = raw.slice(at).trim();
      }
    }
  }

  if (!line2) return line1;

  return (
    <>
      {line1}
      <br />
      {line2}
    </>
  );
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

  if (
    job.source === "himalayas" ||
    job.source === "jooble" ||
    looksLikeHtml(raw)
  ) {
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

/** High-volume search terms that typically return many board listings. */
const POPULAR_KEYWORD_FALLBACKS = [
  "Developer",
  "Engineer",
  "Manager",
  "Sales",
  "Analyst",
  "Remote",
  "Marketing",
  "Customer Service",
];

/** Multi-word roles matched in job titles (longest first). */
const POPULAR_ROLE_PHRASES = [
  "software engineer",
  "software developer",
  "project manager",
  "product manager",
  "account manager",
  "business analyst",
  "data analyst",
  "data scientist",
  "customer service",
  "customer support",
  "registered nurse",
  "administrative assistant",
  "marketing manager",
  "sales manager",
  "frontend developer",
  "backend developer",
  "full stack",
  "full-stack",
];

const POPULAR_SKIP = new Set([
  "general",
  "other",
  "n/a",
  "full-time",
  "part-time",
  "contract",
  "casual",
  "onsite",
  "hybrid",
]);

function titleCaseTag(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Build Popular tags from loaded jobs so chips point at roles with real volume. */
function derivePopularKeywords(
  jobs: JobItem[],
  limit = 6,
): { label: string; count: number }[] {
  const counts = new Map<string, { label: string; count: number }>();

  const bump = (raw: string, weight = 1) => {
    const cleaned = raw.replace(/\s+jobs$/i, "").trim();
    if (!cleaned || cleaned.length < 2) return;
    const key = cleaned.toLowerCase();
    if (POPULAR_SKIP.has(key)) return;
    const prev = counts.get(key);
    if (prev) {
      prev.count += weight;
      return;
    }
    counts.set(key, { label: titleCaseTag(cleaned), count: weight });
  };

  for (const job of jobs) {
    if (job.category) bump(job.category, 2);
    if (job.workMode?.toLowerCase() === "remote") bump("Remote", 1);

    const title = (job.title || "").toLowerCase();
    let matchedPhrase = false;
    for (const phrase of POPULAR_ROLE_PHRASES) {
      if (title.includes(phrase)) {
        bump(phrase, 3);
        matchedPhrase = true;
        break;
      }
    }

    if (!matchedPhrase) {
      for (const fallback of POPULAR_KEYWORD_FALLBACKS) {
        const needle = fallback.toLowerCase();
        if (title.includes(needle)) {
          bump(fallback, 2);
          break;
        }
      }
    }

    for (const skill of job.skills.slice(0, 4)) {
      if (skill && skill.length >= 2 && skill.length <= 24) bump(skill, 1);
    }
  }

  const ranked = [...counts.values()]
    .filter((item) => item.count >= 2)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  if (ranked.length >= 3) {
    return ranked.slice(0, limit);
  }

  // Not enough signal yet — use high-volume defaults, prefer ones already seen.
  const seen = new Set(ranked.map((r) => r.label.toLowerCase()));
  const merged = [...ranked];
  for (const label of POPULAR_KEYWORD_FALLBACKS) {
    if (merged.length >= limit) break;
    if (seen.has(label.toLowerCase())) continue;
    const hit = counts.get(label.toLowerCase());
    merged.push({ label, count: hit?.count ?? 0 });
    seen.add(label.toLowerCase());
  }
  return merged.slice(0, limit);
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
        <span className="jobs-card-match-title">Sign in to see rating</span>
      </div>
    );
  }

  if (!hasProfileSkills) {
    return (
      <div className="jobs-card-match jobs-card-match--muted">
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
        loading="lazy"
        decoding="async"
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

type InitialBrowse = {
  success?: boolean;
  jobs?: JobItem[];
  companies?: CompanyOption[];
  categories?: string[];
  countries?: CountryOption[];
  adzuna?: { configured?: boolean; error?: string };
};

function readSeedBrowse(
  initialBrowse: InitialBrowse | null | undefined,
  countryHint: string,
): InitialBrowse | null {
  if (
    initialBrowse?.success &&
    Array.isArray(initialBrowse.jobs) &&
    initialBrowse.jobs.length > 0
  ) {
    return initialBrowse;
  }

  const country = (countryHint || "au").trim().toLowerCase() || "au";
  const cached =
    getClientBrowseCache(browseCacheKey({ country, fast: true })) ||
    getClientBrowseCache(browseCacheKey({ country, fast: false })) ||
    getClientBrowseCache(browseCacheKey({ country: "au", fast: true }));

  if (!cached) return null;
  return {
    success: true,
    jobs: cached.jobs as JobItem[],
    companies: (cached.companies as CompanyOption[]) ?? [],
    categories: cached.categories ?? [],
    countries: (cached.countries as CountryOption[]) ?? [],
  };
}

function JobSearchInner({
  initialBrowse = null,
}: {
  initialBrowse?: InitialBrowse | null;
}) {
  const searchParams = useSearchParams();
  const companyFromUrl = searchParams.get("company")?.trim() || "";
  const qFromUrl = searchParams.get("q")?.trim() || "";
  const locationFromUrl =
    searchParams.get("location")?.trim() ||
    searchParams.get("suburb")?.trim() ||
    "";
  const countryFromUrl = searchParams.get("country")?.trim().toLowerCase() || "";
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { openAuth } = useAuthModal();

  const seedBrowse = readSeedBrowse(
    initialBrowse,
    countryFromUrl || "au",
  );
  const seedJobs = (seedBrowse?.jobs ?? []).map(normalizeJobItem);
  const hasSeedJobs = seedJobs.length > 0;
  const initialJobs = hasSeedJobs
    ? (() => {
        const matched = filterJobsBySearch(
          seedJobs,
          qFromUrl,
          locationFromUrl,
        );
        // Prefer matched results; if query is too narrow locally, keep seed
        // until the API responds so the list never flashes empty.
        return matched.length > 0 ? matched : seedJobs;
      })()
    : [];

  const [jobs, setJobs] = useState<JobItem[]>(initialJobs);
  const [popularSeedJobs, setPopularSeedJobs] = useState<JobItem[]>(seedJobs);
  const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>(() =>
    hasSeedJobs ? (seedBrowse?.companies ?? []) : [],
  );
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>(() =>
    hasSeedJobs ? (seedBrowse?.countries ?? []) : [],
  );
  const [categories, setCategories] = useState<string[]>(() =>
    hasSeedJobs
      ? ["All", ...((seedBrowse?.categories as string[]) ?? [])]
      : ["All"],
  );
  const [loading, setLoading] = useState(!hasSeedJobs);
  const [error, setError] = useState("");
  const [adzunaWarning, setAdzunaWarning] = useState("");
  const [applying, setApplying] = useState(false);
  const [visibleCount, setVisibleCount] = useState(JOBS_PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const searchReqIdRef = useRef(0);
  const jobsCountRef = useRef(initialJobs.length);
  const popularSeedRef = useRef<JobItem[]>(seedJobs);

  const [searchQuery, setSearchQuery] = useState(qFromUrl);
  const [filtersEnabled, setFiltersEnabled] = useState(
    Boolean(qFromUrl || locationFromUrl),
  );
  const [payPeriod, setPayPeriod] = useState<PayPeriod>("year");
  const [payMin, setPayMin] = useState("");
  const [payMax, setPayMax] = useState("");
  const [payFilterActive, setPayFilterActive] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedCompanyId, setSelectedCompanyId] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState(
    countryFromUrl || "au",
  );
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [enrichedJobDetail, setEnrichedJobDetail] = useState<JobItem | null>(
    null,
  );
  const [detailLoading, setDetailLoading] = useState(false);
  const [descriptionIsPreview, setDescriptionIsPreview] = useState(false);
  const [descriptionHtml, setDescriptionHtml] = useState("");
  const [locationQuery, setLocationQuery] = useState(locationFromUrl);
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

  const loadJobs = useCallback(
    async (opts?: { q?: string; location?: string; country?: string }) => {
      const reqId = ++searchReqIdRef.current;
      // Keep current list visible — never flash a blank loading screen when we
      // already have jobs (homepage cache / SSR seed / previous search).
      setLoading(jobsCountRef.current === 0);
      setError("");
      setVisibleCount(JOBS_PAGE_SIZE);

      const q = (opts?.q ?? searchQuery).trim();
      const loc = locationSearchValue(opts?.location ?? locationQuery);
      const country = (opts?.country ?? selectedCountry).trim() || "all";

      const buildParams = (fast?: boolean) => {
        const params = new URLSearchParams();
        if (fast) params.set("fast", "1");
        if (q) params.set("q", q);
        if (loc) params.set("location", loc);
        if (country && country !== "all") params.set("country", country);
        return params.toString();
      };

      const applyBrowsePayload = (data: {
        success?: boolean;
        jobs?: JobItem[];
        companies?: CompanyOption[];
        categories?: string[];
        countries?: CountryOption[];
        adzuna?: { configured?: boolean; error?: string };
      }) => {
        if (reqId !== searchReqIdRef.current) return;
        let nextJobs = (data.jobs ?? []).map(normalizeJobItem);

        // Never wipe a visible list with an empty API response — fall back to
        // filtering the seeded browse cache so homepage/popular search never
        // lands on a false "No Jobs Found".
        if (nextJobs.length === 0 && (q || loc)) {
          const pool =
            popularSeedRef.current.length > 0
              ? popularSeedRef.current
              : seedJobs;
          const fallback = filterJobsBySearch(pool, q, loc);
          if (fallback.length > 0) {
            nextJobs = fallback;
          } else if (jobsCountRef.current > 0) {
            // Keep whatever is already on screen — don't flash Not Found
            setLoading(false);
            return;
          }
        }

        jobsCountRef.current = nextJobs.length;
        setJobs(nextJobs);
        // Keep Popular tags seeded from broad browse results (lots of jobs).
        if (!q && !loc && nextJobs.length > 0) {
          setPopularSeedJobs(nextJobs);
          popularSeedRef.current = nextJobs;
          setClientBrowseCache(
            {
              success: true,
              jobs: nextJobs,
              companies: data.companies ?? [],
              categories: data.categories ?? [],
              countries: data.countries ?? [],
            },
            browseCacheKey({ country, fast: true }),
          );
        }
        if (data.companies) setCompanyOptions(data.companies);
        if (data.categories) {
          setCategories(["All", ...data.categories]);
        }
        if (data.countries?.length) setCountryOptions(data.countries);
        if (
          data.adzuna &&
          data.adzuna.configured === false &&
          data.adzuna.error
        ) {
          setAdzunaWarning(data.adzuna.error);
        } else if (data.adzuna) {
          setAdzunaWarning("");
        }
      };

      try {
        // Phase 1: fast sources for quick first paint
        const fastQs = buildParams(true);
        const fastRes = await fetch(
          `/api/jobs/browse${fastQs ? `?${fastQs}` : "?fast=1"}`,
        );
        const fastData = await fastRes.json();
        if (reqId !== searchReqIdRef.current) return;
        if (!fastRes.ok || !fastData.success) {
          throw new Error(fastData.message || "Failed to load jobs");
        }
        applyBrowsePayload(fastData);
        if (reqId === searchReqIdRef.current) setLoading(false);

        // Phase 2: full enrich in background (fallbacks + remaining sources)
        const fullQs = buildParams(false);
        void fetch(`/api/jobs/browse${fullQs ? `?${fullQs}` : ""}`)
          .then(async (res) => {
            const data = await res.json();
            if (reqId !== searchReqIdRef.current) return;
            if (!res.ok || !data.success) return;
            applyBrowsePayload(data);
          })
          .catch((err) => {
            console.warn("Background jobs enrich failed:", err);
          });
      } catch (err) {
        if (reqId !== searchReqIdRef.current) return;
        setError(err instanceof Error ? err.message : "Failed to load jobs");
        if (jobsCountRef.current === 0) setJobs([]);
        setLoading(false);
      }
    },
    [searchQuery, locationQuery, selectedCountry],
  );

  const runSearch = useCallback(() => {
    const q = searchQuery.trim();
    const locDisplay = locationQuery.trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (locDisplay) params.set("location", locDisplay);
    if (selectedCountry && selectedCountry !== "all") {
      params.set("country", selectedCountry);
    }
    const qs = params.toString();
    router.replace(qs ? `/jobs?${qs}` : "/jobs");
    setFiltersEnabled(true);
    void loadJobs({ q, location: locDisplay, country: selectedCountry });
  }, [searchQuery, locationQuery, selectedCountry, loadJobs, router]);

  useEffect(() => {
    // Seeded from SSR / homepage cache — show immediately, refine in background
    if (hasSeedJobs) {
      setLoading(false);
      void loadJobs({
        q: qFromUrl,
        location: locationFromUrl,
        country: countryFromUrl || selectedCountry,
      });
      return;
    }

    void loadJobs({
      q: qFromUrl,
      location: locationFromUrl,
      country: countryFromUrl || selectedCountry,
    });
    // Initial load only — search runs on Search click.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "user") {
      setSavedJobs([]);
      return;
    }

    let cancelled = false;
    fetch("/api/seeker/saved", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data.success) return;
        setSavedJobs(
          Array.isArray(data.jobIds)
            ? data.jobIds.map((id: unknown) => String(id))
            : [],
        );
      })
      .catch(() => {
        if (!cancelled) setSavedJobs([]);
      });

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const toggleBookmark = async (job: JobItem) => {
    if (!user) {
      openAuth({ mode: "login", role: "user" });
      return;
    }
    if (user.role !== "user") {
      openAuth({ mode: "login", role: "user" });
      return;
    }

    const isSaved = savedJobs.includes(job.id);
    setSavedJobs((prev) =>
      isSaved ? prev.filter((item) => item !== job.id) : [...prev, job.id],
    );

    try {
      if (isSaved) {
        const res = await fetch(
          `/api/seeker/saved?jobId=${encodeURIComponent(job.id)}&source=${encodeURIComponent(job.source || "board")}`,
          { method: "DELETE" },
        );
        const data = await res.json();
        if (!res.ok || !data.success) {
          setSavedJobs((prev) =>
            prev.includes(job.id) ? prev : [...prev, job.id],
          );
          toast.error(data.message || "Could not remove saved job");
        }
      } else {
        const res = await fetch("/api/seeker/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId: job.id,
            source: job.source || "board",
            title: job.title,
            company: job.company,
            companyName: job.company?.name || "",
            companyLogoUrl: job.company?.logoUrl || "",
            location: job.location || "",
            employmentType: job.employmentType || "",
            workMode: job.workMode || "",
            category: job.category || "",
            experienceLevel: job.experienceLevel || "",
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            salaryCurrency: job.salaryCurrency,
            salaryPeriod: job.salaryPeriod,
            applyUrl: job.applyUrl || "",
            description: job.description || "",
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setSavedJobs((prev) => prev.filter((item) => item !== job.id));
          toast.error(data.message || "Could not save job");
        } else {
          toast.success("Job saved");
        }
      }
    } catch {
      setSavedJobs((prev) =>
        isSaved
          ? prev.includes(job.id)
            ? prev
            : [...prev, job.id]
          : prev.filter((item) => item !== job.id),
      );
      toast.error("Could not update saved jobs");
    }
  };

  const canSaveJob = !authLoading && Boolean(user) && user?.role === "user";

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
    setPayPeriod("year");
    setPayMin("");
    setPayMax("");
    setPayFilterActive(false);
    setSelectedCategory("All");
    setSelectedLevel("All");
    setSelectedCompanyId("All");
    setSelectedCountry("all");
    router.replace("/jobs");
    void loadJobs({ q: "", location: "", country: "all" });
  };

  const matchesSelectedCountry = useCallback(
    (job: JobItem) => {
      if (selectedCountry === "all") return true;
      if (job.country && job.country === selectedCountry) return true;
      if (selectedCountry === "au" && isAustraliaJob(job)) return true;
      if (
        job.source === "adzuna" ||
        job.source === "himalayas" ||
        job.source === "jooble"
      ) {
        // External jobs without a country tag still pass AU via isAustraliaJob above
        return job.country === selectedCountry;
      }
      const loc = (job.location || "").toLowerCase();
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
      if (!jobMatchesPayRange(job, payPeriod, payMin, payMax, payFilterActive)) {
        return false;
      }
      return true;
    });
  }, [
    jobs,
    selectedCategory,
    selectedLevel,
    selectedTypes,
    selectedModels,
    selectedCompanyId,
    payPeriod,
    payMin,
    payMax,
    payFilterActive,
    matchesSelectedCountry,
  ]);

  const sortedJobs = useMemo(() => {
    const list = [...filteredJobs];
    list.sort((a, b) => {
      const dateDiff = () => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      };

      // Jobs with pay always float to the top
      const payDiff = Number(hasSalary(b)) - Number(hasSalary(a));
      if (payDiff !== 0) return payDiff;

      // Newest first = date within pay/no-pay groups
      if (sortBy === "newest") {
        return dateDiff();
      }

      // Most relevant: Australia → richer detail → newer
      const auDiff = Number(isAustraliaJob(b)) - Number(isAustraliaJob(a));
      if (auDiff !== 0) return auDiff;

      const infoDiff = jobInfoScore(b) - jobInfoScore(a);
      if (infoDiff !== 0) return infoDiff;

      return dateDiff();
    });
    return list;
  }, [filteredJobs, sortBy]);

  const visibleJobs = useMemo(
    () => sortedJobs.slice(0, visibleCount),
    [sortedJobs, visibleCount],
  );

  const popularKeywords = useMemo(
    () =>
      derivePopularKeywords(
        popularSeedJobs.length > 0 ? popularSeedJobs : jobs,
        6,
      ),
    [popularSeedJobs, jobs],
  );

  const keywordSuggestTerms = useMemo(() => {
    const source = popularSeedJobs.length > 0 ? popularSeedJobs : jobs;
    const terms: string[] = [...categories.filter((c) => c !== "All")];
    for (const job of source.slice(0, 120)) {
      if (job.title) terms.push(job.title);
      if (job.category) terms.push(job.category);
      for (const skill of (job.skills || []).slice(0, 3)) terms.push(skill);
    }
    for (const item of popularKeywords) terms.push(item.label);
    return terms;
  }, [popularSeedJobs, jobs, categories, popularKeywords]);

  useEffect(() => {
    setVisibleCount(JOBS_PAGE_SIZE);
  }, [
    selectedCategory,
    selectedLevel,
    selectedTypes,
    selectedModels,
    selectedCompanyId,
    selectedCountry,
    payPeriod,
    payMin,
    payMax,
    payFilterActive,
    sortBy,
  ]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) return;
    if (visibleCount >= sortedJobs.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        setVisibleCount((prev) =>
          Math.min(prev + JOBS_PAGE_SIZE, sortedJobs.length),
        );
      },
      { root: null, rootMargin: "400px 0px", threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visibleCount, sortedJobs.length, loading]);

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
    for (const job of visibleJobs) {
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
  }, [visibleJobs, user, profileSkills]);

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
      ? `/api/jobs/adzuna-embed?id=${encodeURIComponent(displayJobDetail.id)}&url=${encodeURIComponent(displayJobDetail.applyUrl)}&title=${encodeURIComponent(displayJobDetail.title)}&preview=${encodeURIComponent(displayJobDetail.description || "")}`
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

    const isStellaJob = /^[a-f\d]{24}$/i.test(displayJobDetail.id);

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
              ? { jobId: displayJobDetail.id }
              : {
                  jobId: displayJobDetail.id,
                  boardJob: {
                    id: displayJobDetail.id,
                    source: displayJobDetail.source || "board",
                    title: displayJobDetail.title,
                    companyName: displayJobDetail.company?.name || "",
                    companyLogoUrl: displayJobDetail.company?.logoUrl || "",
                    location: displayJobDetail.location || "",
                    employmentType: displayJobDetail.employmentType || "",
                    workMode: displayJobDetail.workMode || "",
                    category: displayJobDetail.category || "",
                    experienceLevel: displayJobDetail.experienceLevel || "",
                    salaryMin: displayJobDetail.salaryMin,
                    salaryMax: displayJobDetail.salaryMax,
                    salaryCurrency: displayJobDetail.salaryCurrency,
                    salaryPeriod: displayJobDetail.salaryPeriod,
                    applyUrl: displayJobDetail.applyUrl || "",
                    description: displayJobDetail.description || "",
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
            closeJobDetail();
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
                  onClick={() => {
                    if (!displayJobDetail) return;
                    void toggleBookmark(displayJobDetail);
                  }}
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
            {jobOffersVisaSponsorship(displayJobDetail) ? (
              <p className="mt-3">
                <span className="jobs-tag jobs-tag--visa">Visa Sponsorship</span>
              </p>
            ) : null}

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
              ) : descriptionHtml ? (
                <div
                  className="job-detail-prose"
                  dangerouslySetInnerHTML={{
                    __html: normalizeJobDescriptionHtml(descriptionHtml),
                  }}
                />
              ) : displayJobDetail.description ? (
                renderJobDescription(displayJobDetail)
              ) : displayJobDetail.source === "adzuna" && adzunaEmbedSrc ? (
                <div className="job-detail-iframe-wrap">
                  <iframe
                    src={adzunaEmbedSrc}
                    title={`${displayJobDetail.title} full description`}
                    className="job-detail-iframe"
                  />
                </div>
              ) : (
                <p className="job-detail-empty">No description provided.</p>
              )}
              {displayJobDetail.source === "adzuna" &&
              descriptionIsPreview &&
              displayJobDetail.applyUrl ? (
                <div className="job-detail-external-cta">
                  <p>
                    Showing the Adzuna preview. Open the original listing for
                    the complete posting if needed.
                  </p>
                  <a
                    href={displayJobDetail.applyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="job-detail-external-cta__btn"
                  >
                    Open full job on Adzuna
                  </a>
                </div>
              ) : null}
              {displayJobDetail.source === "jooble" &&
              displayJobDetail.applyUrl ? (
                <div className="job-detail-external-cta">
                  <p>
                    Jooble only shares a short preview here. Open the full
                    posting for complete details.
                  </p>
                  <a
                    href={displayJobDetail.applyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="job-detail-external-cta__btn"
                  >
                    View full description on Jooble
                  </a>
                </div>
              ) : null}
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
              {displayJobDetail.source === "jooble" ? (
                <p className="job-detail-source-note">
                  Aggregated via{" "}
                  <a href="https://jooble.org" target="_blank" rel="noreferrer">
                    Jooble
                  </a>
                </p>
              ) : null}
            </section>

            {displayJobDetail.source !== "adzuna" &&
            displayJobDetail.source !== "himalayas" &&
            displayJobDetail.source !== "jooble" ? (
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
          "--jobs-primary": "#00082C",
          "--jobs-primary-hover": "#00061F",
          fontFamily: "var(--font-inter)",
        } as React.CSSProperties
      }
    >
      <div className="jobs-search-fixed">
        <div className="jobs-search-fixed-row">
          <Link href="/" className="jobs-search-fixed-logo" tabIndex={-1}>
              <BrandLogo />
          </Link>

          <div className="jobs-search-fixed-inner">
            <div className="jobs-search-bar">
              <div className="jobs-search-field jobs-search-field--suggest">
                <KeywordSuggestInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSelect={setSearchQuery}
                  extraTerms={keywordSuggestTerms}
                  tabIndex={-1}
                  placeholder={
                    searchQuery
                      ? ""
                      : `Job title or keyword — ${currentPlaceholderText}`
                  }
                  leading={
                    <Search className="h-5 w-5 shrink-0 text-slate-400" />
                  }
                />
              </div>
              <div className="jobs-search-field jobs-search-field--suggest">
                <LocationSuggestInput
                  value={locationQuery}
                  onChange={setLocationQuery}
                  onSelect={setLocationQuery}
                  tabIndex={-1}
                  placeholder="Suburb / postcode"
                  leading={
                    <MapPin className="h-5 w-5 shrink-0 text-slate-400" />
                  }
                />
              </div>
              <button
                type="button"
                className="jobs-search-btn"
                tabIndex={-1}
                style={{ background: "#00082C" }}
                onClick={runSearch}
                disabled={loading}
              >
                {loading ? "Searching…" : "Search"}
              </button>
            </div>
          </div>

          <div className="jobs-search-fixed-menu">
            <Link href="/jobs" className="jobs-search-fixed-nav" tabIndex={-1}>
              Find Jobs
            </Link>
            <SignInMenu variant="solid" tone="light" />
          </div>
        </div>
      </div>

      <section className="jobs-hero">
        <div className="jobs-hero-inner">
          <div className="jobs-hero-intro">
            <h1 className="font-manrope">
              Find your <em>dream job</em>
            </h1>
            <p className="jobs-hero-sub">
              Discover your next career at verified employers and top companies
              across Australia and beyond.
            </p>
          </div>

          <div className="jobs-hero-search-row">
            <div className="jobs-search-bar">
              <div className="jobs-search-field jobs-search-field--suggest">
                <KeywordSuggestInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSelect={setSearchQuery}
                  extraTerms={keywordSuggestTerms}
                  placeholder={
                    searchQuery
                      ? ""
                      : `Job title or keyword — ${currentPlaceholderText}`
                  }
                  leading={
                    <Search className="h-5 w-5 shrink-0 text-slate-400" />
                  }
                />
              </div>
              <div className="jobs-search-field jobs-search-field--suggest">
                <LocationSuggestInput
                  value={locationQuery}
                  onChange={setLocationQuery}
                  onSelect={setLocationQuery}
                  placeholder="Suburb / postcode"
                  leading={
                    <MapPin className="h-5 w-5 shrink-0 text-slate-400" />
                  }
                />
              </div>
              <button
                type="button"
                className="jobs-search-btn"
                style={{ background: "#00082C" }}
                onClick={runSearch}
                disabled={loading}
              >
                {loading ? "Searching…" : "Search"}
              </button>
            </div>
          </div>

          {filtersEnabled ? (
            <div className="jobs-seek-filters-under-search">
              <JobsSeekFilters
                enabled
                payPeriod={payPeriod}
                payMin={payMin}
                payMax={payMax}
                selectedTypes={selectedTypes}
                selectedModels={selectedModels}
                onPayPeriodChange={(period) => {
                  setPayPeriod(period);
                  setPayFilterActive(true);
                }}
                onPayMinChange={(value) => {
                  setPayMin(value);
                  setPayFilterActive(true);
                }}
                onPayMaxChange={(value) => {
                  setPayMax(value);
                  setPayFilterActive(true);
                }}
                onToggleType={toggleTypeFilter}
                onToggleModel={toggleModelFilter}
                payFilterActive={payFilterActive}
              />
            </div>
          ) : (
            <p className="jobs-popular">
              Popular:
              {popularKeywords.map((item, i) => (
                <span key={item.label}>
                  {i > 0 ? ", " : " "}
                  <button
                    type="button"
                    onClick={() => setSearchQuery(item.label)}
                  >
                    {item.label}
                  </button>
                </span>
              ))}
            </p>
          )}
        </div>
      </section>

      <div className="jobs-layout">
        {!displayJobDetail ? (
          <div className="jobs-mobile-filter-bar lg:hidden">
            <span className="text-sm font-bold text-slate-900">Jobs</span>
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="inline-flex items-center gap-2 rounded-lg border border-[#00082C]/30 bg-[#00082C]/10 px-3 py-1.5 text-xs font-bold text-[#00082C]"
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
              . Gemini Jobs jobs still show below.
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
                style={{ background: "#00082C" }}
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
                    {visibleJobs.map((job) => {
                      const isBookmarked = savedJobs.includes(job.id);
                      const companyName = job.company?.name || "Company";
                      const snippet = jobCardSnippet(job);
                      const tags = [
                        TYPE_LABELS[job.employmentType] || job.employmentType,
                        WORK_MODE_LABELS[job.workMode] || job.workMode,
                      ].filter(Boolean) as string[];
                      const hasVisaSponsorship = jobOffersVisaSponsorship(job);

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
                              {snippet ? (
                                <p className="jobs-card-snippet">{snippet}</p>
                              ) : null}
                              <div className="jobs-card-tags">
                                {hasVisaSponsorship ? (
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
                                <span
                                  className={`jobs-tag ${tagVariant(tags.length)}`}
                                >
                                  {LEVEL_LABELS[job.experienceLevel] ||
                                    job.experienceLevel}
                                </span>
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
                              {formatCardLocation(
                                job.location ||
                                  job.countryLabel ||
                                  "Location not listed",
                              )}
                            </span>
                          </div>

                          <div
                            className="jobs-card-divider"
                            aria-hidden="true"
                          />

                          <div className="jobs-card-meta jobs-card-pay">
                            <span className="jobs-card-meta-label">Pay</span>
                            <span
                              className={`jobs-card-meta-value${
                                formatSalary(job) ? "" : " is-empty"
                              }`}
                            >
                              {formatSalary(job) || "Not listed"}
                            </span>
                          </div>

                          <div
                            className="jobs-card-divider"
                            aria-hidden="true"
                          />

                          <div className="jobs-card-center">
                            <span className="jobs-card-meta-label">Rating</span>
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

                          <div
                            className="jobs-card-divider"
                            aria-hidden="true"
                          />

                          <div className="jobs-card-actions">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                void toggleBookmark(job);
                              }}
                              title={
                                canSaveJob ? "Save job" : "Sign in to save jobs"
                              }
                              className={`jobs-save-btn ${isBookmarked ? "is-saved" : ""}`}
                              aria-label={
                                canSaveJob ? "Save job" : "Sign in to save jobs"
                              }
                            >
                              <Bookmark className="h-3.5 w-3.5 fill-current" />
                              {isBookmarked ? "Saved" : "Save"}
                            </button>
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
                    {visibleCount < sortedJobs.length ? (
                      <div
                        ref={loadMoreRef}
                        className="flex items-center justify-center gap-2 py-6 text-sm text-slate-500"
                        aria-hidden="true"
                      >
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading more jobs…
                      </div>
                    ) : null}
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
                      style={{ background: "#00082C" }}
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

export default function JobSearchPage({
  initialBrowse = null,
}: {
  initialBrowse?: InitialBrowse | null;
}) {
  const hasSeed =
    Boolean(
      initialBrowse?.success &&
        Array.isArray(initialBrowse.jobs) &&
        initialBrowse.jobs.length > 0,
    ) || Boolean(getClientBrowseCache()?.jobs?.length);

  return (
    <Suspense
      fallback={
        hasSeed ? (
          <div className="jobs-page min-h-screen bg-[#f6f7fb]" aria-hidden />
        ) : (
          <div className="jobs-page flex min-h-screen items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading jobs…
          </div>
        )
      }
    >
      <JobSearchInner initialBrowse={initialBrowse} />
    </Suspense>
  );
}
