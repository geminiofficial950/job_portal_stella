import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Job, serializeJob } from "@/models/Job";
import { Company } from "@/models/Company";
import { ADZUNA_COUNTRIES, fetchAdzunaJobs } from "@/lib/adzuna";
import { fetchHimalayasJobs } from "@/lib/himalayas";

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

    let geminiJobs: Array<Record<string, unknown>> = [];
    let filterCompanies: Array<{ id: string; name: string }> = [];
    let categories: string[] = [];

    if (includeGemini) {
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
          ...serializeJob(job as unknown as Parameters<typeof serializeJob>[0]),
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
    }

    let adzunaJobs: Array<Record<string, unknown>> = [];
    let himalayasJobs: Array<Record<string, unknown>> = [];
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
    } = { configured: false, countriesFetched: [] };

    if (includeAdzuna) {
      const adzuna = await fetchAdzunaJobs({
        country: "all",
        q: q || undefined,
        resultsPerCountry: 100,
      });
      adzunaMeta = {
        configured: adzuna.configured,
        error: adzuna.error,
        countriesFetched: adzuna.countriesFetched,
        fromCache: adzuna.fromCache,
        cacheTtlHours: adzuna.cacheTtlHours,
      };

      let adzunaFiltered = adzuna.jobs;
      if (country !== "all") {
        adzunaFiltered = adzunaFiltered.filter(
          (job) => job.country === country,
        );
      }

      adzunaJobs = adzunaFiltered
        .filter((job) => {
          if (category && category !== "All") {
            if (job.category.toLowerCase() !== category.toLowerCase()) {
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
              !job.company.name
                .toLowerCase()
                .includes(companyName.toLowerCase())
            ) {
              return false;
            }
          }
          return true;
        })
        .map((job) => ({ ...job }));

      // Merge Adzuna categories + companies into filter lists
      const catSet = new Set(categories);
      const companyMap = new Map(filterCompanies.map((c) => [c.id, c]));
      for (const job of adzuna.jobs) {
        if (job.category) catSet.add(job.category);
        if (!companyMap.has(job.company.id)) {
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
    }

    if (includeHimalayas) {
      const himalayas = await fetchHimalayasJobs({
        country: "all",
        q: q || undefined,
      });
      himalayasMeta = {
        configured: himalayas.configured,
        error: himalayas.error,
        countriesFetched: himalayas.countriesFetched,
        fromCache: himalayas.fromCache,
        cacheTtlHours: himalayas.cacheTtlHours,
      };

      let himalayasFiltered = himalayas.jobs;
      if (country !== "all") {
        himalayasFiltered = himalayasFiltered.filter(
          (job) => job.country === country,
        );
      }

      himalayasJobs = himalayasFiltered
        .filter((job) => {
          if (category && category !== "All") {
            if (job.category.toLowerCase() !== category.toLowerCase()) {
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
              !job.company.name
                .toLowerCase()
                .includes(companyName.toLowerCase())
            ) {
              return false;
            }
          }
          return true;
        })
        .map((job) => ({ ...job }));

      const catSet = new Set(categories);
      const companyMap = new Map(filterCompanies.map((c) => [c.id, c]));
      for (const job of himalayas.jobs) {
        if (job.category) catSet.add(job.category);
        if (!companyMap.has(job.company.id)) {
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
    }

    const jobs = [...geminiJobs, ...adzunaJobs, ...himalayasJobs];
    const seenIds = new Set<string>();
    const uniqueJobs = jobs.filter((job) => {
      const id = String(job.id);
      if (seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    });

    uniqueJobs.sort((a, b) => {
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
        adzuna: adzunaMeta,
        himalayas: himalayasMeta,
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
