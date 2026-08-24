import Link from "next/link";
import { requireAuth } from "@/lib/requireAuth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Job } from "@/models/Job";
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
  LayoutDashboard,
  ListChecks,
  Target,
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
  const firstName = auth.name.split(" ")[0] || "there";

  await connectDB();
  const [user, openJobs] = await Promise.all([
    User.findById(auth.sub).select("seekerProfile phone").lean(),
    Job.countDocuments({ status: "open" }),
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
      bg: "from-[#ede9fe] to-[#ddd6fe]",
      iconBg: "bg-[#dc2626]",
      textColor: "text-[#4c1d95]",
      pill: "🔍 Browse",
    },
    {
      label: "Applications",
      value: 0,
      icon: FileText,
      href: "/dashboard/seeker/applications",
      bg: "from-[#d1fae5] to-[#a7f3d0]",
      iconBg: "bg-[#059669]",
      textColor: "text-[#065f46]",
      pill: "📋 Track",
    },
    {
      label: "Saved Jobs",
      value: 0,
      icon: Bookmark,
      href: "/dashboard/seeker/saved",
      bg: "from-[#fce7f3] to-[#fbcfe8]",
      iconBg: "bg-[#db2777]",
      textColor: "text-[#831843]",
      pill: "❤️ Saved",
    },
    {
      label: "Interviews",
      value: 0,
      icon: CalendarCheck,
      href: "/dashboard/seeker/interviews",
      bg: "from-[#ffedd5] to-[#fed7aa]",
      iconBg: "bg-[#ea580c]",
      textColor: "text-[#7c2d12]",
      pill: "📅 Upcoming",
    },
  ];

  const shortcuts = [
    {
      title: "Browse Open Jobs",
      copy: "Search live roles from approved employers.",
      href: "/dashboard/seeker/jobs",
      icon: Search,
      iconBg: "bg-[#dc2626]",
      hoverBorder: "hover:border-[#dc2626]/40",
    },
    {
      title: "Complete Your Profile",
      copy: "Add skills, experience, and a resume link.",
      href: "/dashboard/seeker/profile",
      icon: UserRound,
      iconBg: "bg-[#d97706]",
      hoverBorder: "hover:border-[#d97706]/40",
    },
    {
      title: "Track Applications",
      copy: "Follow every role you apply to.",
      href: "/dashboard/seeker/applications",
      icon: FileText,
      iconBg: "bg-[#059669]",
      hoverBorder: "hover:border-[#059669]/40",
    },
  ];

  const profileColor =
    percent < 30
      ? { bar: "from-[#ef4444] to-[#f97316]", text: "text-[#dc2626]" }
      : percent < 70
      ? { bar: "from-[#f59e0b] to-[#fbbf24]", text: "text-[#d97706]" }
      : { bar: "from-[#10b981] to-[#34d399]", text: "text-[#059669]" };

  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">

      {/* ── Hero banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#b91c1c] via-[#7c3aed] to-[#dc2626] p-6 sm:p-8 mb-8">
        <div className="pointer-events-none absolute -top-12 -right-12 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-36 w-36 rounded-full bg-[#a5f3fc]/20 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/80 backdrop-blur-sm">
              <LayoutDashboard className="h-3 w-3" />
              Career Overview
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
              Welcome back, {firstName}! 🎯
            </h1>
            <p className="mt-2 max-w-xl text-white/70 text-sm">
              Your career hub — find roles, manage applications, and keep your
              profile ready for employers.
            </p>
          </div>
          <Link
            href="/dashboard/seeker/jobs"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#b91c1c] shadow-lg hover:bg-[#f5f3ff] transition-all duration-200 hover:scale-105"
          >
            <Search className="h-4 w-4" />
            Find Jobs
          </Link>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.bg} p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
            >
              <div className="pointer-events-none absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-white/30 blur-xl" />
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

      {/* ── Profile readiness + Quick actions ── */}
      <div className="mt-6 grid gap-4 lg:grid-cols-5">

        {/* Profile readiness */}
        <section className="rounded-2xl border border-[#e6eaf2] bg-white p-6 shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#dc2626] to-[#b91c1c] shadow-md">
                <Target className="h-4 w-4 text-white" />
              </span>
              <div>
                <h2 className="font-bold text-[#b91c1c] tracking-tight">Profile Readiness</h2>
                <p className={`text-xs font-semibold ${profileColor.text}`}>
                  {doneCount} of {checks.length} sections · {percent}%
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/seeker/profile"
              className="inline-flex items-center gap-1 rounded-lg bg-[#fef2f2] px-3 py-1.5 text-xs font-semibold text-[#b91c1c] hover:bg-[#fef2f2] transition-colors"
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
                    : "bg-[#fffafa] text-[#6b7a9e]"
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
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#fb923c] shadow-md">
              <MousePointerClick className="h-4 w-4 text-white" />
            </span>
            <h2 className="font-bold text-[#b91c1c] tracking-tight">Quick Actions</h2>
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
                      <span className="block text-sm font-bold text-[#b91c1c]">
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
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#dc2626] to-[#dc2626] shadow-md">
            <ListChecks className="h-4 w-4 text-white" />
          </span>
          <h2 className="font-bold text-[#b91c1c] tracking-tight">Getting Started</h2>
        </div>
        <ol className="grid gap-4 sm:grid-cols-3">
          {[
            {
              step: "01",
              title: "Build Your Profile",
              copy: "Fill skills, education, and links so recruiters know you.",
              color: "from-[#dc2626] to-[#b91c1c]",
              bg: "bg-[#fef2f2]",
              text: "text-[#b91c1c]",
            },
            {
              step: "02",
              title: "Explore Open Jobs",
              copy: "Search by title, skill, or location and save roles you like.",
              color: "from-[#dc2626] to-[#dc2626]",
              bg: "bg-[#fef2f2]",
              text: "text-[#b91c1c]",
            },
            {
              step: "03",
              title: "Apply & Track",
              copy: "Applications and interviews will show up here as you apply.",
              color: "from-[#059669] to-[#34d399]",
              bg: "bg-[#f0fdf4]",
              text: "text-[#065f46]",
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
