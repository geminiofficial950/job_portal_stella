import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Job, serializeJob } from "@/models/Job";
import { Company } from "@/models/Company";
import { ADZUNA_COUNTRIES, fetchAdzunaJobs } from "@/lib/adzuna";
import { fetchHimalayasJobs } from "@/lib/himalayas";
import { fetchJoobleJobs } from "@/lib/jooble";
import { fetchCoresignalJobs } from "@/lib/coresignal";

// Cold Coresignal collects can take a while — allow longer on Node runtime
export const maxDuration = 120;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const companyId = searchParams.get("companyId")?.trim() || "";
    const companyName = searchParams.get("company")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const workMode = searchParams.get("workMode")?.trim() || "";
    const employmentType = searchParams.get("employmentType")?.trim() || "";
    const experienceLevel = searchParams.get("experienceLevel")?.trim() || "";
    const country = searchParams.get("country")?.trim().toLowerCase() || "all";
    const source = searchParams.get("source")?.trim().toLowerCase() || "all";

    const includeGemini = source === "all" || source === "gemini";
    const includeAdzuna = source === "all" || source === "adzuna";
    const includeHimalayas = source === "all" || source === "himalayas";
    const includeJooble = source === "all" || source === "jooble";
    const includeCoresignal = source === "all" || source === "coresignal";

    let geminiJobs: Array<Record<string, unknown>> = [];
    let filterCompanies: Array<{ id: string; name: string }> = [];
    let categories: string[] = [];

    if (includeGemini) {
      try {
        await connectDB();

        const filter: Record<string, unknown> = { status: "open" };

        if (q) {
          filter.$or = [
            { title: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
            { category: { $regex: q, $options: "i" } },
            { skills: { $regex: q, $options: "i" } },
          ];
        }
        if (category && category !== "All") {
          filter.category = { $regex: `^${category}$`, $options: "i" };
        }
        if (workMode) {
          filter.workMode = workMode.toLowerCase();
        }
        if (employmentType) {
          filter.employmentType = employmentType;
        }
        if (experienceLevel) {
          filter.experienceLevel = experienceLevel.toLowerCase();
        }
        if (companyId) {
          filter.companyId = companyId;
        }

        let jobs = await Job.find(filter)
          .sort({ createdAt: -1 })
          .limit(100)
          .lean();

        const companyIds = [...new Set(jobs.map((j) => String(j.companyId)))];
        const companies = await Company.find({
          _id: { $in: companyIds },
          status: "approved",
        })
          .select("name logoUrl location industry about website size")
          .lean();

        const companyMap = new Map(companies.map((c) => [String(c._id), c]));
        jobs = jobs.filter((j) => companyMap.has(String(j.companyId)));

        if (companyName) {
          const needle = companyName.toLowerCase();
          jobs = jobs.filter((j) => {
            const c = companyMap.get(String(j.companyId));
            return c?.name?.toLowerCase().includes(needle);
          });
        }

        // Country filter for Gemini jobs (location text heuristic)
        if (country !== "all") {
          const countryMeta = ADZUNA_COUNTRIES.find((c) => c.code === country);
          const needles = [
            country,
            countryMeta?.label.toLowerCase() || "",
            country === "gb" ? "uk" : "",
            country === "gb" ? "united kingdom" : "",
            country === "us" ? "united states" : "",
            country === "us" ? "usa" : "",
          ].filter(Boolean);

          jobs = jobs.filter((j) => {
            const loc = String(j.location || "").toLowerCase();
            return needles.some((n) => loc.includes(n));
          });
        }

        const openCompanyIds = await Job.distinct("companyId", {
          status: "open",
        });
        const dbCompanies = await Company.find({
          _id: { $in: openCompanyIds },
          status: "approved",
        })
          .select("name")
          .sort({ name: 1 })
          .lean();

        filterCompanies = dbCompanies.map((c) => ({
          id: String(c._id),
          name: c.name,
        }));

        categories = (
          await Job.distinct("category", {
            status: "open",
            companyId: { $in: openCompanyIds },
          })
        )
          .map((c) => String(c).trim())
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));

        geminiJobs = jobs.map((job) => {
          const company = companyMap.get(String(job.companyId));
          return {
            ...serializeJob(
              job as unknown as Parameters<typeof serializeJob>[0],
            ),
            source: "gemini",
            applyUrl: "",
            country: "",
            countryLabel: "",
            company: company
              ? {
                  id: String(company._id),
                  name: company.name,
                  logoUrl: company.logoUrl || "",
                  location: company.location || "",
                  industry: company.industry || "",
                  about: company.about || "",
                  website: company.website || "",
                  size: company.size || "",
                }
              : null,
          };
        });
      } catch (dbError) {
        console.warn(
          "Browse Gemini/MongoDB unavailable — continuing with external sources:",
          dbError instanceof Error ? dbError.message : dbError,
        );
        geminiJobs = [];
      }
    }

    let adzunaJobs: Array<Record<string, unknown>> = [];
    let himalayasJobs: Array<Record<string, unknown>> = [];
    let joobleJobs: Array<Record<string, unknown>> = [];
    let coresignalJobs: Array<Record<string, unknown>> = [];
    let adzunaMeta: {
      configured: boolean;
      error?: string;
      countriesFetched: string[];
      fromCache?: boolean;
      cacheTtlHours?: number;
    } = { configured: false, countriesFetched: [] };
    let himalayasMeta: {
      configured: boolean;
      error?: string;
      countriesFetched: string[];
      fromCache?: boolean;
      cacheTtlHours?: number;
      failedCountries?: string[];
    } = { configured: false, countriesFetched: [] };
    let joobleMeta: {
      configured: boolean;
      error?: string;
      countriesFetched: string[];
      fromCache?: boolean;
      cacheTtlHours?: number;
    } = { configured: false, countriesFetched: [] };
    let coresignalMeta: {
      configured: boolean;
      error?: string;
      countriesFetched: string[];
      fromCache?: boolean;
      cacheTtlHours?: number;
      totalAvailable?: number;
      totalsByCountry?: Record<string, number>;
    } = { configured: false, countriesFetched: [], totalAvailable: 0 };

    // External APIs run independently — one failure must not block the others.
    // If Himalayas fails for a country, Adzuna (then Jooble) fills that gap.
    const matchesBrowseFilters = (job: {
      category?: string;
      workMode?: string;
      employmentType?: string;
      experienceLevel?: string;
      company?: { name?: string };
      country?: string;
    }) => {
      if (country !== "all" && job.country && job.country !== country) {
        return false;
      }
      if (category && category !== "All") {
        if ((job.category || "").toLowerCase() !== category.toLowerCase()) {
          return false;
        }
      }
      if (workMode && job.workMode !== workMode.toLowerCase()) return false;
      if (
        employmentType &&
        job.employmentType !== employmentType.toLowerCase()
      ) {
        return false;
      }
      if (
        experienceLevel &&
        job.experienceLevel !== experienceLevel.toLowerCase()
      ) {
        return false;
      }
      if (companyName) {
        if (
          !(job.company?.name || "")
            .toLowerCase()
            .includes(companyName.toLowerCase())
        ) {
          return false;
        }
      }
      return true;
    };

    const mergeCompanyCategoryMeta = (
      sourceJobs: Array<{
        category?: string;
        company?: { id: string; name: string };
      }>,
    ) => {
      const catSet = new Set(categories);
      const companyMap = new Map(filterCompanies.map((c) => [c.id, c]));
      for (const job of sourceJobs) {
        if (job.category) catSet.add(job.category);
        if (job.company?.id && !companyMap.has(job.company.id)) {
          companyMap.set(job.company.id, {
            id: job.company.id,
            name: job.company.name,
          });
        }
      }
      categories = [...catSet].sort((a, b) => a.localeCompare(b));
      filterCompanies = [...companyMap.values()].sort((a, b) =>
        a.name.localeCompare(b.name),
      );
    };

    const [adzunaResult, himalayasResult, joobleResult, coresignalResult] =
      await Promise.allSettled([
        includeAdzuna
          ? fetchAdzunaJobs({
              country: "all",
              q: q || undefined,
              resultsPerCountry: 100,
            })
          : Promise.resolve(null),
        includeHimalayas
          ? fetchHimalayasJobs({
              country: "all",
              q: q || undefined,
            })
          : Promise.resolve(null),
        includeJooble
          ? fetchJoobleJobs({
              country: "all",
              q: q || undefined,
            })
          : Promise.resolve(null),
        includeCoresignal
          ? fetchCoresignalJobs({
              country: "all",
              q: q || undefined,
              jobsPerCountry: Number(
                process.env.CORESIGNAL_JOBS_PER_COUNTRY || "40",
              ),
            })
          : Promise.resolve(null),
      ]);

    if (adzunaResult.status === "fulfilled" && adzunaResult.value) {
      const adzuna = adzunaResult.value;
      adzunaMeta = {
        configured: adzuna.configured,
        error: adzuna.error,
        countriesFetched: adzuna.countriesFetched,
        fromCache: adzuna.fromCache,
        cacheTtlHours: adzuna.cacheTtlHours,
      };
      adzunaJobs = adzuna.jobs
        .filter(matchesBrowseFilters)
        .map((job) => ({ ...job }));
      mergeCompanyCategoryMeta(adzuna.jobs);
    } else if (adzunaResult.status === "rejected") {
      console.warn("Adzuna browse failed:", adzunaResult.reason);
      adzunaMeta = {
        configured: true,
        error:
          adzunaResult.reason instanceof Error
            ? adzunaResult.reason.message
            : "Adzuna failed",
        countriesFetched: [],
      };
    }

    let himalayasFailedCountries: string[] = [];
    if (himalayasResult.status === "fulfilled" && himalayasResult.value) {
      const himalayas = himalayasResult.value;
      himalayasFailedCountries = himalayas.failedCountries || [];
      himalayasMeta = {
        configured: himalayas.configured,
        error: himalayas.error,
        countriesFetched: himalayas.countriesFetched,
        fromCache: himalayas.fromCache,
        cacheTtlHours: himalayas.cacheTtlHours,
        failedCountries: himalayasFailedCountries,
      };
      himalayasJobs = himalayas.jobs
        .filter(matchesBrowseFilters)
        .map((job) => ({ ...job }));
      mergeCompanyCategoryMeta(himalayas.jobs);
    } else if (himalayasResult.status === "rejected") {
      console.warn("Himalayas browse failed:", himalayasResult.reason);
      himalayasFailedCountries = ADZUNA_COUNTRIES.map((c) => c.code);
      himalayasMeta = {
        configured: true,
        error:
          himalayasResult.reason instanceof Error
            ? himalayasResult.reason.message
            : "Himalayas failed",
        countriesFetched: [],
        failedCountries: himalayasFailedCountries,
      };
    }

    // Fallback: countries Himalayas missed → pull extra from Adzuna (then Jooble)
    if (himalayasFailedCountries.length > 0) {
      console.warn(
        "Himalayas failed for countries, falling back:",
        himalayasFailedCountries.join(", "),
      );

      for (const code of himalayasFailedCountries) {
        if (country !== "all" && country !== code) continue;

        try {
          if (includeAdzuna) {
            const extra = await fetchAdzunaJobs({
              country: code,
              q: q || undefined,
              resultsPerCountry: 80,
            });
            const existing = new Set(adzunaJobs.map((j) => String(j.id)));
            for (const job of extra.jobs.filter(matchesBrowseFilters)) {
              if (existing.has(job.id)) continue;
              existing.add(job.id);
              adzunaJobs.push({ ...job });
            }
            mergeCompanyCategoryMeta(extra.jobs);
            if (!adzunaMeta.countriesFetched.includes(code) && extra.jobs.length) {
              adzunaMeta.countriesFetched = [
                ...adzunaMeta.countriesFetched,
                code,
              ];
            }
            if (extra.jobs.length > 0) continue;
          }

          if (includeJooble) {
            const extra = await fetchJoobleJobs({
              country: code,
              q: q || undefined,
              jobsPerCountry: 40,
            });
            const existing = new Set(joobleJobs.map((j) => String(j.id)));
            for (const job of extra.jobs.filter(matchesBrowseFilters)) {
              if (existing.has(String(job.id))) continue;
              existing.add(String(job.id));
              joobleJobs.push({ ...job });
            }
            mergeCompanyCategoryMeta(extra.jobs);
          }
        } catch (fallbackErr) {
          console.warn(
            `Fallback fetch failed for ${code}:`,
            fallbackErr instanceof Error ? fallbackErr.message : fallbackErr,
          );
        }
      }
    }

    if (joobleResult.status === "fulfilled" && joobleResult.value) {
      const jooble = joobleResult.value;
      joobleMeta = {
        configured: jooble.configured,
        error: jooble.error,
        countriesFetched: jooble.countriesFetched,
        fromCache: jooble.fromCache,
        cacheTtlHours: jooble.cacheTtlHours,
      };
      // Merge with any fallback jooble jobs already added
      const existing = new Set(joobleJobs.map((j) => String(j.id)));
      for (const job of jooble.jobs.filter(matchesBrowseFilters)) {
        if (existing.has(String(job.id))) continue;
        existing.add(String(job.id));
        joobleJobs.push({ ...job });
      }
      mergeCompanyCategoryMeta(jooble.jobs);
    } else if (joobleResult.status === "rejected") {
      console.warn("Jooble browse failed:", joobleResult.reason);
      if (!joobleMeta.configured) {
        joobleMeta = {
          configured: true,
          error:
            joobleResult.reason instanceof Error
              ? joobleResult.reason.message
              : "Jooble failed",
          countriesFetched: [],
        };
      }
    }

    if (coresignalResult.status === "fulfilled" && coresignalResult.value) {
      const coresignal = coresignalResult.value;
      coresignalMeta = {
        configured: coresignal.configured,
        error: coresignal.error,
        countriesFetched: coresignal.countriesFetched,
        fromCache: coresignal.fromCache,
        cacheTtlHours: coresignal.cacheTtlHours,
        totalAvailable: coresignal.totalAvailable,
        totalsByCountry: coresignal.totalsByCountry,
      };
      coresignalJobs = coresignal.jobs
        .filter(matchesBrowseFilters)
        .map((job) => ({ ...job }));
      mergeCompanyCategoryMeta(coresignal.jobs);
    } else if (coresignalResult.status === "rejected") {
      console.warn("Coresignal browse failed:", coresignalResult.reason);
      coresignalMeta = {
        configured: true,
        error:
          coresignalResult.reason instanceof Error
            ? coresignalResult.reason.message
            : "Coresignal failed",
        countriesFetched: [],
        totalAvailable: 0,
      };
    }

    // Primary sources first; Jooble then Coresignal always appended last
    const primaryJobs = [...geminiJobs, ...adzunaJobs, ...himalayasJobs];
    const seenIds = new Set<string>();
    const uniquePrimary = primaryJobs.filter((job) => {
      const id = String(job.id);
      if (seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    });

    uniquePrimary.sort((a, b) => {
      const hasPay = (job: Record<string, unknown>) =>
        Number(job.salaryMin) > 0 || Number(job.salaryMax) > 0;

      // Salary / payout first, then jobs without pay — all categories/countries
      const rankDiff = Number(hasPay(b)) - Number(hasPay(a));
      if (rankDiff !== 0) return rankDiff;

      const isAu = (job: Record<string, unknown>) => {
        if (job.country === "au") return true;
        return `${job.location || ""} ${job.countryLabel || ""}`
          .toLowerCase()
          .includes("australia");
      };
      const auDiff = Number(isAu(b)) - Number(isAu(a));
      if (auDiff !== 0) return auDiff;

      const ta = a.createdAt ? new Date(String(a.createdAt)).getTime() : 0;
      const tb = b.createdAt ? new Date(String(b.createdAt)).getTime() : 0;
      return tb - ta;
    });

    const uniqueJooble = joobleJobs.filter((job) => {
      const id = String(job.id);
      if (seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    });

    uniqueJooble.sort((a, b) => {
      const ta = a.createdAt ? new Date(String(a.createdAt)).getTime() : 0;
      const tb = b.createdAt ? new Date(String(b.createdAt)).getTime() : 0;
      return tb - ta;
    });

    const uniqueCoresignal = coresignalJobs.filter((job) => {
      const id = String(job.id);
      if (seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    });

    uniqueCoresignal.sort((a, b) => {
      const ta = a.createdAt ? new Date(String(a.createdAt)).getTime() : 0;
      const tb = b.createdAt ? new Date(String(b.createdAt)).getTime() : 0;
      return tb - ta;
    });

    const uniqueJobs = [
      ...uniquePrimary,
      ...uniqueJooble,
      ...uniqueCoresignal,
    ];

    const coresignalAvailable =
      country !== "all"
        ? Number(coresignalMeta.totalsByCountry?.[country] || 0)
        : Number(coresignalMeta.totalAvailable || 0);

    // True marketplace size from Coresignal + currently loaded jobs from other sources
    const otherLoaded = uniqueJobs.filter(
      (job) => job.source !== "coresignal",
    ).length;
    const availableTotal = coresignalAvailable + otherLoaded;

    return NextResponse.json(
      {
        success: true,
        jobs: uniqueJobs,
        companies: filterCompanies,
        categories,
        countries: ADZUNA_COUNTRIES.map((c) => ({
          code: c.code,
          label: c.label,
          flag: c.flag,
        })),
        jobCounts: {
          loaded: uniqueJobs.length,
          available: availableTotal,
          coresignalAvailable,
          byCountry: coresignalMeta.totalsByCountry || {},
        },
        adzuna: adzunaMeta,
        himalayas: himalayasMeta,
        jooble: joobleMeta,
        coresignal: coresignalMeta,
      },
      {
        headers: {
          "Cache-Control": "private, max-age=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    console.error("Browse jobs GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load jobs" },
      { status: 500 },
    );
  }
}
