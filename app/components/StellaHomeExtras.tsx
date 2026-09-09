"use client";

import Link from "next/link";
import {
  UserRound,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  BookOpen,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/app/components/AuthProvider";
import {
  FAQ_ITEMS,
  formatPrice,
  formatWhen,
  selectedCourses,
  upcomingEvents,
  upcomingMasterclasses,
} from "@/lib/stellaContent";

export function CareerJourneyStrip() {
  const { user } = useAuth();
  const profileHref =
    user?.role === "user"
      ? "/profile/setup"
      : "/register?role=user&next=/profile/setup";

  const steps = [
    {
      title: "Create your free profile",
      body: "Share your experience, skills and career goals at no charge. Identity uploads are not required to begin.",
      href: profileHref,
      label: "Build my free profile",
      Icon: UserRound,
    },
    {
      title: "Build skills and verify",
      body: "Join sessions, courses and events, then submit eligible checks. Verification can continue after profile creation.",
      href: "/verification",
      label: "See how verification works",
      Icon: ShieldCheck,
    },
    {
      title: "Connect and apply",
      body: "No employment guarantee. Buying a course or attending a session is not required to apply.",
      href: "/jobs?country=au",
      label: "Find jobs",
      Icon: Briefcase,
    },
  ];

  return (
    <section className="journey-section relative overflow-hidden bg-white py-14 sm:py-16 lg:py-20">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-[#0f2744] sm:text-3xl lg:text-[2.15rem]">
            Your next step starts here
          </h2>
          <p className="journey-intro mx-auto mt-3 max-w-xl text-center text-[15px] leading-relaxed text-slate-500">
            Create your free profile, build skills and verified details, then
            connect with employers — verification can continue after you start.
          </p>
        </div>

        <div className="relative mt-14 md:mt-16">
          {/* Dashed curve connectors — desktop only */}
          <svg
            aria-hidden
            className="pointer-events-none absolute left-[16.5%] right-[16.5%] top-[2.75rem] hidden h-16 md:block"
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
          >
            <path
              d="M 0 12 C 18 12, 22 34, 50 34 C 78 34, 82 12, 100 12"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="0.6"
              strokeDasharray="1.8 1.6"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <ol className="grid gap-12 md:grid-cols-3 md:gap-8">
            {steps.map((s, i) => {
              const Icon = s.Icon;
              const isFirst = i === 0;
              return (
                <li key={s.title} className="relative flex flex-col items-center text-center">
                  <div className="relative mb-5">
                    <span className="absolute -left-5 -top-1 text-sm font-bold text-[#0f2744]">
                      {i + 1}
                    </span>
                    <div
                      className={
                        isFirst
                          ? "flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full bg-white shadow-[0_12px_40px_rgba(15,39,68,0.12)] ring-1 ring-slate-100"
                          : "flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full border border-dashed border-[#0d5c4d]/45 bg-white"
                      }
                    >
                      <Icon
                        className="h-8 w-8 text-[#0d5c4d]"
                        strokeWidth={1.6}
                      />
                    </div>
                  </div>

                  <h3 className="max-w-[16rem] text-lg font-bold tracking-tight text-[#0f2744]">
                    {s.title}
                  </h3>
                  <p className="mt-2 max-w-[17rem] text-sm leading-relaxed text-slate-500">
                    {s.body}
                  </p>
                  <Link
                    href={s.href}
                    className="journey-step-link mt-4 text-sm font-semibold text-[#0d5c4d] underline-offset-4 hover:underline"
                  >
                    {s.label}
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function LearningPreviewStrip() {
  const masterclasses = upcomingMasterclasses(2);
  const courses = selectedCourses(2);
  const events = upcomingEvents(2);

  const columns = [
    {
      step: "01",
      label: "LEARN",
      title: "Masterclasses",
      href: "/masterclasses",
      Icon: GraduationCap,
      iconWrap: "bg-[#dbeafe] text-[#2563eb]",
      accent: "text-[#2563eb]",
      arrowLabel: "SKILLS",
      highlight: false,
      items: masterclasses.map((m) => ({
        id: m.id,
        href: `/masterclasses/${m.id}`,
        title: m.title,
        detail: formatWhen(m.startsAt, m.timeZone),
        price: formatPrice(m.price),
        pending: Boolean(m.pendingOwnerContent),
      })),
      chip: {
        dot: "bg-[#3b82f6]",
        text: "Named speakers & dates when published",
      },
    },
    {
      step: "02",
      label: "GROW",
      title: "Courses",
      href: "/courses",
      Icon: BookOpen,
      iconWrap: "bg-[#fef3c7] text-[#d97706]",
      accent: "text-[#d97706]",
      arrowLabel: "CONNECT",
      highlight: true,
      items: courses.map((c) => ({
        id: c.id,
        href: `/courses/${c.id}`,
        title: c.title,
        detail: c.duration,
        price: formatPrice(c.price),
        pending: Boolean(c.pendingOwnerContent),
      })),
      chip: {
        dot: "bg-[#10b981]",
        text: "Training type labelled on every course",
      },
    },
    {
      step: "03",
      label: "MEET",
      title: "Events",
      href: "/events",
      Icon: CalendarDays,
      iconWrap: "bg-[#d1fae5] text-[#059669]",
      accent: "text-[#059669]",
      arrowLabel: "",
      highlight: false,
      items: events.map((e) => ({
        id: e.id,
        href: `/events/${e.id}`,
        title: e.title,
        detail: formatWhen(e.startsAt, e.timeZone),
        price: formatPrice(e.price),
        pending: Boolean(e.pendingOwnerContent),
      })),
      chip: {
        dot: "bg-[#f59e0b]",
        text: "External events clearly marked",
      },
    },
  ] as const;

  return (
    <section className="learning-flow-section relative overflow-hidden py-14 sm:py-16 lg:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,#f0f7ff_0%,#f8fafc_45%,#f0fdf4_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-[#0f2744] sm:text-3xl">
            Sessions, courses and events
          </h2>
          <p className="learning-flow-intro mx-auto mt-3 max-w-xl text-center text-[15px] leading-relaxed text-slate-500">
            Same records as the listing pages. Items marked pending are not live
            bookings.
          </p>
        </div>

        <div className="mt-14 flex flex-col items-stretch gap-10 lg:flex-row lg:items-stretch lg:justify-center lg:gap-3">
          {columns.map((col, i) => {
            const Icon = col.Icon;
            return (
              <div
                key={col.title}
                className="flex flex-1 items-stretch lg:max-w-[360px]"
              >
                <div className="flex w-full flex-col">
                  <article
                    className={`relative flex w-full flex-1 flex-col rounded-[28px] bg-white px-6 pb-6 pt-11 text-center shadow-[0_18px_50px_-24px_rgba(15,39,68,0.35)] ${
                      col.highlight
                        ? "border-2 border-[#3b82f6] bg-gradient-to-b from-[#eff6ff] to-white"
                        : "border border-slate-100"
                    }`}
                  >
                    <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0f2744] px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-md">
                      Step {col.step}
                    </span>

                    <div
                      className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${col.iconWrap}`}
                    >
                      <Icon className="h-7 w-7" strokeWidth={1.75} />
                    </div>

                    <p
                      className={`mt-4 text-[11px] font-bold uppercase tracking-[0.16em] ${col.accent}`}
                    >
                      {col.label}
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-[#0f2744]">
                      {col.title}
                    </h3>

                    <div className="mt-5 flex-1 space-y-3 text-left">
                      {col.items.length === 0 ? (
                        <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-4 text-center text-sm text-slate-500">
                          Nothing upcoming yet.
                        </p>
                      ) : (
                        col.items.map((item) => (
                          <Link
                            key={item.id}
                            href={item.href}
                            className="group block rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3.5 transition hover:border-slate-200 hover:bg-white"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-[15px] font-semibold leading-snug text-[#0f2744] group-hover:text-[#2563eb]">
                                {item.title}
                              </p>
                              {item.pending ? (
                                <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                                  Pending
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-2 text-xs leading-relaxed text-slate-500">
                              {item.detail}
                            </p>
                            <p className="mt-2 text-sm font-semibold text-[#0f2744]">
                              {item.price}
                            </p>
                          </Link>
                        ))
                      )}
                    </div>

                    <Link
                      href={col.href}
                      className="learning-flow-cta mt-5 inline-flex items-center justify-center gap-1 text-sm font-semibold text-[#2563eb] hover:underline"
                    >
                      View all
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </article>

                  <p className="mt-3 flex items-start justify-center gap-2 px-1 text-center text-xs leading-snug text-slate-500">
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${col.chip.dot}`}
                    />
                    <span>{col.chip.text}</span>
                  </p>
                </div>

                {i < columns.length - 1 ? (
                  <div className="hidden w-12 shrink-0 flex-col items-center justify-center self-center lg:flex">
                    <span className="mb-1 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      {col.arrowLabel}
                    </span>
                    <ArrowRight className="h-4 w-4 text-[#3b82f6]" />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function SampleVerificationStrip() {
  return (
    <section className="bg-white py-12 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-10">
        <h2 className="text-2xl font-bold tracking-tight text-[#0f2744] sm:text-3xl">
          What verified evidence looks like
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          See what has been checked, when it was checked and what is still
          pending. This is a labelled sample — not a real person. Real personal
          documents and contact details are excluded from this public
          demonstration.
        </p>
        <div className="mt-6 max-w-xl rounded-[22px] border border-dashed border-slate-300 bg-slate-50 p-6">
          <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
            Sample profile — demonstration only
          </span>
          <h3 className="mt-3 text-lg font-bold text-[#0f2744]">Alex Example</h3>
          <p className="text-sm text-slate-500">
            Allied health assistant · Greater Sydney · Last confirmed
            availability: sample date
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex justify-between border-b border-slate-200 py-2">
              <span>Qualification status (sample)</span>
              <strong className="text-emerald-700">Checked</strong>
            </li>
            <li className="flex justify-between border-b border-slate-200 py-2">
              <span>Employment check (sample)</span>
              <strong className="text-emerald-700">Checked</strong>
            </li>
            <li className="flex justify-between py-2">
              <span>Additional check (sample)</span>
              <strong className="text-amber-700">Pending</strong>
            </li>
          </ul>
          <Link
            href="/verification"
            className="mt-4 inline-block text-sm font-semibold text-[#2563eb]"
          >
            See how verification works
          </Link>
        </div>
      </div>
    </section>
  );
}

export function EmployersHomeStrip() {
  return (
    <section className="employers-home-strip bg-[#00082C] py-12 text-white sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-10">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Find candidates with the evidence you need
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-sky-100/90">
          Filter by role, location, availability and checked credentials.
          Pricing: contact for pricing until fees are published.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/employers"
            className="employer-primary-cta rounded-lg bg-white px-5 py-2.5 text-sm font-semibold"
          >
            Find candidates
          </Link>
          <Link
            href="/register?role=recruiter&next=/dashboard/recruiter/jobs/new"
            className="employer-secondary-cta rounded-lg border border-white/40 px-5 py-2.5 text-sm font-semibold"
          >
            Post a job
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HomeFaqStrip() {
  const { user } = useAuth();
  const signupHref =
    user?.role === "user"
      ? "/profile/setup"
      : "/register?role=user&next=/profile/setup";

  return (
    <section className="bg-white py-12 sm:py-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-8">
        <h2 className="text-center text-2xl font-bold text-[#0f2744] sm:text-3xl">
          Frequently asked questions
        </h2>
        <div className="mt-6 divide-y divide-slate-200">
          {FAQ_ITEMS.map((item) => (
            <details key={item.q} className="py-3">
              <summary className="cursor-pointer font-semibold text-[#0f2744]">
                {item.q}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {item.a}
              </p>
            </details>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href={signupHref}
            className="faq-primary-cta inline-flex rounded-lg bg-[#00082C] px-5 py-3 text-sm font-semibold"
          >
            Build my free profile
          </Link>
        </div>
      </div>
    </section>
  );
}
