/**
 * Coresignal Base Jobs API client
 * Docs: https://docs.coresignal.com/
 *
 * Auth: header `apikey: <key>`
 * Search (IDs): POST /cdapi/v2/job_base/search/filter
 * Collect:     GET  /cdapi/v2/job_base/collect/{id}
 *
 * Credits: collect ≈ 1 credit/job. Cache aggressively.
 */

import { ADZUNA_COUNTRIES } from "@/lib/adzuna";

export const CORESIGNAL_COUNTRIES = ADZUNA_COUNTRIES;

export type CoresignalJobNormalized = {
  id: string;
  source: "coresignal";
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

type CountryMeta = (typeof CORESIGNAL_COUNTRIES)[number];

type CoresignalRawJob = {
  id?: number | string;
  title?: string;
  description?: string;
  location?: string;
  country?: string;
  salary?: string | null;
  employment_type?: string | null;
  seniority?: string | null;
  url?: string | null;
  external_url?: string | null;
  redirected_url?: string | null;
  company_id?: number | string | null;
  company_name?: string | null;
  company_url?: string | null;
  created?: string | null;
  last_updated?: string | null;
  deleted?: number | boolean | null;
  application_active?: number | boolean | null;
  job_functions_collection?: string | string[] | null;
  job_industry_collection?: string | null;
};

const BASE_URL = "https://api.coresignal.com/cdapi/v2/job_base";

/** Coresignal country filter values (full names) */
const SEARCH_COUNTRY: Record<string, string> = {
  au: "Australia",
  us: "United States",
  gb: "United Kingdom",
  nz: "New Zealand",
  ca: "Canada",
  sg: "Singapore",
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getApiKey() {
  return process.env.CORESIGNAL_API_KEY?.trim() || "";
}

export function isCoresignalConfigured() {
  return Boolean(getApiKey());
}

function authHeaders(): HeadersInit {
  return {
    accept: "application/json",
    apikey: getApiKey(),
    "Content-Type": "application/json",
  };
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

function parseSalary(salary: string | null | undefined): {
  min: number;
  max: number;
  period: string;
} {
  const raw = (salary || "").trim();
  if (!raw) return { min: 0, max: 0, period: "year" };

  const lower = raw.toLowerCase();
  let period = "year";
  if (lower.includes("hour") || lower.includes("/hr")) period = "hour";
  else if (lower.includes("month") || lower.includes("/mo")) period = "month";
  else if (lower.includes("week") || lower.includes("/wk")) period = "week";
  else if (lower.includes("day") || lower.includes("/day")) period = "day";

  const range = raw.match(
    /\$?\s*([\d,.]+k?)\s*(?:-|–|to)\s*\$?\s*([\d,.]+k?)/i,
  );
  if (range) {
    return {
      min: parseMoneyToken(range[1]),
      max: parseMoneyToken(range[2]) || parseMoneyToken(range[1]),
      period,
    };
  }

  const single = raw.match(/\$?\s*([\d,.]+k?)/i);
  if (single) {
    const amount = parseMoneyToken(single[1]);
    return { min: amount, max: amount, period };
  }

  return { min: 0, max: 0, period: "year" };
}

function mapEmploymentType(value?: string | null): string {
  const hay = (value || "").toLowerCase();
  if (hay.includes("part")) return "part-time";
  if (hay.includes("contract") || hay.includes("temp")) return "contract";
  if (hay.includes("casual") || hay.includes("intern")) return "casual";
  return "full-time";
}

function mapExperience(seniority?: string | null, title = ""): string {
  const hay = `${seniority || ""} ${title}`.toLowerCase();
  if (
    hay.includes("director") ||
    hay.includes("executive") ||
    hay.includes("principal") ||
    hay.includes("lead") ||
    hay.includes("senior") ||
    hay.includes("mid-senior")
  ) {
    return "senior";
  }
  if (
    hay.includes("entry") ||
    hay.includes("junior") ||
    hay.includes("intern") ||
    hay.includes("graduate") ||
    hay.includes("associate")
  ) {
    return "entry";
  }
  return "mid";
}

function mapWorkMode(title: string, description: string, location: string): string {
  const hay = `${title} ${description} ${location}`.toLowerCase();
  if (hay.includes("remote") || hay.includes("work from home")) return "remote";
  if (hay.includes("hybrid")) return "hybrid";
  return "onsite";
}

function parseCategory(raw: CoresignalRawJob): string {
  const funcs = raw.job_functions_collection;
  if (Array.isArray(funcs) && funcs[0]) return String(funcs[0]).slice(0, 80);
  if (typeof funcs === "string" && funcs.trim()) {
    try {
      const parsed = JSON.parse(funcs) as unknown;
      if (Array.isArray(parsed) && parsed[0]) return String(parsed[0]).slice(0, 80);
    } catch {
      return funcs.replace(/[\[\]"]/g, "").split(",")[0]?.trim() || "General";
    }
  }

  const industry = raw.job_industry_collection;
  if (typeof industry === "string" && industry.includes("industry")) {
    const m = industry.match(/"industry"\s*:\s*"([^"]+)"/);
    if (m?.[1]) return m[1].slice(0, 80);
  }

  return "General";
}

function toIsoDate(value?: string | null): string | null {
  if (!value) return null;
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const t = Date.parse(normalized);
  if (Number.isNaN(t)) return value;
  return new Date(t).toISOString();
}

function normalizeJob(
  job: CoresignalRawJob,
  country: CountryMeta,
): CoresignalJobNormalized | null {
  if (job.deleted === 1 || job.deleted === true) return null;

  const title = (job.title || "").trim();
  if (!title) return null;

  const location = (job.location || country.label).trim();
  const description = (job.description || "").trim();
  const companyName = (job.company_name || "Company").trim() || "Company";
  const applyUrl = (
    job.external_url ||
    job.redirected_url ||
    job.url ||
    ""
  ).trim();

  const salary = parseSalary(job.salary);
  let salaryPeriod = salary.period;
  let salaryMin = salary.min;
  let salaryMax = salary.max;
  if (salaryPeriod === "month") {
    salaryPeriod = "year";
    if (salaryMin > 0) salaryMin *= 12;
    if (salaryMax > 0) salaryMax *= 12;
  }

  const rawId = job.id != null ? String(job.id) : `${title}-${location}`;

  return {
    id: `coresignal-${country.code}-${rawId}`,
    source: "coresignal",
    title,
    description,
    requirements: description,
    responsibilities: description,
    location,
    category: parseCategory(job),
    employmentType: mapEmploymentType(job.employment_type),
    workMode: mapWorkMode(title, description, location),
    experienceLevel: mapExperience(job.seniority, title),
    salaryMin,
    salaryMax,
    salaryCurrency: country.currency,
    salaryPeriod,
    skills: [],
    benefits: "",
    createdAt: toIsoDate(job.created || job.last_updated),
    applyUrl,
    adref: String(job.id ?? ""),
    country: country.code,
    countryLabel: country.label,
    company: {
      id: `coresignal-co-${country.code}-${
        job.company_id != null
          ? String(job.company_id)
          : companyName
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .slice(0, 40)
      }`,
      name: companyName,
      logoUrl: "",
      location,
      industry: "",
      about: "",
      website: (job.company_url || "").trim(),
      size: "",
    },
  };
}

async function searchJobIds(countryLabel: string): Promise<{
  ids: number[];
  totalAvailable: number;
  error?: string;
}> {
  try {
    const res = await fetch(`${BASE_URL}/search/filter`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ country: countryLabel }),
      signal: AbortSignal.timeout(25000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ids: [],
        totalAvailable: 0,
        error: `search HTTP ${res.status}${text ? `: ${text.slice(0, 120)}` : ""}`,
      };
    }

    const totalHeader = res.headers.get("x-total-results");
    const totalAvailable = Math.max(0, Number(totalHeader || 0) || 0);

    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) {
      return {
        ids: [],
        totalAvailable,
        error: "search returned unexpected payload",
      };
    }

    const ids = data
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0);

    return { ids, totalAvailable };
  } catch (err) {
    return {
      ids: [],
      totalAvailable: 0,
      error: err instanceof Error ? err.message : "search failed",
    };
  }
}

