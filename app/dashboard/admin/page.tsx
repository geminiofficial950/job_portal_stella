import Link from "next/link";
import { requireAuth } from "@/lib/requireAuth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Company } from "@/models/Company";
import { Job } from "@/models/Job";
import {
  Users,
  Building2,
  Briefcase,
  UserCog,
  Clock3,
  CheckCircle2,
  ArrowRight,
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
    admins,
    pendingCompanies,
    approvedCompanies,
    rejectedCompanies,
    totalCompanies,
    openJobs,
    totalJobs,
    draftJobs,
    pausedJobs,
    closedJobs,
    recentUsers,
    recentJobs,
    pendingList,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "recruiter" }),
    User.countDocuments({ role: "admin" }),
    Company.countDocuments({ status: "pending" }),
    Company.countDocuments({ status: "approved" }),
    Company.countDocuments({ status: "rejected" }),
    Company.countDocuments({}),
    Job.countDocuments({ status: "open" }),
    Job.countDocuments({}),
    Job.countDocuments({ status: "draft" }),
    Job.countDocuments({ status: "paused" }),
    Job.countDocuments({ status: "closed" }),
    User.find({}).sort({ createdAt: -1 }).limit(5).lean(),
    Job.find({}).sort({ createdAt: -1 }).limit(5).lean(),
    Company.find({ status: "pending" }).sort({ updatedAt: -1 }).limit(5).lean(),
  ]);

  const cards = [
    {
      label: "Total users",
      value: totalUsers,
      sub: `${jobSeekers} seekers · ${recruiters} recruiters · ${admins} admins`,
      href: "/dashboard/admin/users",
      icon: Users,
    },
    {
      label: "Recruiters",
      value: recruiters,
      sub: `${approvedCompanies} approved companies`,
      href: "/dashboard/admin/recruiters",
      icon: UserCog,
    },
    {
      label: "Companies pending",
      value: pendingCompanies,
      sub: `${approvedCompanies} approved · ${rejectedCompanies} rejected`,
      href: "/dashboard/admin/companies",
      icon: Building2,
    },
    {
      label: "Open jobs",
      value: openJobs,
      sub: `${totalJobs} total · ${draftJobs} draft · ${pausedJobs} paused · ${closedJobs} closed`,
      href: "/dashboard/admin/jobs",
      icon: Briefcase,
    },
  ];

  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#6b7a9e]">
          Overview
        </p>
        <h1 className="mt-2 text-3xl font-medium tracking-[-0.04em]">
          Welcome, {auth.name.split(" ")[0]}
        </h1>
        <p className="mt-2 max-w-2xl text-[#6b7a9e]">
          Full platform control — users, recruiters, companies, and jobs in one
          place.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="rounded-2xl border border-[#e6eaf2] bg-white p-5 transition hover:border-[#dc2626]"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#6b7a9e]">{card.label}</p>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fef2f2] text-[#b91c1c]">
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-medium tracking-[-0.04em]">
                {card.value}
              </p>
              <p className="mt-1 text-xs text-[#6b7a9e]">{card.sub}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-[#e6eaf2] bg-white p-5 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Pending companies</h2>
            <Link
              href="/dashboard/admin/companies"
              className="inline-flex items-center gap-1 text-sm text-[#b91c1c]"
            >
              Review <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {pendingList.length === 0 ? (
            <p className="mt-4 text-sm text-[#6b7a9e]">No pending reviews.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {pendingList.map((c) => (
                <li key={String(c._id)} className="text-sm">
                  <p className="font-medium text-[#b91c1c]">{c.name}</p>
                  <p className="text-[#6b7a9e]">
                    {c.industry || "—"} · {c.location || "—"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-[#e6eaf2] bg-white p-5 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Latest users</h2>
            <Link
              href="/dashboard/admin/users"
              className="inline-flex items-center gap-1 text-sm text-[#b91c1c]"
            >
              All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {recentUsers.map((u) => (
              <li key={String(u._id)} className="text-sm">
                <p className="font-medium text-[#b91c1c]">{u.name}</p>
                <p className="text-[#6b7a9e]">
                  {u.role} · {formatDate(u.createdAt as Date)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-[#e6eaf2] bg-white p-5 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Latest jobs</h2>
            <Link
              href="/dashboard/admin/jobs"
              className="inline-flex items-center gap-1 text-sm text-[#b91c1c]"
            >
              All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentJobs.length === 0 ? (
            <p className="mt-4 text-sm text-[#6b7a9e]">No jobs yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {recentJobs.map((j) => (
                <li key={String(j._id)} className="text-sm">
                  <p className="font-medium text-[#b91c1c]">{j.title}</p>
                  <p className="text-[#6b7a9e]">
                    {j.status} · {j.location}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-[#e6eaf2] bg-white p-5">
        <h2 className="font-semibold">Platform snapshot</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div className="rounded-xl bg-[#fffafa] p-4">
            <p className="text-[#6b7a9e]">Companies total</p>
            <p className="mt-1 text-xl font-semibold">{totalCompanies}</p>
          </div>
          <div className="rounded-xl bg-[#fff8e8] p-4">
            <p className="inline-flex items-center gap-1 text-[#9a6700]">
              <Clock3 className="h-3.5 w-3.5" /> Pending
            </p>
            <p className="mt-1 text-xl font-semibold">{pendingCompanies}</p>
          </div>
          <div className="rounded-xl bg-[#fef2f2] p-4">
            <p className="inline-flex items-center gap-1 text-[#b91c1c]">
              <CheckCircle2 className="h-3.5 w-3.5" /> Approved
            </p>
            <p className="mt-1 text-xl font-semibold">{approvedCompanies}</p>
          </div>
          <div className="rounded-xl bg-[#fffafa] p-4">
            <p className="text-[#6b7a9e]">Jobs total</p>
            <p className="mt-1 text-xl font-semibold">{totalJobs}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
