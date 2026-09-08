/**
 * Jooble REST API client
 * Docs: https://help.jooble.org/en/support/solutions/articles/60001448238-rest-api-documentation
 *
 * POST https://{host}/api/{apiKey}
 * Body: { keywords, location, page, ResultOnPage }
 *
 * Each Jooble country domain ideally needs its own API key.
 * With only JOOBLE_API_KEY (jooble.org), we query by country name on jooble.org
 * and post-filter locations. Optional: JOOBLE_API_KEY_AU, _GB, _NZ, _CA, _SG, _US
 */

import { ADZUNA_COUNTRIES } from "@/lib/adzuna";

export const JOOBLE_COUNTRIES = ADZUNA_COUNTRIES;

export type JoobleJobNormalized = {
  id: string;
  source: "jooble";
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
  applyUrl: string;
  adref: string;
  country: string;
  countryLabel: string;
  company: {
    id: string;
    name: string;
    logoUrl: string;
    location: string;
    industry: string;
    about: string;
    website: string;
    size: string;
  };
};

type JoobleRawJob = {
  id?: number | string;
  title?: string;
  location?: string;
  snippet?: string;
  salary?: string;
  source?: string;
  type?: string;
  link?: string;
  company?: string;
  updated?: string;
};

type JoobleSearchResponse = {
  totalCount?: number;
  jobs?: JoobleRawJob[];
};

type CountryMeta = (typeof JOOBLE_COUNTRIES)[number];

const HOST_BY_COUNTRY: Record<string, string> = {
  us: "jooble.org",
  au: "au.jooble.org",
  gb: "uk.jooble.org",
  nz: "nz.jooble.org",
  ca: "ca.jooble.org",
  sg: "sg.jooble.org",
};

const SEARCH_LOCATION: Record<string, string> = {
  us: "United States",
  au: "Australia",
  gb: "United Kingdom",
  nz: "New Zealand",
  ca: "Canada",
  sg: "Singapore",
};

