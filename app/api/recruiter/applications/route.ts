import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/requireApiAuth";
import {
  Application,
  serializeApplication,
  STATUS_LABELS,
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from "@/models/Application";
import { Job } from "@/models/Job";
import { Company } from "@/models/Company";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";

function badRequest(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

/** Recruiter: list applications for their jobs */
export async function GET() {
  const result = await requireApiAuth(["recruiter"]);
  if (result.error) return result.error;

  try {
    await connectDB();
    const apps = await Application.find({ recruiterId: result.auth.sub })
      .sort({ updatedAt: -1 })
      .lean();

    const jobIds = apps.map((a) => a.jobId);
    const seekerIds = apps.map((a) => a.seekerId);
    const companyIds = apps.map((a) => a.companyId);

    const [jobs, seekers, companies] = await Promise.all([
      Job.find({ _id: { $in: jobIds } })
        .select("title location status")
        .lean(),
      User.find({ _id: { $in: seekerIds } })
        .select("name email seekerProfile")
        .lean(),
      Company.find({ _id: { $in: companyIds } })
        .select("name logoUrl")
        .lean(),
    ]);

    const jobMap = new Map(jobs.map((j) => [String(j._id), j]));
    const seekerMap = new Map(seekers.map((s) => [String(s._id), s]));
    const companyMap = new Map(companies.map((c) => [String(c._id), c]));

    return NextResponse.json({
      success: true,
      applications: apps.map((app) => {
        const job = jobMap.get(String(app.jobId));
        const seeker = seekerMap.get(String(app.seekerId));
        const company = companyMap.get(String(app.companyId));
        const profile = seeker?.seekerProfile;
        return {
          ...serializeApplication(
            app as unknown as Parameters<typeof serializeApplication>[0]
          ),
          statusLabel: STATUS_LABELS[app.status],
          job: job
            ? { title: job.title, location: job.location, status: job.status }
            : null,
          company: company
            ? { name: company.name, logoUrl: company.logoUrl || "" }
            : null,
          seeker: seeker
            ? {
                name: seeker.name,
                email: seeker.email,
                headline: profile?.headline || "",
                location: profile?.location || "",
                experienceLevel: profile?.experienceLevel || "",
                skills: profile?.skills || [],
                resumeUrl: profile?.resumeUrl || "",
                linkedin: profile?.linkedin || "",
                salaryExpectation: profile?.salaryExpectation || "",
              }
            : null,
        };
      }),
    });
  } catch (error) {
    console.error("Recruiter applications GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load applications" },
      { status: 500 }
    );
  }
}

/** Recruiter: update application status */
export async function PATCH(request: Request) {
  const result = await requireApiAuth(["recruiter"]);
  if (result.error) return result.error;

  try {
    const body = await request.json();
    const applicationId = String(body.applicationId ?? "").trim();
    const status = String(body.status ?? "").trim() as ApplicationStatus;
    const statusNote = String(body.statusNote ?? "").trim().slice(0, 500);

    if (!applicationId) return badRequest("Application id is required");
    if (!APPLICATION_STATUSES.includes(status)) {
      return badRequest("Invalid status");
    }

    await connectDB();
    const app = await Application.findById(applicationId);
    if (!app) return badRequest("Application not found", 404);
    if (String(app.recruiterId) !== result.auth.sub) {
      return badRequest("Forbidden", 403);
    }

    const previous = app.status;
    if (previous === status && !statusNote) {
      return NextResponse.json({
        success: true,
        message: "No change",
        application: serializeApplication(app),
      });
    }

    app.status = status;
    if (statusNote) app.statusNote = statusNote;
    await app.save();

    if (previous !== status) {
      const job = await Job.findById(app.jobId).select("title").lean();
      const company = await Company.findById(app.companyId)
        .select("name")
        .lean();
      const label = STATUS_LABELS[status];

      await Notification.create({
        userId: app.seekerId,
        type: "application_status",
        title: `Application ${label.toLowerCase()}`,
        message: `Your application for ${job?.title || "a role"}${
          company?.name ? ` at ${company.name}` : ""
        } is now: ${label}.${statusNote ? ` Note: ${statusNote}` : ""}`,
        link: "/dashboard/seeker/applications",
        applicationId: app._id,
        read: false,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Status updated",
      application: serializeApplication(app),
    });
  } catch (error) {
    console.error("Recruiter applications PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update status" },
      { status: 500 }
    );
  }
}
