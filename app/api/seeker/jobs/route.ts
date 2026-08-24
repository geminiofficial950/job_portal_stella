import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/requireApiAuth";
import { Job, serializeJob } from "@/models/Job";
import { Company } from "@/models/Company";

export async function GET(request: Request) {
  const result = await requireApiAuth(["user"]);
  if (result.error) return result.error;

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const location = searchParams.get("location")?.trim() || "";

    await connectDB();

    const filter: Record<string, unknown> = { status: "open" };
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { skills: { $regex: q, $options: "i" } },
      ];
    }
    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    const jobs = await Job.find(filter).sort({ createdAt: -1 }).limit(50).lean();
    const companyIds = [...new Set(jobs.map((j) => String(j.companyId)))];
    const companies = await Company.find({ _id: { $in: companyIds } })
      .select("name logoUrl location industry status")
      .lean();
    const companyMap = new Map(companies.map((c) => [String(c._id), c]));

    return NextResponse.json({
      success: true,
      jobs: jobs.map((job) => {
        const company = companyMap.get(String(job.companyId));
        return {
          ...serializeJob(job as Parameters<typeof serializeJob>[0]),
          company: company
            ? {
                name: company.name,
                logoUrl: company.logoUrl || "",
                location: company.location || "",
                industry: company.industry || "",
              }
            : null,
        };
      }),
    });
  } catch (error) {
    console.error("Seeker jobs GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load jobs" },
      { status: 500 }
    );
  }
}
