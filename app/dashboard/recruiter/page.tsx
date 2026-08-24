import Link from "next/link";
import { requireAuth } from "@/lib/requireAuth";
import { connectDB } from "@/lib/db";
import { Job } from "@/models/Job";
import { Company } from "@/models/Company";
import {
  Briefcase,
  FileText,
  PauseCircle,
  PlusCircle,
  Building2,
  ArrowRight,
  CheckCircle2,
  Clock3,
  AlertCircle,
  LayoutDashboard,
  BarChart2,
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
    return "bg-gradient-to-r from-[#b91c1c]/20 to-[#b91c1c]/10 text-[#7c3aed] border border-[#b91c1c]/30";
  if (status === "paused")
    return "bg-gradient-to-r from-[#f59e0b]/20 to-[#f59e0b]/10 text-[#d97706] border border-[#f59e0b]/30";
  return "bg-gradient-to-r from-[#ef4444]/20 to-[#ef4444]/10 text-[#dc2626] border border-[#ef4444]/30";
}

export default async function RecruiterOverviewPage() {
  const auth = await requireAuth(["recruiter"]);
  const firstName = auth.name.split(" ")[0] || "there";

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
      gradient: "from-[#dc2626] to-[#b91c1c]",
      bg: "from-[#ede9fe] to-[#ddd6fe]",
      iconBg: "bg-[#dc2626]",
      textColor: "text-[#4c1d95]",
      pill: "🟢 Live",
    },
    {
      label: "Total Jobs",
      value: totalJobs,
      icon: FileText,
      href: "/dashboard/recruiter/jobs",
      gradient: "from-[#dc2626] to-[#dc2626]",
      bg: "from-[#cffafe] to-[#a5f3fc]",
      iconBg: "bg-[#dc2626]",
      textColor: "text-[#164e63]",
      pill: "📋 All",
    },
    {
      label: "Paused / Draft",
      value: pausedCount + draftCount,
      icon: PauseCircle,
      href: "/dashboard/recruiter/jobs",
      gradient: "from-[#f59e0b] to-[#fb923c]",
      bg: "from-[#fef3c7] to-[#fde68a]",
      iconBg: "bg-[#d97706]",
      textColor: "text-[#78350f]",
      pill: "⏸ Inactive",
    },
  ];

  const companyReady = company?.status === "approved";

  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">

      {/* ── Hero header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#b91c1c] via-[#1a3a8f] to-[#dc2626] p-6 sm:p-8 mb-8">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-[#dc2626]/25 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-[#b91c1c]/30 blur-2xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/80 backdrop-blur-sm">
              <LayoutDashboard className="h-3 w-3" />
              Overview
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
              Welcome back, {firstName}! 👋
            </h1>
            <p className="mt-2 max-w-xl text-white/70 text-sm">
              Live snapshot of your hiring workspace — jobs, company status, and
              next steps.
            </p>
          </div>
          <Link
            href={
              companyReady
                ? "/dashboard/recruiter/jobs/new"
                : "/dashboard/recruiter/company"
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#b91c1c] shadow-lg hover:bg-[#fef2f2] transition-all duration-200 hover:scale-105"
          >
            <PlusCircle className="h-4 w-4" />
            {companyReady ? "Post a Job" : "Complete Company Profile"}
          </Link>
        </div>
      </div>

      {/* ── Stats cards ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.bg} p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
            >
              {/* Decorative circle */}
              <div className={`pointer-events-none absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-br ${stat.gradient} opacity-20`} />

              <div className="relative flex items-center justify-between">
                <p className={`text-sm font-semibold ${stat.textColor} opacity-80`}>
                  {stat.label}
                </p>
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg} text-white shadow-md`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className={`mt-3 text-4xl font-black tracking-tight ${stat.textColor}`}>
                {stat.value}
              </p>
              <span className={`mt-2 inline-block rounded-full bg-white/60 px-2.5 py-0.5 text-[11px] font-semibold ${stat.textColor} backdrop-blur-sm`}>
                {stat.pill}
              </span>
            </Link>
          );
        })}
      </div>

      {/* ── Company + Account ── */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">

        {/* Company card */}
        <section className="rounded-2xl border border-[#e6eaf2] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#dc2626] to-[#b91c1c] text-white">
                <Building2 className="h-4 w-4" />
              </span>
              <h2 className="font-bold text-[#b91c1c] tracking-tight">Company</h2>
            </div>
            <Link
              href="/dashboard/recruiter/company"
              className="inline-flex items-center gap-1 rounded-lg bg-[#fef2f2] px-3 py-1.5 text-xs font-semibold text-[#b91c1c] hover:bg-[#fef2f2] transition-colors"
            >
              Manage <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {!company ? (
            <div className="mt-4 rounded-xl bg-gradient-to-br from-[#fef2f2] to-[#fef2f2] p-4 border border-[#e6eaf2]">
              <p className="font-semibold text-[#b91c1c]">No company profile yet</p>
              <p className="mt-1 text-sm text-[#6b7a9e]">
                Submit your company details for admin approval before posting
                jobs.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-[#e6eaf2] bg-[#fffafa]">
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
                  <p className="font-bold text-[#b91c1c]">{company.name}</p>
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
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#dc2626] to-[#dc2626] text-white">
              <BarChart2 className="h-4 w-4" />
            </span>
            <h2 className="font-bold text-[#b91c1c] tracking-tight">Account</h2>
          </div>
          <div className="space-y-0 text-sm">
            <div className="flex justify-between gap-3 rounded-xl bg-gradient-to-r from-[#fffafa] to-[#fef2f2] px-4 py-3 mb-2">
              <span className="text-[#6b7a9e] font-medium">Name</span>
              <span className="font-bold text-[#b91c1c]">{auth.name}</span>
            </div>
            <div className="flex justify-between gap-3 rounded-xl bg-gradient-to-r from-[#fffafa] to-[#fef2f2] px-4 py-3 mb-2">
              <span className="text-[#6b7a9e] font-medium">Email</span>
              <span className="font-bold text-[#b91c1c] truncate max-w-[60%]">{auth.email}</span>
            </div>
            <div className="flex justify-between gap-3 rounded-xl bg-gradient-to-r from-[#ede9fe] to-[#ddd6fe] px-4 py-3">
              <span className="text-[#6b7a9e] font-medium">Role</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#dc2626] to-[#b91c1c] px-3 py-0.5 text-xs font-bold text-white capitalize">
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
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#f59e0b] to-[#fb923c] text-white">
              <Briefcase className="h-4 w-4" />
            </span>
            <h2 className="font-bold text-[#b91c1c] tracking-tight">Recent Jobs</h2>
          </div>
          <Link
            href="/dashboard/recruiter/jobs"
            className="inline-flex items-center gap-1 rounded-lg bg-[#fef2f2] px-3 py-1.5 text-xs font-semibold text-[#b91c1c] hover:bg-[#fef2f2] transition-colors"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-[#cdd3e0] px-4 py-12 text-center bg-gradient-to-br from-[#fffafa] to-[#fef2f2]">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#dc2626] to-[#b91c1c]">
              <Briefcase className="h-7 w-7 text-white" />
            </div>
            <p className="font-bold text-[#b91c1c]">No jobs yet</p>
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
                className="flex flex-col gap-2 rounded-xl bg-gradient-to-r from-[#fffafa] to-[#fef2f2] px-4 py-3 sm:flex-row sm:items-center sm:justify-between hover:from-[#fef2f2] hover:to-[#fef2f2] transition-all duration-200"
              >
                <div>
                  <p className="font-bold text-[#b91c1c]">{job.title}</p>
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
