import Link from "next/link";
import { requireAuth } from "@/lib/requireAuth";
import { connectDB } from "@/lib/db";
import { Job } from "@/models/Job";
import { Company } from "@/models/Company";
import DashboardStatCards from "@/app/components/DashboardStatCards";
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

function formatDate(value?: Date | string | null) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusStyles(status: string) {
  if (status === "open")
    return "bg-gradient-to-r from-[#dc2626]/20 to-[#dc2626]/10 text-[#dc2626] border border-[#dc2626]/30";
  if (status === "draft")
    return "bg-gradient-to-r from-[#6366f1]/15 to-[#6366f1]/5 text-[#4338ca] border border-[#6366f1]/25";
  if (status === "paused")
    return "bg-gradient-to-r from-[#f59e0b]/20 to-[#f59e0b]/10 text-[#d97706] border border-[#f59e0b]/30";
  return "bg-gradient-to-r from-[#ef4444]/20 to-[#ef4444]/10 text-[#dc2626] border border-[#ef4444]/30";
}

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
      {/* ── Stats cards ── */}
      <DashboardStatCards stats={stats} columns={3} />

      {/* ── Company + Account ── */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">

        {/* Company card */}
        <section className="rounded-2xl border border-[#e6eaf2] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f1f5f9] text-[#475569]">
                <Building2 className="h-4 w-4" />
              </span>
              <h2 className="font-bold text-[#1e293b] tracking-tight">Company</h2>
            </div>
            <Link
              href="/dashboard/recruiter/company"
              className="inline-flex items-center gap-1 rounded-lg bg-[#f1f5f9] px-3 py-1.5 text-xs font-semibold text-[#1e293b] hover:bg-[#f1f5f9] transition-colors"
            >
              Manage <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {!company ? (
            <div className="mt-4 rounded-xl bg-[#f8fafc] p-4 border border-[#e6eaf2]">
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
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#d1fae5] to-[#a7f3d0] px-3 py-1 text-xs font-semibold text-[#065f46] border border-[#6ee7b7]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Active · Approved
                  </span>
                ) : company.status === "pending" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#fef3c7] to-[#fde68a] px-3 py-1 text-xs font-semibold text-[#92400e] border border-[#fcd34d]">
                    <Clock3 className="h-3.5 w-3.5" />
                    Pending Approval
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#fee2e2] to-[#fecaca] px-3 py-1 text-xs font-semibold text-[#991b1b] border border-[#f87171]">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Rejected
                  </span>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Account card */}
        <section className="rounded-2xl border border-[#e6eaf2] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f1f5f9] text-[#475569]">
              <BarChart2 className="h-4 w-4" />
            </span>
            <h2 className="font-bold text-[#1e293b] tracking-tight">Account</h2>
          </div>
          <div className="space-y-0 text-sm">
            <div className="flex justify-between gap-3 rounded-xl bg-gradient-to-r from-white to-[#f8fafc] px-4 py-3 mb-2">
              <span className="text-[#6b7a9e] font-medium">Name</span>
              <span className="font-bold text-[#1e293b]">{auth.name}</span>
            </div>
            <div className="flex justify-between gap-3 rounded-xl bg-gradient-to-r from-white to-[#f8fafc] px-4 py-3 mb-2">
              <span className="text-[#6b7a9e] font-medium">Email</span>
              <span className="font-bold text-[#1e293b] truncate max-w-[60%]">{auth.email}</span>
            </div>
            <div className="flex justify-between gap-3 rounded-xl bg-gradient-to-r from-[#ede9fe] to-[#ddd6fe] px-4 py-3">
              <span className="text-[#6b7a9e] font-medium">Role</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f5f9] px-3 py-0.5 text-xs font-bold text-[#475569] capitalize">
                ✨ {auth.role}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Recent jobs ── */}
      <section className="mt-6 rounded-2xl border border-[#e6eaf2] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f1f5f9] text-[#475569]">
              <Briefcase className="h-4 w-4" />
            </span>
            <h2 className="font-bold text-[#1e293b] tracking-tight">Recent Jobs</h2>
          </div>
          <Link
            href="/dashboard/recruiter/jobs"
            className="inline-flex items-center gap-1 rounded-lg bg-[#f1f5f9] px-3 py-1.5 text-xs font-semibold text-[#1e293b] hover:bg-[#f1f5f9] transition-colors"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-[#cdd3e0] px-4 py-12 text-center bg-gradient-to-br from-white to-[#f8fafc]">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f1f5f9] text-[#64748b]">
              <Briefcase className="h-7 w-7 text-white" />
            </div>
            <p className="font-bold text-[#1e293b]">No jobs yet</p>
            <p className="mt-1 text-sm text-[#6b7a9e]">
              {companyReady
                ? "Post your first role to see it here."
                : "Approve your company profile first, then post a job."}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {jobs.map((job) => (
              <li
                key={String(job._id)}
                className="flex flex-col gap-2 rounded-xl bg-gradient-to-r from-white to-[#f8fafc] px-4 py-3 sm:flex-row sm:items-center sm:justify-between hover:from-[#f8fafc] hover:to-[#f1f5f9] transition-all duration-200"
              >
                <div>
                  <p className="font-bold text-[#1e293b]">{job.title}</p>
                  <p className="text-xs text-[#6b7a9e] mt-0.5">
                    {job.location} · {job.employmentType} · posted{" "}
                    {formatDate(job.createdAt as Date | undefined)}
                  </p>
                </div>
                <span
                  className={`inline-flex w-fit rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider ${statusStyles(
                    job.status
                  )}`}
                >
                  {job.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
