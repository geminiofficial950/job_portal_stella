/**
 * Adzuna Jobs API client
 * Docs: https://developer.adzuna.com/docs/search
 *
 * Requires ADZUNA_APP_ID + ADZUNA_API_KEY in .env
 *
 * Supported country codes (from Adzuna error payload):
 * at, au, be, br, ca, ch, de, es, fr, gb, in, it, mx, nl, nz, pl, sg, us, za
 * Note: Ireland (ie) is NOT supported by Adzuna.
 */

export const ADZUNA_COUNTRIES = [
  { code: "au", label: "Australia", flag: "🇦🇺", currency: "AUD" },
  { code: "us", label: "USA", flag: "🇺🇸", currency: "USD" },
  { code: "gb", label: "UK", flag: "🇬🇧", currency: "GBP" },
  { code: "nz", label: "New Zealand", flag: "🇳🇿", currency: "NZD" },
  { code: "ca", label: "Canada", flag: "🇨🇦", currency: "CAD" },
  { code: "sg", label: "Singapore", flag: "🇸🇬", currency: "SGD" },
] as const;

export type AdzunaCountryCode = (typeof ADZUNA_COUNTRIES)[number]["code"];

export type AdzunaJobNormalized = {
  id: string;
  source: "adzuna";
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

type AdzunaRawJob = {
  id: string | number;
  title?: string;
  description?: string;
  created?: string;
  redirect_url?: string;
  salary_min?: number;
  salary_max?: number;
  contract_time?: string;
  contract_type?: string;
  category?: { label?: string; tag?: string };
  company?: { display_name?: string };
  location?: { display_name?: string; area?: string[] };
};

function getCredentials() {
  const appId = process.env.ADZUNA_APP_ID?.trim() || "";
  const appKey =
    process.env.ADZUNA_API_KEY?.trim() ||
    process.env.ADZUNA_APP_KEY?.trim() ||
    "";
  return { appId, appKey };
}

export function isAdzunaConfigured() {
  const { appId, appKey } = getCredentials();
  return Boolean(appId && appKey);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mapEmploymentType(job: AdzunaRawJob): string {
  if (job.contract_time === "part_time") return "part-time";
  if (job.contract_type === "contract") return "contract";
  if (job.contract_time === "full_time") return "full-time";
  if (job.contract_type === "permanent") return "full-time";
  return "full-time";
}

function mapWorkMode(job: AdzunaRawJob): string {
  const hay = `${job.title || ""} ${job.description || ""}`.toLowerCase();
  if (hay.includes("remote") || hay.includes("work from home")) return "remote";
  if (hay.includes("hybrid")) return "hybrid";
  return "onsite";
}

function mapExperience(job: AdzunaRawJob): string {
  const hay = `${job.title || ""} ${job.description || ""}`.toLowerCase();
  if (
    hay.includes("senior") ||
    hay.includes("lead") ||
    hay.includes("principal")
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

function normalizeJob(
  job: AdzunaRawJob,
  country: (typeof ADZUNA_COUNTRIES)[number],
): AdzunaJobNormalized {
  const companyName = job.company?.display_name?.trim() || "Company";
  const location = job.location?.display_name?.trim() || country.label;
  const description = job.description?.trim() || "";
  const salaryMin = Number(job.salary_min) || 0;
  const salaryMax = Number(job.salary_max) || salaryMin;

  return {
    id: `adzuna-${country.code}-${job.id}`,
    source: "adzuna",
    title: (job.title || "Untitled role").trim(),
    description,
    requirements: description,
    responsibilities: description,
    location,
    category: job.category?.label?.trim() || "General",
    employmentType: mapEmploymentType(job),
    workMode: mapWorkMode(job),
    experienceLevel: mapExperience(job),
    salaryMin,
    salaryMax,
    salaryCurrency: country.currency,
    salaryPeriod: "year",
    skills: [],
    benefits: "",
    createdAt: job.created || null,
    applyUrl: job.redirect_url || "",
    country: country.code,
    countryLabel: country.label,
    company: {
      id: `adzuna-co-${country.code}-${companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 40)}`,
      name: companyName,
      logoUrl: "",
      location,
      industry: job.category?.label?.trim() || "",
      about: "",
      website: "",
      size: "",
    },
  };
}

async function fetchCountryPage(options: {
  country: (typeof ADZUNA_COUNTRIES)[number];
  what?: string;
  where?: string;
  page: number;
  resultsPerPage: number;
}): Promise<{ jobs: AdzunaJobNormalized[]; error?: string }> {
  const { appId, appKey } = getCredentials();
  if (!appId || !appKey) return { jobs: [] };

  // Keep query minimal — extra params can trigger 400 / WAF responses
  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: String(Math.min(options.resultsPerPage, 50)),
  });
  if (options.what) params.set("what", options.what);
  if (options.where) params.set("where", options.where);

  const url = `https://api.adzuna.com/v1/api/jobs/${options.country.code}/search/${options.page}?${params}`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn(
        `Adzuna ${options.country.code} p${options.page} failed:`,
        res.status,
        text.slice(0, 200),
      );
      return {
        jobs: [],
        error: `${options.country.code}: ${res.status}`,
      };
    }

    const data = (await res.json()) as { results?: AdzunaRawJob[] };
    return {
      jobs: (data.results || []).map((job) =>
        normalizeJob(job, options.country),
      ),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "request failed";
    console.warn(`Adzuna ${options.country.code} error:`, message);
    return { jobs: [], error: `${options.country.code}: ${message}` };
  }
}

/** Fetch up to `total` jobs for one country (Adzuna max 50/page). */
async function fetchCountryJobs(options: {
  country: (typeof ADZUNA_COUNTRIES)[number];
  what?: string;
  where?: string;
  total?: number;
}): Promise<{ jobs: AdzunaJobNormalized[]; error?: string }> {
  const total = Math.max(1, options.total ?? 50);
  const perPage = 50;
  const pages = Math.min(4, Math.ceil(total / perPage)); // max 200/country
  const jobs: AdzunaJobNormalized[] = [];
  let lastError: string | undefined;

  for (let page = 1; page <= pages; page++) {
    const need = total - jobs.length;
    if (need <= 0) break;

    const result = await fetchCountryPage({
      country: options.country,
      what: options.what,
      where: options.where,
      page,
      resultsPerPage: Math.min(perPage, need),
    });

    if (result.error) {
      lastError = result.error;
      break;
    }
    if (result.jobs.length === 0) break;

    jobs.push(...result.jobs);
    if (result.jobs.length < Math.min(perPage, need)) break;
    if (page < pages) await sleep(300);
  }

  return { jobs: jobs.slice(0, total), error: jobs.length ? undefined : lastError };
}

export async function fetchAdzunaJobs(options?: {
  country?: string;
  q?: string;
  resultsPerCountry?: number;
  forceRefresh?: boolean;
}): Promise<{
  jobs: AdzunaJobNormalized[];
  configured: boolean;
  error?: string;
  countriesFetched: string[];
  fromCache?: boolean;
  cacheTtlHours?: number;
}> {
  if (!isAdzunaConfigured()) {
    return {
      jobs: [],
      configured: false,
      error:
        "Missing ADZUNA_APP_ID or ADZUNA_API_KEY. Get both from https://developer.adzuna.com/admin/access_details",
      countriesFetched: [],
    };
  }

  const countryParam = options?.country?.toLowerCase().trim() || "all";

  if (countryParam === "ie") {
    return {
      jobs: [],
      configured: true,
      error:
        "Ireland (ie) is not supported by Adzuna. Pick Australia, USA, UK, NZ, Canada, or Singapore.",
      countriesFetched: [],
    };
  }

  const targets =
    countryParam === "all"
      ? [...ADZUNA_COUNTRIES]
      : ADZUNA_COUNTRIES.filter((c) => c.code === countryParam);

  if (targets.length === 0) {
    return {
      jobs: [],
      configured: true,
      error: `Unsupported country: ${countryParam}`,
      countriesFetched: [],
    };
  }

  const {
    filterAdzunaJobs,
    getAdzunaCacheMeta,
    getCachedCountryJobs,
  } = await import("@/lib/adzuna-cache");

  const cacheMeta = getAdzunaCacheMeta();

  // Default: ~100/country when browsing all (~600 total), AU gets more
  const resultsPerCountry =
    options?.resultsPerCountry ?? (countryParam === "all" ? 100 : 150);

  const jobs: AdzunaJobNormalized[] = [];
  const countriesFetched: string[] = [];
  const errors: string[] = [];
  let servedFromCache = true;

  // Sequential fetch — parallel bursts trigger Adzuna 429 / WAF 400
  for (let i = 0; i < targets.length; i++) {
    const country = targets[i];
    const total =
      country.code === "au"
        ? Math.max(resultsPerCountry, countryParam === "all" ? 150 : 200)
        : resultsPerCountry;

    const loadCountry = async () => {
      const result = await fetchCountryJobs({
        country,
        total,
      });
      if (result.error) errors.push(result.error);
      return result.jobs;
    };

    let countryJobs: AdzunaJobNormalized[] = [];

    if (options?.forceRefresh) {
      countryJobs = await loadCountry();
      servedFromCache = false;
    } else {
      const cached = await getCachedCountryJobs(country.code, loadCountry, {
        minJobs: Math.min(40, total),
      });
      countryJobs = cached.jobs;
      if (!cached.fromCache) servedFromCache = false;
    }

    if (countryJobs.length > 0) {
      jobs.push(...countryJobs);
      countriesFetched.push(country.code);
    }

    if (i < targets.length - 1) {
      await sleep(options?.forceRefresh ? 400 : 200);
    }
  }

  const filtered = filterAdzunaJobs(jobs, options?.q);

  filtered.sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });

  return {
    jobs: filtered,
    configured: true,
    countriesFetched,
    fromCache: servedFromCache,
    cacheTtlHours: cacheMeta.ttlHours,
    error:
      filtered.length === 0 && errors.length > 0
        ? `Adzuna returned no jobs (${errors.slice(0, 3).join(", ")}). Wait a bit if rate-limited, then retry.`
        : undefined,
  };
}
