import Link from "next/link";
import { requireAuth } from "@/lib/requireAuth";
import { connectDB } from "@/lib/db";
import { Job } from "@/models/Job";
import { Company } from "@/models/Company";
import { Application } from "@/models/Application";
import DashboardStatCards from "@/app/components/DashboardStatCards";
import RecruiterJobCard from "@/app/components/RecruiterJobCard";
import {
  Briefcase,
  FileText,
  PauseCircle,
  Building2,
  ArrowRight,
  CheckCircle2,
  Clock3,
  AlertCircle,
  BarChart2,
  List,
} from "lucide-react";

export default async function RecruiterOverviewPage() {
  const auth = await requireAuth(["recruiter"]);

  await connectDB();

  const [company, jobs, openCount, draftCount, pausedCount, closedCount] =
    await Promise.all([
      Company.findOne({ ownerId: auth.sub }).lean(),
      Job.find({ recruiterId: auth.sub }).sort({ createdAt: -1 }).limit(5).lean(),
      Job.countDocuments({ recruiterId: auth.sub, status: "open" }),
      Job.countDocuments({ recruiterId: auth.sub, status: "draft" }),
      Job.countDocuments({ recruiterId: auth.sub, status: "paused" }),
      Job.countDocuments({ recruiterId: auth.sub, status: "closed" }),
    ]);

  const jobIds = jobs.map((j) => j._id);
  const appCounts = jobIds.length
    ? await Application.aggregate<{ _id: (typeof jobIds)[number]; count: number }>([
        { $match: { jobId: { $in: jobIds } } },
        { $group: { _id: "$jobId", count: { $sum: 1 } } },
      ])
    : [];
  const countMap = new Map(appCounts.map((c) => [String(c._id), c.count]));

  const totalJobs = openCount + draftCount + pausedCount + closedCount;

  const stats = [
    {
      label: "Open Jobs",
      value: openCount,
      icon: Briefcase,
      href: "/dashboard/recruiter/jobs",
      actionIcon: CheckCircle2,
      action: "Live",
    },
    {
      label: "Total Jobs",
      value: totalJobs,
      icon: FileText,
      href: "/dashboard/recruiter/jobs",
      actionIcon: List,
      action: "All",
    },
    {
      label: "Paused / Draft",
      value: pausedCount + draftCount,
      icon: PauseCircle,
      href: "/dashboard/recruiter/jobs",
      actionIcon: Clock3,
      action: "Inactive",
    },
  ];

  const companyReady = company?.status === "approved";

  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      <DashboardStatCards stats={stats} columns={3} />

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#e6eaf2] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f1f5f9] text-[#475569]">
                <Building2 className="h-4 w-4" />
              </span>
              <h2 className="font-bold tracking-tight text-[#1e293b]">Company</h2>
            </div>
            <Link
              href="/dashboard/recruiter/company"
              className="inline-flex items-center gap-1 rounded-lg bg-[#f1f5f9] px-3 py-1.5 text-xs font-semibold text-[#1e293b] transition-colors hover:bg-[#e2e8f0]"
            >
              Manage <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {!company ? (
            <div className="mt-4 rounded-xl border border-[#e6eaf2] bg-[#f8fafc] p-4">
              <p className="font-semibold text-[#1e293b]">No company profile yet</p>
              <p className="mt-1 text-sm text-[#6b7a9e]">
                Submit your company details for admin approval before posting
                jobs.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-[#e6eaf2] bg-[#f8fafc]">
                  {company.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={company.logoUrl}
                      alt={company.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Building2 className="h-5 w-5 text-[#6b7a9e]" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[#1e293b]">{company.name}</p>
                  <p className="text-sm text-[#6b7a9e]">
                    {[company.industry, company.location]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                {company.status === "approved" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#6ee7b7] bg-gradient-to-r from-[#d1fae5] to-[#a7f3d0] px-3 py-1 text-xs font-semibold text-[#065f46]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Active · Approved
                  </span>
                ) : company.status === "pending" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#fcd34d] bg-gradient-to-r from-[#fef3c7] to-[#fde68a] px-3 py-1 text-xs font-semibold text-[#92400e]">
                    <Clock3 className="h-3.5 w-3.5" />
                    Pending Approval
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f87171] bg-gradient-to-r from-[#fee2e2] to-[#fecaca] px-3 py-1 text-xs font-semibold text-[#991b1b]">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Rejected
                  </span>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[#e6eaf2] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f1f5f9] text-[#475569]">
              <BarChart2 className="h-4 w-4" />
            </span>
            <h2 className="font-bold tracking-tight text-[#1e293b]">Account</h2>
          </div>
          <div className="space-y-0 text-sm">
            <div className="mb-2 flex justify-between gap-3 rounded-xl bg-gradient-to-r from-white to-[#f8fafc] px-4 py-3">
              <span className="font-medium text-[#6b7a9e]">Name</span>
              <span className="font-bold text-[#1e293b]">{auth.name}</span>
            </div>
            <div className="mb-2 flex justify-between gap-3 rounded-xl bg-gradient-to-r from-white to-[#f8fafc] px-4 py-3">
              <span className="font-medium text-[#6b7a9e]">Email</span>
              <span className="max-w-[60%] truncate font-bold text-[#1e293b]">
                {auth.email}
              </span>
            </div>
            <div className="flex justify-between gap-3 rounded-xl bg-[#f8fafc] px-4 py-3">
              <span className="font-medium text-[#6b7a9e]">Role</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f5f9] px-3 py-0.5 text-xs font-bold capitalize text-[#475569]">
                {auth.role}
              </span>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-[#e6eaf2] bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f1f5f9] text-[#475569]">
              <Briefcase className="h-4 w-4" />
            </span>
            <h2 className="font-bold tracking-tight text-[#1e293b]">
              Recent Jobs
            </h2>
          </div>
          <Link
            href="/dashboard/recruiter/jobs"
            className="inline-flex items-center gap-1 rounded-lg bg-[#f1f5f9] px-3 py-1.5 text-xs font-semibold text-[#1e293b] transition-colors hover:bg-[#e2e8f0]"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-[#cdd3e0] bg-[#f8fafc] px-4 py-12 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ede9fe] text-[#1e3a5f]">
              <Briefcase className="h-7 w-7" />
            </div>
            <p className="font-bold text-[#1e293b]">No jobs yet</p>
            <p className="mt-1 text-sm text-[#6b7a9e]">
              {companyReady
                ? "Post your first role to see it here."
                : "Approve your company profile first, then post a job."}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {jobs.map((job) => (
              <li key={String(job._id)}>
                <RecruiterJobCard
                  compact
                  job={{
                    id: String(job._id),
                    title: job.title,
                    location: job.location,
                    employmentType: job.employmentType,
                    category: job.category,
                    status: job.status,
                    salaryMin: job.salaryMin,
                    salaryMax: job.salaryMax,
                    salaryCurrency: job.salaryCurrency,
                    salaryPeriod: job.salaryPeriod,
                    createdAt: job.createdAt
                      ? new Date(job.createdAt as Date).toISOString()
                      : null,
                    appliedCount: countMap.get(String(job._id)) ?? 0,
                    company: company
                      ? {
                          name: company.name,
                          logoUrl: company.logoUrl || "",
                        }
                      : null,
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
