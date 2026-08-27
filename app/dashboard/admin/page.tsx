import Link from "next/link";
import { requireAuth } from "@/lib/requireAuth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Company } from "@/models/Company";
import { Job } from "@/models/Job";
import DashboardStatCards from "@/app/components/DashboardStatCards";
import {
  DashboardPageHeader,
  DashboardDarkPanel,
  DashboardSoftPanel,
} from "@/app/components/DashboardUI";
import { DASH } from "@/app/lib/dashboardTheme";
import {
  Users,
  Building2,
  Briefcase,
  UserCog,
  Clock3,
  CheckCircle2,
  ArrowRight,
  Eye,
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

export default async function AdminOverviewPage() {
  const auth = await requireAuth(["admin"]);
  await connectDB();

  const [
    totalUsers,
    jobSeekers,
    recruiters,
    pendingCompanies,
    approvedCompanies,
    rejectedCompanies,
    totalCompanies,
    openJobs,
    totalJobs,
    recentUsers,
    recentJobs,
    pendingList,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "recruiter" }),
    Company.countDocuments({ status: "pending" }),
    Company.countDocuments({ status: "approved" }),
    Company.countDocuments({ status: "rejected" }),
    Company.countDocuments({}),
    Job.countDocuments({ status: "open" }),
    Job.countDocuments({}),
    User.find({}).sort({ createdAt: -1 }).limit(5).lean(),
    Job.find({}).sort({ createdAt: -1 }).limit(5).lean(),
    Company.find({ status: "pending" }).sort({ updatedAt: -1 }).limit(5).lean(),
  ]);

  const cards = [
    {
      label: "Total users",
      value: totalUsers,
      href: "/dashboard/admin/users",
      icon: Users,
      actionIcon: Eye,
      action: `${jobSeekers} seekers · ${recruiters} recruiters`,
    },
    {
      label: "Recruiters",
      value: recruiters,
      href: "/dashboard/admin/recruiters",
      icon: UserCog,
      actionIcon: CheckCircle2,
      action: `${approvedCompanies} approved companies`,
    },
    {
      label: "Companies pending",
      value: pendingCompanies,
      href: "/dashboard/admin/companies",
      icon: Building2,
      actionIcon: Clock3,
      action: `${approvedCompanies} approved · ${rejectedCompanies} rejected`,
    },
    {
      label: "Open jobs",
      value: openJobs,
      href: "/dashboard/admin/jobs",
      icon: Briefcase,
      actionIcon: Briefcase,
      action: `${totalJobs} total jobs`,
    },
  ];

  return (
    <main className="px-5 py-7 sm:px-8 lg:px-10">
      <DashboardPageHeader
        title={`Welcome, ${auth.name.split(" ")[0]}`}
        subtitle="Full platform control — users, recruiters, companies, and jobs in one place."
      />

      <DashboardStatCards stats={cards} />

      <DashboardDarkPanel className="mt-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {[
            { label: "Pending", href: "/dashboard/admin/companies", active: true },
            { label: "Users", href: "/dashboard/admin/users" },
            { label: "Jobs", href: "/dashboard/admin/jobs" },
          ].map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              className={`rounded-full px-4 py-1.5 text-xs font-bold ${
                tab.active
                  ? "text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/15"
              }`}
              style={tab.active ? { background: DASH.accent } : undefined}
            >
              {tab.label}
              {tab.label === "Pending" ? ` (${pendingCompanies})` : ""}
            </Link>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <DashboardSoftPanel>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold text-[#0f172a]">Pending companies</h2>
              <Link
                href="/dashboard/admin/companies"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#5850ec]"
              >
                Review <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {pendingList.length === 0 ? (
              <p className="text-sm text-[#6b7280]">No pending reviews.</p>
            ) : (
              <ul className="space-y-3">
                {pendingList.map((c) => (
                  <li key={String(c._id)} className="text-sm">
                    <p className="font-semibold text-[#0f172a]">{c.name}</p>
                    <p className="text-[#6b7280]">
                      {c.industry || "—"} · {c.location || "—"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </DashboardSoftPanel>

          <DashboardSoftPanel>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold text-[#0f172a]">Latest users</h2>
              <Link
                href="/dashboard/admin/users"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#5850ec]"
              >
                All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <ul className="space-y-3">
              {recentUsers.map((u) => (
                <li key={String(u._id)} className="text-sm">
                  <p className="font-semibold text-[#0f172a]">{u.name}</p>
                  <p className="text-[#6b7280]">
                    {u.role} · {formatDate(u.createdAt as Date)}
                  </p>
                </li>
              ))}
            </ul>
          </DashboardSoftPanel>

          <DashboardSoftPanel>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold text-[#0f172a]">Latest jobs</h2>
              <Link
                href="/dashboard/admin/jobs"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#5850ec]"
              >
                All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {recentJobs.length === 0 ? (
              <p className="text-sm text-[#6b7280]">No jobs yet.</p>
            ) : (
              <ul className="space-y-3">
                {recentJobs.map((j) => (
                  <li key={String(j._id)} className="text-sm">
                    <p className="font-semibold text-[#0f172a]">{j.title}</p>
                    <p className="text-[#6b7280]">
                      {j.status} · {j.location}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </DashboardSoftPanel>
        </div>
      </DashboardDarkPanel>

      <section className="mt-6 rounded-[24px] border border-[#ebe9f5] bg-white p-5 shadow-[0_8px_24px_rgba(26,26,46,0.04)]">
        <h2 className="font-bold text-[#0f172a]">Platform snapshot</h2>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-[#f4f3fb] p-4">
            <p className="text-[#6b7280]">Companies total</p>
            <p className="mt-1 text-xl font-bold">{totalCompanies}</p>
          </div>
          <div className="rounded-2xl bg-[#fef3c7] p-4">
            <p className="inline-flex items-center gap-1 text-[#9a6700]">
              <Clock3 className="h-3.5 w-3.5" /> Pending
            </p>
            <p className="mt-1 text-xl font-bold">{pendingCompanies}</p>
          </div>
          <div className="rounded-2xl bg-[#dcfce7] p-4">
            <p className="inline-flex items-center gap-1 text-[#166534]">
              <CheckCircle2 className="h-3.5 w-3.5" /> Approved
            </p>
            <p className="mt-1 text-xl font-bold">{approvedCompanies}</p>
          </div>
          <div className="rounded-2xl bg-[#ecebff] p-4">
            <p className="text-[#5850ec]">Jobs total</p>
            <p className="mt-1 text-xl font-bold">{totalJobs}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
