/**
 * Himalayas Remote Jobs API client
 * Docs: https://himalayas.app/jobs/api
 *
 * Public JSON API — no authentication required.
 * Attribution: link back to Himalayas and mention as the original source.
 */

import { ADZUNA_COUNTRIES } from "@/lib/adzuna";

export const HIMALAYAS_COUNTRIES = ADZUNA_COUNTRIES;

export type HimalayasJobNormalized = {
  id: string;
  source: "himalayas";
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

type HimalayasRawJob = {
  title?: string;
  excerpt?: string;
  companyName?: string;
  companySlug?: string;
  companyLogo?: string;
  employmentType?: string;
  locationRestrictions?: string[];
  timezoneRestrictions?: number[];
  categories?: string[];
  parentCategories?: string[];
  seniority?: string[];
  minSalary?: number | null;
  maxSalary?: number | null;
  salaryPeriod?: string;
  currency?: string;
  description?: string;
  pubDate?: number;
  expiryDate?: number;
  applicationLink?: string;
  guid?: string;
};

type HimalayasSearchResponse = {
  jobs?: HimalayasRawJob[];
  totalCount?: number;
  limit?: number;
  offset?: number;
};

const SEARCH_URL = "https://himalayas.app/jobs/api/search";
const MAX_PER_REQUEST = 20;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mapEmploymentType(value?: string): string {
  const hay = (value || "").toLowerCase();
  if (hay.includes("part")) return "part-time";
  if (hay.includes("contract")) return "contract";
  if (hay.includes("casual") || hay.includes("temporary")) return "casual";
  if (hay.includes("intern")) return "casual";
  return "full-time";
}

function mapExperience(seniority: string[] | undefined): string {
  const hay = (seniority || []).join(" ").toLowerCase();
  if (
    hay.includes("executive") ||
    hay.includes("director") ||
    hay.includes("manager")
  ) {
    return "senior";
  }
  if (hay.includes("senior")) return "senior";
  if (hay.includes("entry") || hay.includes("intern")) return "entry";
  return "mid";
}

function mapSalaryPeriod(value?: string): string {
  const hay = (value || "annual").toLowerCase();
  if (hay.includes("hour")) return "hour";
  if (hay.includes("week")) return "week";
  if (hay.includes("month")) return "month";
  return "year";
}

function slugFromGuid(guid: string): string {
  return guid
    .replace(/^https?:\/\/himalayas\.app\//i, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function buildLocation(
  country: (typeof HIMALAYAS_COUNTRIES)[number],
  restrictions: string[] | undefined,
): string {
  if (restrictions?.length) {
    return `Remote · ${restrictions.join(", ")}`;
  }
  return `Remote · ${country.label}`;
}

function normalizeJob(
  job: HimalayasRawJob,
  country: (typeof HIMALAYAS_COUNTRIES)[number],
): HimalayasJobNormalized | null {
  const guid = job.guid?.trim() || job.applicationLink?.trim() || "";
  if (!guid) return null;

  const slug = slugFromGuid(guid);
  const companyName = job.companyName?.trim() || "Company";
  const companySlug = job.companySlug?.trim() || slugFromGuid(companyName);
  const description = job.description?.trim() || job.excerpt?.trim() || "";
  const salaryMin = Number(job.minSalary) || 0;
  const salaryMax = Number(job.maxSalary) || salaryMin;
  const category =
    job.categories?.[0]?.replace(/-/g, " ").trim() ||
    job.parentCategories?.[0]?.replace(/-/g, " ").trim() ||
    "Remote";

  const createdAt =
    typeof job.pubDate === "number" && job.pubDate > 0
      ? new Date(job.pubDate * 1000).toISOString()
      : null;

  return {
    id: `himalayas-${country.code}-${slug}`,
    source: "himalayas",
    title: (job.title || "Untitled role").trim(),
    description,
    requirements: "",
    responsibilities: "",
    location: buildLocation(country, job.locationRestrictions),
    category,
    employmentType: mapEmploymentType(job.employmentType),
    workMode: "remote",
    experienceLevel: mapExperience(job.seniority),
    salaryMin,
    salaryMax,
    salaryCurrency: job.currency?.trim() || country.currency,
    salaryPeriod: mapSalaryPeriod(job.salaryPeriod),
    skills: [],
    benefits: "",
    createdAt,
    applyUrl: job.applicationLink?.trim() || guid,
    adref: "",
    country: country.code,
    countryLabel: country.label,
    company: {
      id: `himalayas-co-${companySlug}`,
      name: companyName,
      logoUrl: job.companyLogo?.trim() || "",
      location: buildLocation(country, job.locationRestrictions),
      industry: category,
      about: "",
      website: job.applicationLink?.trim() || "",
      size: "",
    },
  };
}

async function fetchSearchPage(options: {
  country: (typeof HIMALAYAS_COUNTRIES)[number];
  page: number;
  q?: string;
}): Promise<{ jobs: HimalayasJobNormalized[]; error?: string }> {
  const params = new URLSearchParams({
    country: options.country.code.toUpperCase(),
    sort: "recent",
    page: String(options.page),
  });
  if (options.q) params.set("q", options.q);

  const url = `${SEARCH_URL}?${params}`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(20000),
      headers: {
        Accept: "application/json",
        "User-Agent": "GeminiEducationCareers/1.0",
      },
    });

    if (res.status === 429) {
      return { jobs: [], error: `${options.country.code}: rate limited` };
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn(
        `Himalayas ${options.country.code} p${options.page} failed:`,
        res.status,
        text.slice(0, 200),
      );
      return { jobs: [], error: `${options.country.code}: ${res.status}` };
    }

    const data = (await res.json()) as HimalayasSearchResponse;
    const jobs = (data.jobs || [])
      .map((job) => normalizeJob(job, options.country))
      .filter((job): job is HimalayasJobNormalized => Boolean(job));

    return { jobs };
  } catch (err) {
    const message = err instanceof Error ? err.message : "request failed";
    console.warn(`Himalayas ${options.country.code} error:`, message);
    return { jobs: [], error: `${options.country.code}: ${message}` };
  }
}

