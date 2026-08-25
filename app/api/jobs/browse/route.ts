import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Job, serializeJob } from "@/models/Job";
import { Company } from "@/models/Company";

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

    let jobs = await Job.find(filter).sort({ createdAt: -1 }).limit(100).lean();

    const companyIds = [...new Set(jobs.map((j) => String(j.companyId)))];
    const companies = await Company.find({
      _id: { $in: companyIds },
      status: "approved",
    })
      .select("name logoUrl location industry about website size")
      .lean();

    const companyMap = new Map(companies.map((c) => [String(c._id), c]));

    // Drop jobs whose company is not approved
    jobs = jobs.filter((j) => companyMap.has(String(j.companyId)));

    if (companyName) {
      const needle = companyName.toLowerCase();
      jobs = jobs.filter((j) => {
        const c = companyMap.get(String(j.companyId));
        return c?.name?.toLowerCase().includes(needle);
      });
    }

    // Companies that currently have at least one open job (for filter tabs)
    const openCompanyIds = await Job.distinct("companyId", { status: "open" });
    const filterCompanies = await Company.find({
      _id: { $in: openCompanyIds },
      status: "approved",
    })
      .select("name")
      .sort({ name: 1 })
      .lean();

    const categories = (
      await Job.distinct("category", {
        status: "open",
        companyId: { $in: openCompanyIds },
      })
    )
      .map((c) => String(c).trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    return NextResponse.json({
      success: true,
      jobs: jobs.map((job) => {
        const company = companyMap.get(String(job.companyId));
        return {
          ...serializeJob(job as unknown as Parameters<typeof serializeJob>[0]),
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
      }),
      companies: filterCompanies.map((c) => ({
        id: String(c._id),
        name: c.name,
      })),
      categories,
    });
  } catch (error) {
    console.error("Browse jobs GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load jobs" },
      { status: 500 },
    );
  }
}