async function collectJob(id: number): Promise<{
  job: CoresignalRawJob | null;
  error?: string;
}> {
  try {
    const res = await fetch(`${BASE_URL}/collect/${id}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        apikey: getApiKey(),
      },
      signal: AbortSignal.timeout(25000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        job: null,
        error: `collect ${id} HTTP ${res.status}${
          text ? `: ${text.slice(0, 80)}` : ""
        }`,
      };
    }

    const data = (await res.json()) as CoresignalRawJob;
    return { job: data };
  } catch (err) {
    return {
      job: null,
      error: err instanceof Error ? err.message : `collect ${id} failed`,
    };
  }
}

async function fetchCountryJobs(options: {
  country: CountryMeta;
  total: number;
}): Promise<{
  jobs: CoresignalJobNormalized[];
  totalAvailable: number;
  error?: string;
}> {
  const countryLabel =
    SEARCH_COUNTRY[options.country.code] || options.country.label;

  const searched = await searchJobIds(countryLabel);
  if (searched.error && searched.ids.length === 0) {
    return {
      jobs: [],
      totalAvailable: searched.totalAvailable,
      error: searched.error,
    };
  }

  const jobs: CoresignalJobNormalized[] = [];
  const seen = new Set<string>();
  let lastError: string | undefined;

  // Rate limit is ~5 req/sec — keep under that
  for (const id of searched.ids) {
    if (jobs.length >= options.total) break;

    const collected = await collectJob(id);
    if (collected.error) lastError = collected.error;
    if (!collected.job) {
      await sleep(220);
      continue;
    }

    const normalized = normalizeJob(collected.job, options.country);
    if (!normalized) {
      await sleep(220);
      continue;
    }
    if (seen.has(normalized.id)) {
      await sleep(220);
      continue;
    }

    seen.add(normalized.id);
    jobs.push(normalized);
    await sleep(220);
  }

  return {
    jobs,
    totalAvailable: searched.totalAvailable,
    error: jobs.length ? undefined : lastError || searched.error,
  };
}

export async function fetchCoresignalJobs(options?: {
  country?: string;
  q?: string;
  jobsPerCountry?: number;
}): Promise<{
  jobs: CoresignalJobNormalized[];
  configured: boolean;
  error?: string;
  countriesFetched: string[];
  fromCache?: boolean;
  cacheTtlHours?: number;
  totalAvailable: number;
  totalsByCountry: Record<string, number>;
}> {
  if (!isCoresignalConfigured()) {
    return {
      jobs: [],
      configured: false,
      error:
        "Coresignal is not configured. Set CORESIGNAL_API_KEY in .env (from https://dashboard.coresignal.com).",
      countriesFetched: [],
      totalAvailable: 0,
      totalsByCountry: {},
    };
  }

  const countryParam = options?.country?.toLowerCase().trim() || "all";
  const targets =
    countryParam === "all"
      ? [...CORESIGNAL_COUNTRIES]
      : CORESIGNAL_COUNTRIES.filter((c) => c.code === countryParam);

  if (targets.length === 0) {
    return {
      jobs: [],
      configured: true,
      error: `Unsupported country: ${countryParam}`,
      countriesFetched: [],
      totalAvailable: 0,
      totalsByCountry: {},
    };
  }

  const {
    filterCoresignalJobs,
    getCoresignalCacheMeta,
    getCachedCountryJobs,
    updateCachedTotalAvailable,
  } = await import("@/lib/coresignal-cache");

  const cacheMeta = getCoresignalCacheMeta();
  const jobsPerCountry =
    options?.jobsPerCountry ??
    Number(process.env.CORESIGNAL_JOBS_PER_COUNTRY || "40");

  const jobs: CoresignalJobNormalized[] = [];
  const countriesFetched: string[] = [];
  const totalsByCountry: Record<string, number> = {};
  const errors: string[] = [];
  let servedFromCache = true;

  for (let i = 0; i < targets.length; i++) {
    const country = targets[i];
    const countryLabel = SEARCH_COUNTRY[country.code] || country.label;

    const loadCountry = async () => {
      const result = await fetchCountryJobs({
        country,
        total: jobsPerCountry,
      });
      if (result.error) errors.push(`${country.code}: ${result.error}`);
      return {
        jobs: result.jobs,
        totalAvailable: result.totalAvailable,
      };
    };

    const cached = await getCachedCountryJobs(country.code, loadCountry, {
      // Refetch if cache is thin (e.g. after raising CORESIGNAL_JOBS_PER_COUNTRY)
      minJobs: Math.max(1, Math.floor(jobsPerCountry * 0.6)),
    });

    if (!cached.fromCache) servedFromCache = false;

    let totalAvailable = cached.totalAvailable || 0;
    // Jobs cache can exist without totals — refresh count only (cheap search)
    if (totalAvailable <= 0) {
      const searched = await searchJobIds(countryLabel);
      totalAvailable = searched.totalAvailable || 0;
      if (totalAvailable > 0) {
        await updateCachedTotalAvailable(country.code, totalAvailable);
      }
    }

    totalsByCountry[country.code] = totalAvailable;
    if (cached.jobs.length > 0 || totalAvailable > 0) {
      countriesFetched.push(country.code);
      jobs.push(...cached.jobs);
    }

    if (i < targets.length - 1) {
      await sleep(300);
    }
  }

  const filtered = filterCoresignalJobs(jobs, options?.q);
  const totalAvailable = Object.values(totalsByCountry).reduce(
    (sum, n) => sum + n,
    0,
  );

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
    totalAvailable,
    totalsByCountry,
  };
}
