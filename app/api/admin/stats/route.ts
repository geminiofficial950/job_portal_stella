import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/requireApiAuth";
import { User } from "@/models/User";
import { Company } from "@/models/Company";
import { Job } from "@/models/Job";

export async function GET() {
  const result = await requireApiAuth(["admin"]);
  if (result.error) return result.error;

  try {
    await connectDB();

    const [
      totalUsers,
      jobSeekers,
      recruiters,
      admins,
      activeUsers,
      totalCompanies,
      pendingCompanies,
      approvedCompanies,
      rejectedCompanies,
      totalJobs,
      openJobs,
      draftJobs,
      pausedJobs,
      closedJobs,
      recentUsers,
      recentJobs,
      recentCompanies,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "recruiter" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ isActive: true }),
      Company.countDocuments({}),
      Company.countDocuments({ status: "pending" }),
      Company.countDocuments({ status: "approved" }),
      Company.countDocuments({ status: "rejected" }),
      Job.countDocuments({}),
      Job.countDocuments({ status: "open" }),
      Job.countDocuments({ status: "draft" }),
      Job.countDocuments({ status: "paused" }),
      Job.countDocuments({ status: "closed" }),
      User.find({})
        .sort({ createdAt: -1 })
        .limit(6)
        .select("name email role createdAt isActive authProvider")
        .lean(),
      Job.find({})
        .sort({ createdAt: -1 })
        .limit(6)
        .select("title location status employmentType createdAt recruiterId")
        .lean(),
      Company.find({})
        .sort({ updatedAt: -1 })
        .limit(6)
        .select("name status industry location updatedAt ownerId")
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          jobSeekers,
          recruiters,
          admins,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
        },
        companies: {
          total: totalCompanies,
          pending: pendingCompanies,
          approved: approvedCompanies,
          rejected: rejectedCompanies,
        },
        jobs: {
          total: totalJobs,
          open: openJobs,
          draft: draftJobs,
          paused: pausedJobs,
          closed: closedJobs,
        },
      },
      recent: {
        users: recentUsers.map((u) => ({
          id: String(u._id),
          name: u.name,
          email: u.email,
          role: u.role,
          isActive: u.isActive,
          authProvider: u.authProvider || "local",
          createdAt: u.createdAt
            ? new Date(u.createdAt as Date).toISOString()
            : null,
        })),
        jobs: recentJobs.map((j) => ({
          id: String(j._id),
          title: j.title,
          location: j.location,
          status: j.status,
          employmentType: j.employmentType,
          recruiterId: String(j.recruiterId),
          createdAt: j.createdAt
            ? new Date(j.createdAt as Date).toISOString()
            : null,
        })),
        companies: recentCompanies.map((c) => ({
          id: String(c._id),
          name: c.name,
          status: c.status,
          industry: c.industry || "",
          location: c.location || "",
          ownerId: String(c.ownerId),
          updatedAt: c.updatedAt
            ? new Date(c.updatedAt as Date).toISOString()
            : null,
        })),
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load stats" },
      { status: 500 }
    );
  }
}