const LOCATION_MATCHERS: Record<string, RegExp[]> = {
  us: [/\bunited states\b/i, /\busa\b/i, /\b\w+,\s*[A-Z]{2}\b/],
  au: [
    /\baustralia\b/i,
    /\bsydney\b/i,
    /\bmelbourne\b/i,
    /\bbrisbane\b/i,
    /\bperth\b/i,
    /\badelaide\b/i,
    /\bcanberra\b/i,
    /\bhobart\b/i,
    /\bgold coast\b/i,
  ],
  gb: [
    /\bunited kingdom\b/i,
    /\buk\b/i,
    /\bengland\b/i,
    /\bscotland\b/i,
    /\bwales\b/i,
    /\blondon\b/i,
    /\bmanchester\b/i,
    /\bbirmingham\b/i,
    /\bedinburgh\b/i,
    /\bglasgow\b/i,
  ],
  nz: [
    /\bnew zealand\b/i,
    /\bauckland\b/i,
    /\bwellington\b/i,
    /\bchristchurch\b/i,
    /\bhamilton\b/i,
    /\bdunedin\b/i,
  ],
  ca: [
    /\bcanada\b/i,
    /\btoronto\b/i,
    /\bvancouver\b/i,
    /\bmontreal\b/i,
    /\bottawa\b/i,
    /\bcalgary\b/i,
    /\bedmonton\b/i,
  ],
  sg: [/\bsingapore\b/i],
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getDefaultApiKey() {
  return process.env.JOOBLE_API_KEY?.trim() || "";
}

function hasAnyCountryKey() {
  return JOOBLE_COUNTRIES.some((c) =>
    Boolean(process.env[`JOOBLE_API_KEY_${c.code.toUpperCase()}`]?.trim()),
  );
}

export function isJoobleConfigured() {
  return Boolean(getDefaultApiKey() || hasAnyCountryKey());
}

function getApiKeyForCountry(code: string): string {
  const specific =
    process.env[`JOOBLE_API_KEY_${code.toUpperCase()}`]?.trim() || "";
  return specific || getDefaultApiKey();
}

function getHostForCountry(code: string, usingRegionalKey: boolean): string {
  if (usingRegionalKey) {
    return HOST_BY_COUNTRY[code] || "jooble.org";
  }
  // Shared jooble.org key only works on jooble.org
  return "jooble.org";
}

function stripHtml(html: string): string {
  return html
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/?b>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\.{2,}/g, "…")
    .replace(/^[….\s]+|[….\s]+$/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function parseMoneyToken(raw: string): number {
  const cleaned = raw.replace(/[$,\s]/g, "").toLowerCase();
  if (!cleaned) return 0;
  if (cleaned.endsWith("k")) {
    const n = Number(cleaned.slice(0, -1));
    return Number.isFinite(n) ? Math.round(n * 1000) : 0;
  }
  const n = Number(cleaned.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? Math.round(n) : 0;
}

export function parseJoobleSalary(salary: string | undefined): {
  min: number;
  max: number;
  period: string;
} {
  const raw = (salary || "").trim();
  if (!raw) return { min: 0, max: 0, period: "year" };

  const lower = raw.toLowerCase();
  let period = "year";
  if (lower.includes("hour") || lower.includes("/hr") || lower.includes("ph")) {
    period = "hour";
  } else if (lower.includes("month") || lower.includes("/mo")) {
    period = "month";
  } else if (lower.includes("week") || lower.includes("/wk")) {
    period = "week";
  } else if (lower.includes("day") || lower.includes("/day")) {
    period = "day";
  }

  const range = raw.match(
    /\$?\s*([\d,.]+k?)\s*(?:-|–|to)\s*\$?\s*([\d,.]+k?)/i,
  );
  if (range) {
    const min = parseMoneyToken(range[1]);
    const max = parseMoneyToken(range[2]);
    return { min, max: max || min, period };
  }

  const single = raw.match(/\$?\s*([\d,.]+k?)/i);
  if (single) {
    const amount = parseMoneyToken(single[1]);
    return { min: amount, max: amount, period };
  }

  return { min: 0, max: 0, period: "year" };
}

function mapEmploymentType(type?: string): string {
  const hay = (type || "").toLowerCase();
  if (hay.includes("part")) return "part-time";
  if (hay.includes("contract") || hay.includes("temp")) return "contract";
  if (hay.includes("casual") || hay.includes("intern")) return "casual";
  return "full-time";
}

function mapWorkMode(title: string, snippet: string): string {
  const hay = `${title} ${snippet}`.toLowerCase();
  if (hay.includes("remote") || hay.includes("work from home")) return "remote";
  if (hay.includes("hybrid")) return "hybrid";
  return "onsite";
}

function mapExperience(title: string, snippet: string): string {
  const hay = `${title} ${snippet}`.toLowerCase();
  if (
    hay.includes("senior") ||
    hay.includes("lead") ||
    hay.includes("principal") ||
    hay.includes("director")
  ) {
    return "senior";
  }
  if (
    hay.includes("junior") ||
    hay.includes("graduate") ||
    hay.includes("entry") ||
    hay.includes("intern")
  ) {
    return "entry";
  }
  return "mid";
}

function locationMatchesCountry(location: string, code: string): boolean {
  const matchers = LOCATION_MATCHERS[code];
  if (!matchers?.length) return true;

  if (code === "us") {
    const foreign = [
      ...LOCATION_MATCHERS.au,
      ...LOCATION_MATCHERS.gb,
      ...LOCATION_MATCHERS.nz,
      ...LOCATION_MATCHERS.ca,
      ...LOCATION_MATCHERS.sg,
    ];
    if (foreign.some((re) => re.test(location))) return false;
    return true;
  }

  return matchers.some((re) => re.test(location));
}

function normalizeJob(
  job: JoobleRawJob,
  country: CountryMeta,
): JoobleJobNormalized | null {
  const title = (job.title || "").trim();
  if (!title) return null;

  const location = (job.location || country.label).trim();
  if (!locationMatchesCountry(location, country.code)) return null;

  const snippet = stripHtml(job.snippet || "");
  const salary = parseJoobleSalary(job.salary);
  const companyName = (job.company || "Company").trim() || "Company";
  const rawId = job.id != null ? String(job.id) : `${title}-${location}`;
  const compositeId = `jooble-${country.code}-${rawId}`;

  let salaryPeriod = salary.period;
  let salaryMin = salary.min;
  let salaryMax = salary.max;
  if (salaryPeriod === "month") {
    salaryPeriod = "year";
    if (salaryMin > 0) salaryMin *= 12;
    if (salaryMax > 0) salaryMax *= 12;
  }

  return {
    id: compositeId,
    source: "jooble",
    title,
    description: snippet,
    requirements: snippet,
    responsibilities: snippet,
    location,
    category: "General",
    employmentType: mapEmploymentType(job.type),
    workMode: mapWorkMode(title, snippet),
    experienceLevel: mapExperience(title, snippet),
    salaryMin,
    salaryMax,
    salaryCurrency: country.currency,
    salaryPeriod,
    skills: [],
    benefits: "",
    createdAt: job.updated || null,
    applyUrl: (job.link || "").trim(),
    adref: (job.source || "").trim(),
    country: country.code,
    countryLabel: country.label,
    company: {
      id: `jooble-co-${country.code}-${companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 40)}`,
      name: companyName,
      logoUrl: "",
      location,
      industry: "",
      about: "",
      website: "",
      size: "",
    },
  };
}

async function fetchJooblePage(options: {
  host: string;
  apiKey: string;
  keywords: string;
  location: string;
  page: number;
  resultsPerPage: number;
}): Promise<{ jobs: JoobleRawJob[]; totalCount: number; error?: string }> {
  const url = `https://${options.host}/api/${options.apiKey}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        keywords: options.keywords,
        location: options.location,
        page: String(options.page),
        ResultOnPage: String(options.resultsPerPage),
        companysearch: "false",
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        jobs: [],
        totalCount: 0,
        error: `Jooble ${options.host} HTTP ${res.status}${
          text ? `: ${text.slice(0, 120)}` : ""
        }`,
      };
    }

    const data = (await res.json()) as JoobleSearchResponse;
    return {
      jobs: Array.isArray(data.jobs) ? data.jobs : [],
      totalCount: Math.max(0, Number(data.totalCount || 0) || 0),
    };
  } catch (err) {
    return {
      jobs: [],
      totalCount: 0,
      error: err instanceof Error ? err.message : "Jooble request failed",
    };
  }
}

async function fetchCountryJobs(options: {
  country: CountryMeta;
  total: number;
}): Promise<{
  jobs: JoobleJobNormalized[];
  totalAvailable: number;
  error?: string;
}> {
  const specificKey =
    process.env[`JOOBLE_API_KEY_${options.country.code.toUpperCase()}`]?.trim() ||
    "";
  const apiKey = getApiKeyForCountry(options.country.code);
  if (!apiKey) {
    return {
      jobs: [],
      totalAvailable: 0,
      error: `No Jooble API key for ${options.country.code}`,
    };
  }

  const usingRegionalKey = Boolean(specificKey);
  const host = getHostForCountry(options.country.code, usingRegionalKey);
  const location =
    SEARCH_LOCATION[options.country.code] || options.country.label;

  // Fixed keyword keeps cache reusable and protects Jooble's lifetime quota
  const keywords = "job";
  const resultsPerPage = Math.min(50, Math.max(1, options.total));
  const pagesNeeded = Math.min(
    3,
    Math.max(1, Number(process.env.JOOBLE_PAGES_PER_COUNTRY || "1") || 1),
  );

  const jobs: JoobleJobNormalized[] = [];
  const seen = new Set<string>();
  let lastError: string | undefined;
  let totalAvailable = 0;

  for (let page = 1; page <= pagesNeeded; page++) {
    const result = await fetchJooblePage({
      host,
      apiKey,
      keywords,
      location,
      page,
      resultsPerPage,
    });

    if (result.error) lastError = result.error;
    if (page === 1) totalAvailable = result.totalCount || 0;

    for (const raw of result.jobs) {
      const normalized = normalizeJob(raw, options.country);
      if (!normalized) continue;
      if (seen.has(normalized.id)) continue;
      seen.add(normalized.id);
      jobs.push(normalized);
      if (jobs.length >= options.total) break;
    }

    if (jobs.length >= options.total || result.jobs.length < resultsPerPage) {
      break;
    }
    await sleep(250);
  }

  return {
    jobs: jobs.slice(0, options.total),
    totalAvailable,
    error: jobs.length ? undefined : lastError,
  };
}

export async function fetchJoobleJobs(options?: {
  country?: string;
  q?: string;
  jobsPerCountry?: number;
}): Promise<{
  jobs: JoobleJobNormalized[];
  configured: boolean;
  error?: string;
  countriesFetched: string[];
  fromCache?: boolean;
  cacheTtlHours?: number;
}> {
  if (!isJoobleConfigured()) {
    return {
      jobs: [],
      configured: false,
      error:
        "Jooble is not configured. Set JOOBLE_API_KEY in .env (from https://jooble.org/api/about).",
      countriesFetched: [],
    };
  }

  const countryParam = options?.country?.toLowerCase().trim() || "all";
  const targets =
    countryParam === "all"
      ? [...JOOBLE_COUNTRIES]
      : JOOBLE_COUNTRIES.filter((c) => c.code === countryParam);

  if (targets.length === 0) {
    return {
      jobs: [],
      configured: true,
      error: `Unsupported country: ${countryParam}`,
      countriesFetched: [],
    };
  }

  const {
    filterJoobleJobs,
    getJoobleCacheMeta,
    getCachedCountryJobs,
  } = await import("@/lib/jooble-cache");

  const cacheMeta = getJoobleCacheMeta();
  const jobsPerCountry =
    options?.jobsPerCountry ??
    Number(process.env.JOOBLE_JOBS_PER_COUNTRY || "40");

  const jobs: JoobleJobNormalized[] = [];
  const countriesFetched: string[] = [];
  const errors: string[] = [];
  let servedFromCache = true;

  for (let i = 0; i < targets.length; i++) {
    const country = targets[i];
    if (!getApiKeyForCountry(country.code)) continue;

    const loadCountry = async () => {
      const result = await fetchCountryJobs({
        country,
        total: jobsPerCountry,
      });
      if (result.error) errors.push(`${country.code}: ${result.error}`);
      return result.jobs;
    };

    const cached = await getCachedCountryJobs(country.code, loadCountry, {
      minJobs: 0,
    });

    if (!cached.fromCache) servedFromCache = false;
    if (cached.jobs.length > 0) {
      countriesFetched.push(country.code);
      jobs.push(...cached.jobs);
    }

    if (i < targets.length - 1) {
      await sleep(300);
    }
  }

  const filtered = filterJoobleJobs(jobs, options?.q);

  return {
    jobs: filtered,
    configured: true,
    error:
      filtered.length === 0 && errors.length > 0
        ? errors.slice(0, 3).join("; ")
        : undefined,
    countriesFetched,
    fromCache: servedFromCache,
    cacheTtlHours: cacheMeta.ttlHours,
  };
}
