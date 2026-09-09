import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Job, serializeJob } from "@/models/Job";
import { Company } from "@/models/Company";
import { ADZUNA_COUNTRIES, fetchAdzunaJobs } from "@/lib/adzuna";
import { fetchHimalayasJobs } from "@/lib/himalayas";
import { fetchJoobleJobs } from "@/lib/jooble";

export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const location = searchParams.get("location")?.trim() || "";
    const companyId = searchParams.get("companyId")?.trim() || "";
    const companyName = searchParams.get("company")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const workMode = searchParams.get("workMode")?.trim() || "";
    const employmentType = searchParams.get("employmentType")?.trim() || "";
    const experienceLevel = searchParams.get("experienceLevel")?.trim() || "";
    const country = searchParams.get("country")?.trim().toLowerCase() || "all";
    const source = searchParams.get("source")?.trim().toLowerCase() || "all";
    // fast=1 → skip Himalayas fallback loops (first paint)
    const fastMode =
      searchParams.get("fast") === "1" || searchParams.get("fast") === "true";
    const externalCountry = country && country !== "all" ? country : "all";

    const includeGemini = source === "all" || source === "gemini";
    const includeAdzuna = source === "all" || source === "adzuna";
    const includeHimalayas = source === "all" || source === "himalayas";
    const includeJooble = source === "all" || source === "jooble";
    const allowHeavyFallback = !fastMode;

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

    const [adzunaResult, himalayasResult, joobleResult] =
      await Promise.allSettled([
        includeAdzuna
          ? fetchAdzunaJobs({
              country: externalCountry,
              q: q || undefined,
              where: location || undefined,
              resultsPerCountry: q || location ? 50 : 100,
            })
          : Promise.resolve(null),
        includeHimalayas
          ? fetchHimalayasJobs({
              country: externalCountry,
              q: q || undefined,
            })
          : Promise.resolve(null),
        includeJooble
          ? fetchJoobleJobs({
              country: externalCountry,
              q: q || undefined,
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
    // Skipped in fast mode so first paint stays quick
    if (allowHeavyFallback && himalayasFailedCountries.length > 0) {
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
              where: location || undefined,
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

    // Primary sources first; Jooble merged in, then one sort for AU / salary / detail
    const primaryJobs = [...geminiJobs, ...adzunaJobs, ...himalayasJobs];
    const seenIds = new Set<string>();
    const uniquePrimary = primaryJobs.filter((job) => {
      const id = String(job.id);
      if (seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    });

    const uniqueJooble = joobleJobs.filter((job) => {
      const id = String(job.id);
      if (seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    });

    const isAu = (job: Record<string, unknown>) => {
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
    };
    const hasPay = (job: Record<string, unknown>) =>
      Number(job.salaryMin) > 0 || Number(job.salaryMax) > 0;
    const infoScore = (job: Record<string, unknown>) => {
      const strip = (v: unknown) =>
        String(v || "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      let score = 0;
      score += Math.min(strip(job.description).length, 3500);
      score += Math.min(strip(job.requirements).length, 1200);
      score += Math.min(strip(job.responsibilities).length, 1200);
      const skills = Array.isArray(job.skills) ? job.skills : [];
      score += Math.min(skills.length, 20) * 60;
      if (strip(job.benefits)) score += 180;
      if (job.category) score += 40;
      if (job.experienceLevel) score += 30;
      return score;
    };

    const uniqueJobs = [...uniquePrimary, ...uniqueJooble].sort((a, b) => {
      // Australia → salary → richer detail → newer
      const auDiff = Number(isAu(b)) - Number(isAu(a));
      if (auDiff !== 0) return auDiff;
      const rankDiff = Number(hasPay(b)) - Number(hasPay(a));
      if (rankDiff !== 0) return rankDiff;
      const infoDiff = infoScore(b) - infoScore(a);
      if (infoDiff !== 0) return infoDiff;
      const ta = a.createdAt ? new Date(String(a.createdAt)).getTime() : 0;
      const tb = b.createdAt ? new Date(String(b.createdAt)).getTime() : 0;
      return tb - ta;
    });

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
          available: uniqueJobs.length,
        },
        adzuna: adzunaMeta,
        himalayas: himalayasMeta,
        jooble: joobleMeta,
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
