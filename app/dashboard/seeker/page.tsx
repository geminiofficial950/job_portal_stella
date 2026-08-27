import Link from "next/link";
import { requireAuth } from "@/lib/requireAuth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Job } from "@/models/Job";
import { Application } from "@/models/Application";
import DashboardStatCards from "@/app/components/DashboardStatCards";
import {
  DashboardPageHeader,
  DashboardDarkPanel,
  DashboardSoftPanel,
  DashboardPrimaryButton,
} from "@/app/components/DashboardUI";
import { DASH } from "@/app/lib/dashboardTheme";
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
    user?.seekerProfile || null,
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
    },
    {
      title: "Complete Your Profile",
      copy: "Add skills, experience, and a resume link.",
      href: "/dashboard/seeker/profile",
      icon: UserRound,
    },
    {
      title: "Track Applications",
      copy: "Follow every role you apply to.",
      href: "/dashboard/seeker/applications",
      icon: FileText,
    },
  ];

  return (
    <main className="px-5 py-7 sm:px-8 lg:px-10">
      <DashboardPageHeader
        title={`Hey, ${auth.name.split(" ")[0]}`}
        subtitle="Manage your profile, applications, and interviews in one place."
        action={
          <DashboardPrimaryButton href="/dashboard/seeker/jobs" icon={Search}>
            Find jobs
          </DashboardPrimaryButton>
        }
      />

      <DashboardStatCards stats={stats} />

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <section className="rounded-[24px] border border-[#ebe9f5] bg-white p-5 shadow-[0_8px_24px_rgba(26,26,46,0.04)] lg:col-span-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-2xl text-white"
                style={{ background: DASH.accent }}
              >
                <Target className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-bold tracking-tight text-[#0f172a]">
                  Profile Readiness
                </h2>
                <p className="text-xs font-semibold text-[#5850ec]">
                  {doneCount} of {checks.length} sections · {percent}%
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/seeker/profile"
              className="inline-flex items-center gap-1 rounded-xl bg-[#ecebff] px-3 py-1.5 text-xs font-semibold text-[#5850ec]"
            >
              Edit <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#f1f0f8]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${percent}%`,
                background: DASH.accent,
              }}
            />
          </div>

          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {checks.map((item) => (
              <li
                key={item.label}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium ${
                  item.done
                    ? "bg-[#dcfce7] text-[#166534]"
                    : "bg-[#f4f3fb] text-[#6b7280]"
                }`}
              >
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#16a34a]" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-[#c4c1d8]" />
                )}
                {item.label}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-[24px] border border-[#ebe9f5] bg-white p-5 shadow-[0_8px_24px_rgba(26,26,46,0.04)] lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-2xl text-white"
              style={{ background: DASH.accent }}
            >
              <MousePointerClick className="h-4 w-4" />
            </span>
            <h2 className="font-bold tracking-tight text-[#0f172a]">
              Quick Actions
            </h2>
          </div>
          <ul className="space-y-3">
            {shortcuts.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-3 rounded-2xl border border-[#ebe9f5] p-3.5 transition-all hover:border-[#5850ec]/30 hover:shadow-md"
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                      style={{ background: DASH.accent }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-[#0f172a]">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-[#6b7280]">
                        {item.copy}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-[#c4c1d8] group-hover:text-[#5850ec]" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <DashboardDarkPanel className="mt-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-white">
            <ListChecks className="h-4 w-4" />
          </span>
          <h2 className="font-bold text-white">Getting Started</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              step: "01",
              title: "Build Your Profile",
              copy: "Fill skills, education, and links so recruiters know you.",
            },
            {
              step: "02",
              title: "Explore Open Jobs",
              copy: "Search by title, skill, or location and save roles you like.",
            },
            {
              step: "03",
              title: "Apply & Track",
              copy: "Applications and interviews will show up here as you apply.",
            },
          ].map((s) => (
            <DashboardSoftPanel key={s.step}>
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black text-white"
                style={{ background: DASH.accent }}
              >
                {s.step}
              </span>
              <p className="mt-3 font-bold text-[#0f172a]">{s.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-[#6b7280]">
                {s.copy}
              </p>
            </DashboardSoftPanel>
          ))}
        </div>
      </DashboardDarkPanel>
    </main>
  );
}
