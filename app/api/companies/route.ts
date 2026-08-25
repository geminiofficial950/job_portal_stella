import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Company } from "@/models/Company";
import { Job } from "@/models/Job";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const industry = searchParams.get("industry")?.trim() || "";

    await connectDB();

    const filter: Record<string, unknown> = { status: "approved" };
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { industry: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
        { about: { $regex: q, $options: "i" } },
      ];
    }
    if (industry && industry !== "All") {
      filter.industry = { $regex: `^${industry}$`, $options: "i" };
    }

    const companies = await Company.find(filter)
      .sort({ approvedAt: -1, updatedAt: -1 })
      .lean();

    const companyIds = companies.map((c) => c._id);
    const openJobCounts = await Job.aggregate<{
      _id: (typeof companyIds)[number];
      count: number;
    }>([
      {
        $match: {
          companyId: { $in: companyIds },
          status: "open",
        },
      },
      { $group: { _id: "$companyId", count: { $sum: 1 } } },
    ]);

    const countMap = new Map(
      openJobCounts.map((row) => [String(row._id), row.count]),
    );

    const industries = await Company.distinct("industry", {
      status: "approved",
      industry: { $nin: ["", null] },
    });

    return NextResponse.json({
      success: true,
      companies: companies.map((c) => ({
        id: String(c._id),
        name: c.name,
        website: c.website || "",
        industry: c.industry || "",
        location: c.location || "",
        size: c.size || "",
        about: c.about || "",
        logoUrl: c.logoUrl || "",
        openJobsCount: countMap.get(String(c._id)) ?? 0,
      })),
      industries: (industries as string[])
        .map((i) => i.trim())
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    });
  } catch (error) {
    console.error("Public companies GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load companies" },
      { status: 500 },
    );
  }
}
