import Link from "next/link";
import { requireAuth } from "@/lib/requireAuth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Job } from "@/models/Job";
import { Application } from "@/models/Application";
import DashboardStatCards from "@/app/components/DashboardStatCards";
import {
  Search,
  FileText,
  Bookmark,
  CalendarCheck,
  UserRound,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Circle,
  MousePointerClick,
  ListChecks,
  Target,
  Heart,
} from "lucide-react";

function profileCompletion(profile: {
  headline?: string | null;
  location?: string | null;
  about?: string | null;
  skills?: string[] | null;
  experienceLevel?: string | null;
  education?: string | null;
  resumeUrl?: string | null;
} | null) {
  const checks = [
    { label: "Headline", done: Boolean(profile?.headline?.trim()) },
    { label: "Location", done: Boolean(profile?.location?.trim()) },
    { label: "About you", done: Boolean(profile?.about?.trim()) },
    { label: "Skills", done: Boolean(profile?.skills?.length) },
    { label: "Experience level", done: Boolean(profile?.experienceLevel) },
    { label: "Education", done: Boolean(profile?.education?.trim()) },
    { label: "Resume link", done: Boolean(profile?.resumeUrl?.trim()) },
  ];
  const doneCount = checks.filter((c) => c.done).length;
  const percent = Math.round((doneCount / checks.length) * 100);
  return { checks, doneCount, percent };
}

export default async function SeekerOverviewPage() {
  const auth = await requireAuth(["user"]);

  await connectDB();
  const [user, openJobs, applicationCount] = await Promise.all([
    User.findById(auth.sub).select("seekerProfile phone").lean(),
    Job.countDocuments({ status: "open" }),
    Application.countDocuments({ seekerId: auth.sub }),
  ]);

  const { checks, doneCount, percent } = profileCompletion(
    user?.seekerProfile || null
  );

  const stats = [
    {
      label: "Open Roles",
      value: openJobs,
      icon: Briefcase,
      href: "/dashboard/seeker/jobs",
      actionIcon: Search,
      action: "Browse",
    },
    {
      label: "Applications",
      value: applicationCount,
      icon: FileText,
      href: "/dashboard/seeker/applications",
      actionIcon: FileText,
      action: "Track",
    },
    {
      label: "Saved Jobs",
      value: 0,
      icon: Bookmark,
      href: "/dashboard/seeker/saved",
      actionIcon: Heart,
      action: "Saved",
    },
    {
      label: "Interviews",
      value: 0,
      icon: CalendarCheck,
      href: "/dashboard/seeker/interviews",
      actionIcon: CalendarCheck,
      action: "Upcoming",
    },
  ];

  const shortcuts = [
    {
      title: "Browse Open Jobs",
      copy: "Search live roles from approved employers.",
      href: "/dashboard/seeker/jobs",
      icon: Search,
      iconBg: "bg-[#64748b]",
      hoverBorder: "hover:border-[#dc2626]/40",
    },
    {
      title: "Complete Your Profile",
      copy: "Add skills, experience, and a resume link.",
      href: "/dashboard/seeker/profile",
      icon: UserRound,
      iconBg: "bg-[#64748b]",
      hoverBorder: "hover:border-[#dc2626]/40",
    },
    {
      title: "Track Applications",
      copy: "Follow every role you apply to.",
      href: "/dashboard/seeker/applications",
      icon: FileText,
      iconBg: "bg-[#64748b]",
      hoverBorder: "hover:border-[#dc2626]/40",
    },
  ];

  const profileColor = { bar: "from-[#dc2626] to-[#b91c1c]", text: "text-[#334155]" };

  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      {/* ── Stats grid ── */}
      <DashboardStatCards stats={stats} />

      {/* ── Profile readiness + Quick actions ── */}
      <div className="mt-6 grid gap-4 lg:grid-cols-5">

        {/* Profile readiness */}
        <section className="rounded-2xl border border-[#e6eaf2] bg-white p-6 shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f1f5f9] text-[#475569] shadow-none">
                <Target className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-bold text-[#1e293b] tracking-tight">Profile Readiness</h2>
                <p className={`text-xs font-semibold ${profileColor.text}`}>
                  {doneCount} of {checks.length} sections · {percent}%
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/seeker/profile"
              className="inline-flex items-center gap-1 rounded-lg bg-[#f1f5f9] px-3 py-1.5 text-xs font-semibold text-[#1e293b] hover:bg-[#f1f5f9] transition-colors"
            >
              Edit <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#eef1f7]">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${profileColor.bar} transition-all duration-500`}
              style={{ width: `${percent}%` }}
            />
          </div>

          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {checks.map((item) => (
              <li
                key={item.label}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  item.done
                    ? "bg-[#f0fdf4] text-[#065f46]"
                    : "bg-[#f8fafc] text-[#6b7a9e]"
                }`}
              >
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 text-[#059669] shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-[#cdd3e0] shrink-0" />
                )}
                {item.label}
              </li>
            ))}
          </ul>
        </section>

        {/* Quick actions */}
        <section className="rounded-2xl border border-[#e6eaf2] bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f1f5f9] text-[#475569] shadow-none">
              <MousePointerClick className="h-4 w-4" />
            </span>
            <h2 className="font-bold text-[#1e293b] tracking-tight">Quick Actions</h2>
          </div>
          <ul className="space-y-3">
            {shortcuts.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl border border-[#eef1f7] p-3.5 transition-all duration-200 hover:shadow-md ${item.hoverBorder} group`}
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.iconBg} text-white shadow-sm group-hover:scale-110 transition-transform`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-bold text-[#1e293b]">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-[#6b7a9e] truncate">
                        {item.copy}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-[#cdd3e0] group-hover:text-[#6b7a9e] shrink-0 transition-colors" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* ── Getting started steps ── */}
      <section className="mt-6 rounded-2xl border border-[#e6eaf2] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f1f5f9] text-[#475569] shadow-none">
            <ListChecks className="h-4 w-4" />
          </span>
          <h2 className="font-bold text-[#1e293b] tracking-tight">Getting Started</h2>
        </div>
        <ol className="grid gap-4 sm:grid-cols-3">
          {[
            {
              step: "01",
              title: "Build Your Profile",
              copy: "Fill skills, education, and links so recruiters know you.",
              color: "from-[#475569] to-[#64748b]",
              bg: "bg-[#f1f5f9]",
              text: "text-[#334155]",
            },
            {
              step: "02",
              title: "Explore Open Jobs",
              copy: "Search by title, skill, or location and save roles you like.",
              color: "from-[#475569] to-[#64748b]",
              bg: "bg-[#f1f5f9]",
              text: "text-[#334155]",
            },
            {
              step: "03",
              title: "Apply & Track",
              copy: "Applications and interviews will show up here as you apply.",
              color: "from-[#475569] to-[#64748b]",
              bg: "bg-[#f1f5f9]",
              text: "text-[#334155]",
            },
          ].map((s) => (
            <li key={s.step} className={`rounded-xl ${s.bg} p-5 border border-white`}>
              <span className={`inline-flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br ${s.color} text-white text-xs font-black shadow-sm`}>
                {s.step}
              </span>
              <p className={`mt-3 font-bold ${s.text}`}>{s.title}</p>
              <p className="mt-1.5 text-sm text-[#6b7a9e] leading-relaxed">{s.copy}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