async function fetchCountryJobs(options: {
  country: (typeof HIMALAYAS_COUNTRIES)[number];
  q?: string;
  total?: number;
}): Promise<{ jobs: HimalayasJobNormalized[]; error?: string }> {
  const total = Math.max(1, options.total ?? 80);
  const pagesNeeded = Math.ceil(total / MAX_PER_REQUEST);
  const jobs: HimalayasJobNormalized[] = [];
  const seen = new Set<string>();
  let lastError: string | undefined;

  for (let page = 1; page <= pagesNeeded; page++) {
    const result = await fetchSearchPage({
      country: options.country,
      page,
      q: options.q,
    });

    if (result.error) lastError = result.error;

    for (const job of result.jobs) {
      if (seen.has(job.id)) continue;
      seen.add(job.id);
      jobs.push(job);
      if (jobs.length >= total) break;
    }

    if (jobs.length >= total || result.jobs.length < MAX_PER_REQUEST) {
      break;
    }

    await sleep(350);
  }

  return {
    jobs: jobs.slice(0, total),
    error: jobs.length ? undefined : lastError,
  };
}

export async function fetchHimalayasJobs(options?: {
  country?: string;
  q?: string;
  jobsPerCountry?: number;
}): Promise<{
  jobs: HimalayasJobNormalized[];
  configured: boolean;
  error?: string;
  countriesFetched: string[];
  fromCache?: boolean;
  cacheTtlHours?: number;
}> {
  const countryParam = options?.country?.toLowerCase().trim() || "all";
  const targets =
    countryParam === "all"
      ? [...HIMALAYAS_COUNTRIES]
      : HIMALAYAS_COUNTRIES.filter((c) => c.code === countryParam);

  if (targets.length === 0) {
    return {
      jobs: [],
      configured: true,
      error: `Unsupported country: ${countryParam}`,
      countriesFetched: [],
    };
  }

  const {
    filterHimalayasJobs,
    getHimalayasCacheMeta,
    getCachedCountryJobs,
  } = await import("@/lib/himalayas-cache");

  const cacheMeta = getHimalayasCacheMeta();
  const jobsPerCountry =
    options?.jobsPerCountry ??
    Number(process.env.HIMALAYAS_JOBS_PER_COUNTRY || "80");

  const jobs: HimalayasJobNormalized[] = [];
  const countriesFetched: string[] = [];
  const errors: string[] = [];
  let servedFromCache = true;

  for (let i = 0; i < targets.length; i++) {
    const country = targets[i];
    const total =
      country.code === "au"
        ? Math.max(jobsPerCountry, countryParam === "all" ? 100 : jobsPerCountry)
        : jobsPerCountry;

    const loadCountry = async () => {
      const result = await fetchCountryJobs({
        country,
        q: options?.q,
        total,
      });
      if (result.error) errors.push(result.error);
      return result.jobs;
    };

    const cached = await getCachedCountryJobs(country.code, loadCountry, {
      minJobs: 0,
    });

    if (!cached.fromCache) servedFromCache = false;
    countriesFetched.push(country.code);
    jobs.push(...cached.jobs);

    if (i < targets.length - 1) {
      await sleep(400);
    }
  }

  const filtered = filterHimalayasJobs(jobs, options?.q);

  return {
    jobs: filtered,
    configured: true,
    error: errors.length ? errors.join("; ") : undefined,
    countriesFetched,
    fromCache: servedFromCache,
    cacheTtlHours: cacheMeta.ttlHours,
  };
}
