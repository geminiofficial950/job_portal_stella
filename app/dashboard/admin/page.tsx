import Link from "next/link";
import { requireAuth } from "@/lib/requireAuth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Company } from "@/models/Company";
import { Job } from "@/models/Job";
import { ContactMessage } from "@/models/ContactMessage";
import styles from "../seeker/seeker.module.css";
import {
  Users,
  Building2,
  Briefcase,
  UserCog,
  ArrowRight,
  ArrowUpRight,
  Mail,
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
    contactMessages,
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
    ContactMessage.countDocuments({}),
  ]);

  const stats = [
    { label: "Total users", value: totalUsers, href: "/dashboard/admin/users", icon: Users, hint: `${jobSeekers} seekers · ${recruiters} recruiters` },
    { label: "Recruiters", value: recruiters, href: "/dashboard/admin/recruiters", icon: UserCog, hint: `${approvedCompanies} approved companies` },
    { label: "Pending companies", value: pendingCompanies, href: "/dashboard/admin/companies", icon: Building2, hint: `${rejectedCompanies} rejected` },
    { label: "Open jobs", value: openJobs, href: "/dashboard/admin/jobs", icon: Briefcase, hint: `${totalJobs} total jobs` },
    { label: "Messages", value: contactMessages, href: "/dashboard/admin/messages", icon: Mail, hint: "From Contact Us" },
  ];
  const snapshot = [
    { label: "Companies", value: totalCompanies },
    { label: "Pending", value: pendingCompanies },
    { label: "Approved", value: approvedCompanies },
    { label: "All jobs", value: totalJobs },
  ];

  return (
    <main className={styles.overview}>
      <section className={styles.welcome}>
        <div>
          <p className={styles.eyebrow}>PLATFORM CONTROL</p>
          <h1>Welcome, {auth.name.split(" ")[0]}</h1>
          <p>Users, recruiters, companies, and jobs in one place.</p>
        </div>
        <Link href="/dashboard/admin/companies" className={styles.primaryButton}>
          Review companies <ArrowUpRight size={16} />
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5" aria-label="Platform statistics">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} className={styles.stat}>
              <div className={styles.statTop}>
                <span className={styles.statIcon}><Icon size={18} /></span>
                <ArrowUpRight size={16} />
              </div>
              <strong className={styles.statValue}>{stat.value.toLocaleString()}</strong>
              <div className={styles.statBottom}>
                <span>{stat.label}</span>
                <small>{stat.hint}</small>
              </div>
            </Link>
          );
        })}
      </section>

      <div className={styles.sectionHeading}>
        <h2>Recent activity</h2>
        <span>Newest first</span>
      </div>
      <section className="grid items-start gap-4 lg:grid-cols-3">
        <article className={styles.panel}>
          <div className={styles.panelHeading}>
            <h2>Pending companies</h2>
            <Link href="/dashboard/admin/companies" className={styles.textLink}>Review <ArrowRight size={12} /></Link>
          </div>
          {pendingList.length === 0 ? (
            <p className="mt-4 text-sm text-[#6b7280]">Nothing waiting for review.</p>
          ) : (
            <ul className="mt-4 divide-y divide-[#e6eaf2]">
              {pendingList.map((company) => (
                <li key={String(company._id)} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-sm font-semibold text-[#0f172a]">{company.name}</p>
                  <p className="mt-0.5 text-xs text-[#6b7280]">{company.industry || "—"} · {company.location || "—"}</p>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeading}>
            <h2>Latest users</h2>
            <Link href="/dashboard/admin/users" className={styles.textLink}>All <ArrowRight size={12} /></Link>
          </div>
          <ul className="mt-4 divide-y divide-[#e6eaf2]">
            {recentUsers.map((user) => (
              <li key={String(user._id)} className="py-3 first:pt-0 last:pb-0">
                <p className="text-sm font-semibold text-[#0f172a]">{user.name}</p>
                <p className="mt-0.5 text-xs text-[#6b7280]">{user.role} · {formatDate(user.createdAt as Date)}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeading}>
            <h2>Latest jobs</h2>
            <Link href="/dashboard/admin/jobs" className={styles.textLink}>All <ArrowRight size={12} /></Link>
          </div>
          {recentJobs.length === 0 ? (
            <p className="mt-4 text-sm text-[#6b7280]">No jobs posted yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-[#e6eaf2]">
              {recentJobs.map((job) => (
                <li key={String(job._id)} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-sm font-semibold text-[#0f172a]">{job.title}</p>
                  <p className="mt-0.5 text-xs text-[#6b7280]">{job.status} · {job.location}</p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <div className={styles.sectionHeading}>
        <h2>Platform snapshot</h2>
        <span>Live totals</span>
      </div>
      <section className="grid gap-3 pb-6 sm:grid-cols-2 lg:grid-cols-4" aria-label="Platform snapshot">
        {snapshot.map((item) => (
          <div key={item.label} className={styles.panel}>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6b7280]">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[#0f172a]">{item.value.toLocaleString()}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
