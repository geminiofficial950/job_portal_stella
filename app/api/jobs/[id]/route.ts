import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/requireApiAuth";
import { parseJobBody } from "@/lib/jobValidation";
import { Job, serializeJob } from "@/models/Job";

type Params = { params: Promise<{ id: string }> };

function badRequest(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function GET(_request: Request, { params }: Params) {
  const result = await requireApiAuth(["recruiter"]);
  if (result.error) return result.error;

  try {
    const { id } = await params;
    await connectDB();

    const job = await Job.findById(id);
    if (!job) return badRequest("Job not found", 404);

    if (String(job.recruiterId) !== result.auth.sub && result.auth.role !== "admin") {
      return badRequest("Forbidden", 403);
    }

    return NextResponse.json({
      success: true,
      job: serializeJob(job),
    });
  } catch (error) {
    console.error("Job GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load job" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  const result = await requireApiAuth(["recruiter"]);
  if (result.error) return result.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = parseJobBody(body);
    if (parsed.error || !parsed.data) {
      return badRequest(parsed.error || "Invalid job data");
    }

    await connectDB();
    const job = await Job.findById(id);
    if (!job) return badRequest("Job not found", 404);

    if (String(job.recruiterId) !== result.auth.sub && result.auth.role !== "admin") {
      return badRequest("Forbidden", 403);
    }

    Object.assign(job, parsed.data);
    await job.save();

    return NextResponse.json({
      success: true,
      message: "Job updated",
      job: serializeJob(job),
    });
  } catch (error) {
    console.error("Job PUT error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update job" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const result = await requireApiAuth(["recruiter"]);
  if (result.error) return result.error;

  try {
    const { id } = await params;
    await connectDB();

    const job = await Job.findById(id);
    if (!job) return badRequest("Job not found", 404);

    if (String(job.recruiterId) !== result.auth.sub && result.auth.role !== "admin") {
      return badRequest("Forbidden", 403);
    }

    await job.deleteOne();

    return NextResponse.json({
      success: true,
      message: "Job deleted",
    });
  } catch (error) {
    console.error("Job DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete job" },
      { status: 500 }
    );
  }
}
