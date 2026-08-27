import Link from "next/link";
import { requireAuth } from "@/lib/requireAuth";
import { connectDB } from "@/lib/db";
import { Job } from "@/models/Job";
import { Company } from "@/models/Company";
import { Application } from "@/models/Application";
import DashboardStatCards from "@/app/components/DashboardStatCards";
import RecruiterJobCard from "@/app/components/RecruiterJobCard";
import {
  DashboardPageHeader,
  DashboardDarkPanel,
  DashboardSoftPanel,
  DashboardPrimaryButton,
} from "@/app/components/DashboardUI";
import { DASH } from "@/app/lib/dashboardTheme";
import {
  Briefcase,
  FileText,
  PauseCircle,
  Building2,
  ArrowRight,
  CheckCircle2,
  Clock3,
  AlertCircle,
  List,
  PlusCircle,
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
    ? await Application.aggregate<{
        _id: (typeof jobIds)[number];
        count: number;
      }>([
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
      action: "Live roles",
    },
    {
      label: "Total Jobs",
      value: totalJobs,
      icon: FileText,
      href: "/dashboard/recruiter/jobs",
      actionIcon: List,
      action: "All listings",
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
    <main className="px-5 py-7 sm:px-8 lg:px-10">
      <DashboardPageHeader
        title="Overview"
        subtitle="Manage and track all your hiring activity in one place."
        action={
          <DashboardPrimaryButton
            href="/dashboard/recruiter/jobs/new"
            icon={PlusCircle}
          >
            Post a job
          </DashboardPrimaryButton>
        }
      />

      <DashboardStatCards stats={stats} columns={3} />

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-[24px] border border-[#ebe9f5] bg-white p-5 shadow-[0_8px_24px_rgba(26,26,46,0.04)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-2xl text-white"
                style={{ background: DASH.accent }}
              >
                <Building2 className="h-4 w-4" />
              </span>
              <h2 className="font-bold tracking-tight text-[#0f172a]">Company</h2>
            </div>
            <Link
              href="/dashboard/recruiter/company"
              className="inline-flex items-center gap-1 rounded-xl bg-[#f4f3fb] px-3 py-1.5 text-xs font-semibold text-[#5850ec]"
            >
              Manage <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {!company ? (
            <div className="mt-4 rounded-2xl bg-[#f4f3fb] p-4">
              <p className="font-semibold text-[#0f172a]">No company profile yet</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                Submit your company details for admin approval before posting
                jobs.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-[#ecebff]">
                  {company.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={company.logoUrl}
                      alt={company.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Building2 className="h-5 w-5 text-[#5850ec]" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[#0f172a]">{company.name}</p>
                  <p className="text-sm text-[#6b7280]">
                    {[company.industry, company.location]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                </div>
              </div>
              {company.status === "approved" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-semibold text-[#166534]">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Active · Approved
                </span>
              ) : company.status === "pending" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fef3c7] px-3 py-1 text-xs font-semibold text-[#92400e]">
                  <Clock3 className="h-3.5 w-3.5" /> Pending Approval
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fee2e2] px-3 py-1 text-xs font-semibold text-[#991b1b]">
                  <AlertCircle className="h-3.5 w-3.5" /> Rejected
                </span>
              )}
            </div>
          )}
        </section>

        <section className="rounded-[24px] border border-[#ebe9f5] bg-white p-5 shadow-[0_8px_24px_rgba(26,26,46,0.04)]">
          <div className="mb-4 flex items-center gap-2">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-2xl text-white"
              style={{ background: DASH.accent }}
            >
              <FileText className="h-4 w-4" />
            </span>
            <h2 className="font-bold tracking-tight text-[#0f172a]">Account</h2>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-3 rounded-2xl bg-[#f4f3fb] px-4 py-3">
              <span className="font-medium text-[#6b7280]">Name</span>
              <span className="font-bold text-[#0f172a]">{auth.name}</span>
            </div>
            <div className="flex justify-between gap-3 rounded-2xl bg-[#f4f3fb] px-4 py-3">
              <span className="font-medium text-[#6b7280]">Email</span>
              <span className="max-w-[60%] truncate font-bold text-[#0f172a]">
                {auth.email}
              </span>
            </div>
            <div className="flex justify-between gap-3 rounded-2xl bg-[#ecebff] px-4 py-3">
              <span className="font-medium text-[#6b7280]">Role</span>
              <span
                className="rounded-full px-3 py-0.5 text-xs font-bold capitalize text-white"
                style={{ background: DASH.accent }}
              >
                {auth.role}
              </span>
            </div>
          </div>
        </section>
      </div>

      <DashboardDarkPanel className="mt-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
              Hiring feed
            </p>
            <h2 className="mt-1 text-lg font-bold text-white">Recent Jobs</h2>
          </div>
          <Link
            href="/dashboard/recruiter/jobs"
            className="inline-flex items-center gap-1 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {jobs.length === 0 ? (
          <DashboardSoftPanel>
            <p className="font-bold text-[#0f172a]">No jobs yet</p>
            <p className="mt-1 text-sm text-[#6b7280]">
              {companyReady
                ? "Post your first role to see it here."
                : "Approve your company profile first, then post a job."}
            </p>
          </DashboardSoftPanel>
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
      </DashboardDarkPanel>
    </main>
  );
}
