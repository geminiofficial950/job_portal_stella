import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/requireApiAuth";
import {
  Application,
  serializeApplication,
  STATUS_LABELS,
} from "@/models/Application";
import {
  BoardApplication,
  serializeBoardApplication,
} from "@/models/BoardApplication";
import { Job } from "@/models/Job";
import { Company } from "@/models/Company";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";

function badRequest(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

function isProfileReady(profile: {
  headline?: string | null;
  location?: string | null;
  about?: string | null;
  skills?: string[] | null;
  experienceLevel?: string | null;
  education?: string | null;
  resumeUrl?: string | null;
  linkedin?: string | null;
  salaryExpectation?: string | null;
} | null) {
  if (!profile) return false;
  return Boolean(
    profile.headline?.trim() &&
      profile.location?.trim() &&
      profile.about?.trim() &&
      profile.skills?.length &&
      profile.experienceLevel &&
      profile.education?.trim() &&
      profile.resumeUrl?.trim() &&
      profile.linkedin?.trim() &&
      profile.salaryExpectation?.trim(),
  );
}

function boardExternalKey(source: string, id: string) {
  return `${source || "board"}:${id}`.slice(0, 200);
}

/** Seeker: list my applications (Stella jobs + board listings) */
export async function GET() {
  const result = await requireApiAuth(["user"]);
  if (result.error) return result.error;

  try {
    await connectDB();
    const [apps, boardApps] = await Promise.all([
      Application.find({ seekerId: result.auth.sub })
        .sort({ updatedAt: -1 })
        .lean(),
      BoardApplication.find({ seekerId: result.auth.sub })
        .sort({ updatedAt: -1 })
        .lean(),
    ]);

    const jobIds = apps.map((a) => a.jobId);
    const companyIds = apps.map((a) => a.companyId);
    const [jobs, companies] = await Promise.all([
      Job.find({ _id: { $in: jobIds } })
        .select("title location employmentType workMode status category")
        .lean(),
      Company.find({ _id: { $in: companyIds } })
        .select("name logoUrl")
        .lean(),
    ]);
    const jobMap = new Map(jobs.map((j) => [String(j._id), j]));
    const companyMap = new Map(companies.map((c) => [String(c._id), c]));

    const stella = apps.map((app) => {
      const job = jobMap.get(String(app.jobId));
      const company = companyMap.get(String(app.companyId));
      return {
        ...serializeApplication(
          app as unknown as Parameters<typeof serializeApplication>[0],
        ),
        kind: "stella" as const,
        statusLabel: STATUS_LABELS[app.status],
        job: job
          ? {
              title: job.title,
              location: job.location,
              employmentType: job.employmentType,
              workMode: job.workMode,
              status: job.status,
              category: job.category,
            }
          : null,
        company: company
          ? { name: company.name, logoUrl: company.logoUrl || "" }
          : null,
      };
    });

    const board = boardApps.map((app) => ({
      ...serializeBoardApplication(
        app as unknown as Parameters<typeof serializeBoardApplication>[0],
      ),
      statusLabel: STATUS_LABELS[app.status],
    }));

    const applications = [...stella, ...board].sort((a, b) => {
      const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return tb - ta;
    });

    return NextResponse.json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error("Seeker applications GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load applications" },
      { status: 500 },
    );
  }
}

/** Seeker: apply on Stella (employer job or board listing) */
export async function POST(request: Request) {
  const result = await requireApiAuth(["user"]);
  if (result.error) return result.error;

  try {
    const body = await request.json();
    const jobId = String(body.jobId ?? "").trim();
    const coverNote = String(body.coverNote ?? "").trim().slice(0, 1000);
    const boardJob =
      body.boardJob && typeof body.boardJob === "object"
        ? (body.boardJob as Record<string, unknown>)
        : null;

    await connectDB();

    const user = await User.findById(result.auth.sub)
      .select("name seekerProfile")
      .lean();
    if (!user) return badRequest("User not found", 404);

    if (!isProfileReady(user.seekerProfile || null)) {
      return badRequest(
        "Complete your profile before applying (headline, skills, resume, LinkedIn, salary, etc.)",
      );
    }

    // Board / imported listing apply (Adzuna, Jooble, Himalayas, etc.)
    if (boardJob || (jobId && !mongoose.Types.ObjectId.isValid(jobId))) {
      const source = String(boardJob?.source || body.source || "board")
        .trim()
        .slice(0, 40);
      const externalId = String(boardJob?.id || jobId || "")
        .trim()
        .slice(0, 160);
      const title = String(boardJob?.title || body.title || "Role")
        .trim()
        .slice(0, 200);
      if (!externalId || !title) {
        return badRequest("Job details are required to apply");
      }

      const externalKey = boardExternalKey(source, externalId);
      const existing = await BoardApplication.findOne({
        seekerId: result.auth.sub,
        externalKey,
      }).lean();
      if (existing) {
        return badRequest("You already applied to this job");
      }

      const companyName = String(
        boardJob?.companyName ||
          (typeof boardJob?.company === "object" &&
          boardJob?.company &&
          "name" in (boardJob.company as object)
            ? (boardJob.company as { name?: unknown }).name
            : "") ||
          body.companyName ||
          "",
      )
        .trim()
        .slice(0, 160);

      const app = await BoardApplication.create({
        seekerId: result.auth.sub,
        externalKey,
        source: source || "board",
        title,
        companyName,
        location: String(boardJob?.location || body.location || "")
          .trim()
          .slice(0, 200),
        employmentType: String(
          boardJob?.employmentType || body.employmentType || "",
        )
          .trim()
          .slice(0, 40),
        workMode: String(boardJob?.workMode || body.workMode || "")
          .trim()
          .slice(0, 40),
        category: String(boardJob?.category || body.category || "")
          .trim()
          .slice(0, 80),
        listingUrl: String(
          boardJob?.applyUrl || boardJob?.listingUrl || body.applyUrl || "",
        )
          .trim()
          .slice(0, 1000),
        status: "pending",
        coverNote,
      });

      return NextResponse.json({
        success: true,
        message: "Application submitted",
        application: serializeBoardApplication(app),
      });
    }

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return badRequest("Valid job id is required");
    }

    const job = await Job.findById(jobId).lean();
    if (!job) return badRequest("Job not found", 404);
    if (job.status !== "open") {
      return badRequest("This job is not open for applications");
    }
    if (
      job.applicationDeadline &&
      new Date(job.applicationDeadline).getTime() < Date.now()
    ) {
      return badRequest("Application deadline has passed");
    }

    const existing = await Application.findOne({
      jobId: job._id,
      seekerId: result.auth.sub,
    }).lean();
    if (existing) {
      return badRequest("You already applied to this job");
    }

    const app = await Application.create({
      jobId: job._id,
      seekerId: result.auth.sub,
      recruiterId: job.recruiterId,
      companyId: job.companyId,
      status: "pending",
      coverNote,
    });

    const company = await Company.findById(job.companyId).select("name").lean();

    await Notification.create({
      userId: job.recruiterId,
      type: "application_received",
      title: "New application",
      message: `${user.name} applied for ${job.title}${
        company?.name ? ` at ${company.name}` : ""
      }.`,
      link: "/dashboard/recruiter/applications",
      applicationId: app._id,
      read: false,
    });

    return NextResponse.json({
      success: true,
      message: "Application submitted",
      application: serializeApplication(app),
    });
  } catch (error) {
    console.error("Seeker apply POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to apply" },
      { status: 500 },
    );
  }
}
