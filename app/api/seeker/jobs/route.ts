import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/requireApiAuth";
import { Job, serializeJob } from "@/models/Job";
import { Company } from "@/models/Company";
import { User } from "@/models/User";
import { Application } from "@/models/Application";

function normalizeSkill(s: string) {
  return s.trim().toLowerCase();
}

export async function GET(request: Request) {
  const result = await requireApiAuth(["user"]);
  if (result.error) return result.error;

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const location = searchParams.get("location")?.trim() || "";
    const matchedOnly = searchParams.get("matched") === "1";

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

    let jobs = await Job.find(filter).sort({ createdAt: -1 }).limit(50).lean();

    if (matchedOnly) {
      const user = await User.findById(result.auth.sub)
        .select("seekerProfile.skills")
        .lean();
      const skills = new Set(
        (user?.seekerProfile?.skills || [])
          .map((s) => normalizeSkill(String(s)))
          .filter(Boolean)
      );
      jobs = jobs.filter((job) =>
        (job.skills || []).some((s) => skills.has(normalizeSkill(String(s))))
      );
    }

    const companyIds = [...new Set(jobs.map((j) => String(j.companyId)))];
    const [companies, myApps] = await Promise.all([
      Company.find({ _id: { $in: companyIds } })
        .select("name logoUrl location industry status")
        .lean(),
      Application.find({
        seekerId: result.auth.sub,
        jobId: { $in: jobs.map((j) => j._id) },
      })
        .select("jobId status")
        .lean(),
    ]);
    const companyMap = new Map(companies.map((c) => [String(c._id), c]));
    const appliedMap = new Map(
      myApps.map((a) => [String(a.jobId), a.status])
    );

    return NextResponse.json({
      success: true,
      matchedOnly,
      jobs: jobs.map((job) => {
        const company = companyMap.get(String(job.companyId));
        const appliedStatus = appliedMap.get(String(job._id)) || null;
        return {
          ...serializeJob(job as unknown as Parameters<typeof serializeJob>[0]),
          applied: Boolean(appliedStatus),
          applicationStatus: appliedStatus,
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
