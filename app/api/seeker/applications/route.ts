import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/requireApiAuth";
import {
  Application,
  serializeApplication,
  STATUS_LABELS,
} from "@/models/Application";
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
      profile.salaryExpectation?.trim()
  );
}

/** Seeker: list my applications */
export async function GET() {
  const result = await requireApiAuth(["user"]);
  if (result.error) return result.error;

  try {
    await connectDB();
    const apps = await Application.find({ seekerId: result.auth.sub })
      .sort({ updatedAt: -1 })
      .lean();

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

    return NextResponse.json({
      success: true,
      applications: apps.map((app) => {
        const job = jobMap.get(String(app.jobId));
        const company = companyMap.get(String(app.companyId));
        return {
          ...serializeApplication(
            app as unknown as Parameters<typeof serializeApplication>[0]
          ),
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
      }),
    });
  } catch (error) {
    console.error("Seeker applications GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load applications" },
      { status: 500 }
    );
  }
}

/** Seeker: apply to a job */
export async function POST(request: Request) {
  const result = await requireApiAuth(["user"]);
  if (result.error) return result.error;

  try {
    const body = await request.json();
    const jobId = String(body.jobId ?? "").trim();
    const coverNote = String(body.coverNote ?? "").trim().slice(0, 1000);

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return badRequest("Valid job id is required");
    }

    await connectDB();

    const user = await User.findById(result.auth.sub)
      .select("name seekerProfile")
      .lean();
    if (!user) return badRequest("User not found", 404);

    if (!isProfileReady(user.seekerProfile || null)) {
      return badRequest(
        "Complete your profile before applying (headline, skills, resume, LinkedIn, salary, etc.)"
      );
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
      { status: 500 }
    );
  }
}
