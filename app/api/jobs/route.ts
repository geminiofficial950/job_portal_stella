import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/requireApiAuth";
import { parseJobBody } from "@/lib/jobValidation";
import { Company } from "@/models/Company";
import { Job, serializeJob } from "@/models/Job";

function badRequest(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function GET() {
  const result = await requireApiAuth(["recruiter"]);
  if (result.error) return result.error;

  try {
    await connectDB();
    const jobs = await Job.find({ recruiterId: result.auth.sub })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      jobs: jobs.map((job) =>
        serializeJob(job as Parameters<typeof serializeJob>[0])
      ),
    });
  } catch (error) {
    console.error("Jobs GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const result = await requireApiAuth(["recruiter"]);
  if (result.error) return result.error;

  try {
    const body = await request.json();
    const parsed = parseJobBody(body);
    if (parsed.error || !parsed.data) {
      return badRequest(parsed.error || "Invalid job data");
    }

    await connectDB();

    const company = await Company.findOne({ ownerId: result.auth.sub });
    if (!company) {
      return badRequest(
        "Create and get your company profile approved before posting jobs",
        403
      );
    }
    if (company.status !== "approved") {
      return badRequest(
        "Your company must be approved before you can post jobs",
        403
      );
    }

    const job = await Job.create({
      ...parsed.data,
      recruiterId: result.auth.sub,
      companyId: company._id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Job posted successfully",
        job: serializeJob(job),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Jobs POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create job" },
      { status: 500 }
    );
  }
}
