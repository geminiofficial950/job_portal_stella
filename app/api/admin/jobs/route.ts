import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/requireApiAuth";
import { Job, serializeJob } from "@/models/Job";
import { User } from "@/models/User";
import { Company } from "@/models/Company";

export async function GET(request: Request) {
  const result = await requireApiAuth(["admin"]);
  if (result.error) return result.error;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const q = searchParams.get("q")?.trim() || "";

    await connectDB();

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ];
    }

    const jobs = await Job.find(filter).sort({ createdAt: -1 }).lean();

    const recruiterIds = [...new Set(jobs.map((j) => String(j.recruiterId)))];
    const companyIds = [...new Set(jobs.map((j) => String(j.companyId)))];

    const [recruiters, companies] = await Promise.all([
      User.find({ _id: { $in: recruiterIds } })
        .select("name email")
        .lean(),
      Company.find({ _id: { $in: companyIds } })
        .select("name status")
        .lean(),
    ]);

    const recruiterMap = new Map(
      recruiters.map((r) => [String(r._id), r])
    );
    const companyMap = new Map(companies.map((c) => [String(c._id), c]));

    return NextResponse.json({
      success: true,
      jobs: jobs.map((job) => {
        const serialized = serializeJob(
          job as unknown as Parameters<typeof serializeJob>[0]
        );
        const recruiter = recruiterMap.get(String(job.recruiterId));
        const company = companyMap.get(String(job.companyId));
        return {
          ...serialized,
          recruiter: recruiter
            ? { name: recruiter.name, email: recruiter.email }
            : null,
          company: company
            ? {
                name: company.name,
                status: company.status,
              }
            : null,
        };
      }),
    });
  } catch (error) {
    console.error("Admin jobs GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load jobs" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const result = await requireApiAuth(["admin"]);
  if (result.error) return result.error;

  try {
    const body = await request.json();
    const jobId = String(body.jobId ?? "");
    const status = String(body.status ?? "");

    if (!jobId) {
      return NextResponse.json(
        { success: false, message: "jobId is required" },
        { status: 400 }
      );
    }

    const allowed = ["draft", "open", "paused", "closed"];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    await connectDB();
    const job = await Job.findByIdAndUpdate(
      jobId,
      { $set: { status } },
      { new: true }
    );

    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Job updated",
      job: serializeJob(job),
    });
  } catch (error) {
    console.error("Admin jobs PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update job" },
      { status: 500 }
    );
  }
}
