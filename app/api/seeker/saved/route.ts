import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/requireApiAuth";
import {
  SavedJob,
  savedJobExternalKey,
  serializeSavedJob,
} from "@/models/SavedJob";

function badRequest(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

/** Seeker: list saved jobs */
export async function GET() {
  const result = await requireApiAuth(["user"]);
  if (result.error) return result.error;

  try {
    await connectDB();
    const docs = await SavedJob.find({ seekerId: result.auth.sub })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      saved: docs.map((doc) =>
        serializeSavedJob(
          doc as unknown as Parameters<typeof serializeSavedJob>[0],
        ),
      ),
      jobIds: docs.map((d) => d.jobId),
    });
  } catch (error) {
    console.error("Seeker saved GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load saved jobs" },
      { status: 500 },
    );
  }
}

/** Seeker: save a job */
export async function POST(request: Request) {
  const result = await requireApiAuth(["user"]);
  if (result.error) return result.error;

  try {
    const body = await request.json();
    const jobId = String(body.jobId ?? "").trim().slice(0, 160);
    const title = String(body.title ?? "").trim().slice(0, 200);
    const source = String(body.source ?? "board").trim().slice(0, 40) || "board";

    if (!jobId || !title) {
      return badRequest("Job id and title are required");
    }

    await connectDB();
    const externalKey = savedJobExternalKey(source, jobId);

    const existing = await SavedJob.findOne({
      seekerId: result.auth.sub,
      externalKey,
    }).lean();
    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Already saved",
        saved: serializeSavedJob(
          existing as unknown as Parameters<typeof serializeSavedJob>[0],
        ),
      });
    }

    const companyName = String(
      body.companyName ||
        (body.company &&
        typeof body.company === "object" &&
        "name" in body.company
          ? (body.company as { name?: unknown }).name
          : "") ||
        "",
    )
      .trim()
      .slice(0, 160);

    const companyLogoUrl = String(
      body.companyLogoUrl ||
        (body.company &&
        typeof body.company === "object" &&
        "logoUrl" in body.company
          ? (body.company as { logoUrl?: unknown }).logoUrl
          : "") ||
        "",
    )
      .trim()
      .slice(0, 500);

    const doc = await SavedJob.create({
      seekerId: result.auth.sub,
      externalKey,
      source,
      jobId,
      title,
      companyName,
      companyLogoUrl,
      location: String(body.location || "").trim().slice(0, 200),
      employmentType: String(body.employmentType || "").trim().slice(0, 40),
      workMode: String(body.workMode || "").trim().slice(0, 40),
      category: String(body.category || "").trim().slice(0, 80),
      experienceLevel: String(body.experienceLevel || "").trim().slice(0, 40),
      salaryMin: typeof body.salaryMin === "number" ? body.salaryMin : null,
      salaryMax: typeof body.salaryMax === "number" ? body.salaryMax : null,
      salaryCurrency: String(body.salaryCurrency || "AUD")
        .trim()
        .slice(0, 8),
      salaryPeriod: String(body.salaryPeriod || "").trim().slice(0, 20),
      applyUrl: String(body.applyUrl || "").trim().slice(0, 1000),
      description: String(body.description || "").trim().slice(0, 5000),
    });

    return NextResponse.json({
      success: true,
      message: "Job saved",
      saved: serializeSavedJob(doc),
    });
  } catch (error) {
    console.error("Seeker saved POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save job" },
      { status: 500 },
    );
  }
}

/** Seeker: unsave a job (?jobId= or ?externalKey=) */
export async function DELETE(request: Request) {
  const result = await requireApiAuth(["user"]);
  if (result.error) return result.error;

  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId")?.trim() || "";
    const externalKey = searchParams.get("externalKey")?.trim() || "";
    const source = searchParams.get("source")?.trim() || "board";

    if (!jobId && !externalKey) {
      return badRequest("jobId or externalKey is required");
    }

    await connectDB();
    const filter = externalKey
      ? { seekerId: result.auth.sub, externalKey }
      : jobId
        ? {
            seekerId: result.auth.sub,
            $or: [
              { jobId },
              { externalKey: savedJobExternalKey(source, jobId) },
            ],
          }
        : null;

    if (!filter) return badRequest("jobId or externalKey is required");

    await SavedJob.deleteOne(filter);

    return NextResponse.json({
      success: true,
      message: "Removed from saved",
    });
  } catch (error) {
    console.error("Seeker saved DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to remove saved job" },
      { status: 500 },
    );
  }
}
