"use client";

import { Fragment, type CSSProperties } from "react";
import Link from "next/link";
import {
  UserRound,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  BookOpen,
  CalendarDays,
  ArrowRight,
  ChevronDown,
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
    <section className="journey-section relative overflow-hidden bg-white pb-14 pt-6 sm:pb-16 sm:pt-8 lg:pb-20 lg:pt-10">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="journey-display-title mx-auto text-center text-[2.35rem] font-bold leading-[1.05] tracking-[-0.03em] text-black sm:text-5xl lg:text-[3.75rem]">
            Your next step
            <br />
            starts here.
          </h2>
          <p className="journey-intro mx-auto mt-6 max-w-xl text-center text-[15px] font-normal leading-relaxed text-[#666666] sm:mt-7 sm:text-lg sm:leading-relaxed">
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
                <li
                  key={s.title}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="relative mb-5">
                    <span className="absolute -left-5 -top-1 text-sm font-bold text-[#0f2744]">
                      {i + 1}
                    </span>
                    <div
                      className={
                        isFirst
                          ? "flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full bg-white shadow-[0_12px_40px_rgba(79,108,245,0.18)] ring-1 ring-[#4f6cf5]/20"
                          : "flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full border border-dashed border-[#4f6cf5]/40 bg-white"
                      }
                    >
                      <Icon
                        className="h-8 w-8 text-[#4f6cf5]"
                        fill="currentColor"
                        strokeWidth={1.25}
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
                    className="journey-step-link mt-4 text-sm font-semibold text-[#4f6cf5] underline-offset-4 hover:underline"
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
      iconWrap: "bg-[#4f6cf5]/12 text-[#4f6cf5] ring-1 ring-[#4f6cf5]/25",
      accent: "text-[#4f6cf5]",
      arrowLabel: "SKILLS",
      highlight: false,
      items: masterclasses.map((m) => ({
        id: m.id,
        href: `/masterclasses/${m.id}`,
        title: m.title,
        detail: formatWhen(m.startsAt, m.timeZone).replace(
          /\s*\([^)]*\)\s*$/,
          "",
        ),
        price: formatPrice(m.price),
        pending: Boolean(m.pendingOwnerContent),
      })),
      chip: {
        dot: "bg-[#4f6cf5]",
        text: "Named speakers & dates when published",
      },
    },
    {
      step: "02",
      label: "GROW",
      title: "Courses",
      href: "/courses",
      Icon: BookOpen,
      iconWrap: "bg-[#c8f066]/35 text-[#5a7a10] ring-1 ring-[#c8f066]/70",
      accent: "text-[#6b8f12]",
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
        dot: "bg-[#c8f066]",
        text: "Training type labelled on every course",
      },
    },
    {
      step: "03",
      label: "MEET",
      title: "Events",
      href: "/events",
      Icon: CalendarDays,
      iconWrap: "bg-[#4f6cf5]/12 text-[#4f6cf5] ring-1 ring-[#4f6cf5]/25",
      accent: "text-[#4f6cf5]",
      arrowLabel: "",
      highlight: false,
      items: events.map((e) => ({
        id: e.id,
        href: `/events/${e.id}`,
        title: e.title,
        detail: formatWhen(e.startsAt, e.timeZone).replace(
          /\s*\([^)]*\)\s*$/,
          "",
        ),
        price: formatPrice(e.price),
        pending: Boolean(e.pendingOwnerContent),
      })),
      chip: {
        dot: "bg-[#4f6cf5]",
        text: "External events clearly marked",
      },
    },
  ] as const;

  return (
    <section className="learning-flow-section relative overflow-hidden bg-white py-14 sm:py-16 lg:py-20">
      <div className="relative mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="learning-display-title mx-auto text-center text-[2.35rem] font-bold leading-[1.05] tracking-[-0.03em] text-black sm:text-5xl lg:text-[3.75rem]">
            Sessions, courses
            <br />
            and events.
          </h2>
          <p className="learning-flow-intro mx-auto mt-6 max-w-xl text-center text-[15px] font-normal leading-relaxed text-[#666666] sm:mt-7 sm:text-lg sm:leading-relaxed">
            Same records as the listing pages. Items marked pending are not live
            bookings.
          </p>
        </div>

        <div className="mt-14 flex flex-col items-stretch gap-10 lg:flex-row lg:items-stretch lg:justify-center lg:gap-0">
          {columns.map((col, i) => {
            const Icon = col.Icon;
            return (
              <Fragment key={col.title}>
                <div className="flex min-w-0 flex-1 items-stretch lg:max-w-[440px]">
                  <div className="flex w-full flex-col">
                    <article className="learning-card group/card relative flex w-full flex-1 flex-col overflow-hidden rounded-[28px] border-2 border-slate-100 bg-white px-6 pb-6 pt-6 text-center">
                      <div className="learning-card-glow" aria-hidden />
                      <div className="learning-card-shine-wrap" aria-hidden>
                        <div className="learning-card-shine" />
                      </div>

                      <span className="learning-card-step relative z-10 mx-auto inline-flex rounded-full bg-[#4f6cf5] px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                        Step {col.step}
                      </span>

                      <div
                        className={`learning-card-icon relative z-10 mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-full ${col.iconWrap}`}
                      >
                        <Icon
                          className="h-7 w-7"
                          fill="currentColor"
                          strokeWidth={1.25}
                        />
                      </div>

                      <p
                        className={`learning-card-label relative z-10 mt-4 text-[11px] font-bold uppercase tracking-[0.16em] ${col.accent}`}
                      >
                        {col.label}
                      </p>
                      <h3 className="learning-card-title relative z-10 mt-1 text-xl font-bold text-[#0f2744]">
                        {col.title}
                      </h3>

                      <div className="relative z-10 mt-5 flex-1 space-y-2.5 text-left">
                        {col.items.length === 0 ? (
                          <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-4 text-center text-sm text-slate-500">
                            Nothing upcoming yet.
                          </p>
                        ) : (
                          col.items.map((item, itemIdx) => (
                            <Link
                              key={item.id}
                              href={item.href}
                              className="learning-item group block rounded-xl border border-slate-200/90 bg-white/90 px-4 py-3.5 backdrop-blur-[2px]"
                              style={{ "--item-i": itemIdx } as CSSProperties}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <p className="min-w-0 flex-1 text-[15px] font-semibold leading-snug text-[#0f172a] transition-colors group-hover:text-[#4f6cf5]">
                                  {item.title}
                                </p>
                                {item.pending ? (
                                  <span className="shrink-0 rounded-md bg-[#c8f066]/35 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#5a7a10]">
                                    Pending
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-1.5 text-[12px] leading-relaxed text-slate-500">
                                {item.detail}
                              </p>
                              {!item.pending ||
                              item.price.toLowerCase() !==
                                "pending owner content" ? (
                                <p className="mt-2 text-[13px] font-semibold text-[#4f6cf5]">
                                  {item.price}
                                </p>
                              ) : null}
                            </Link>
                          ))
                        )}
                      </div>

                      <Link
                        href={col.href}
                        className="learning-flow-cta learning-card-cta relative z-10 mt-5 inline-flex items-center justify-center gap-1.5 self-center rounded-full px-4 py-2 text-sm font-semibold text-[#4f6cf5]"
                      >
                        View all
                        <ArrowRight className="learning-card-cta-arrow h-3.5 w-3.5" />
                      </Link>
                    </article>

                    <p className="mt-3 flex items-start justify-center gap-2 px-1 text-center text-xs leading-snug text-slate-500">
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${col.chip.dot}`}
                      />
                      <span>{col.chip.text}</span>
                    </p>
                  </div>
                </div>

                {i < columns.length - 1 ? (
                  <div className="hidden w-[72px] shrink-0 flex-col items-center justify-center self-center px-1 lg:flex">
                    <span className="mb-1.5 whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.14em] text-[#4f6cf5]">
                      {col.arrowLabel}
                    </span>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#4f6cf5]/10 ring-1 ring-[#4f6cf5]/25">
                      <ArrowRight
                        className="h-4 w-4 text-[#4f6cf5]"
                        strokeWidth={2.5}
                      />
                    </span>
                  </div>
                ) : null}
              </Fragment>
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
          <h3 className="mt-3 text-lg font-bold text-[#0f2744]">
            Alex Example
          </h3>
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
    <section className="employers-home-strip relative overflow-hidden bg-white py-14 text-[#0f172a] sm:py-16">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 55% 70% at 0% 40%, rgba(200,240,102,0.35), transparent 58%), radial-gradient(ellipse 50% 60% at 100% 20%, rgba(79,108,245,0.14), transparent 55%), linear-gradient(180deg, #ffffff 0%, #fafcfa 50%, #f4f6ff 100%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-8 lg:px-10">
        <h2 className="max-w-3xl text-[1.75rem] font-bold leading-[1.1] tracking-tight text-[#0f172a] sm:text-4xl lg:text-[2.75rem]">
          Find candidates with the evidence you{" "}
          <span className="italic text-[#4f6cf5]">need</span>
        </h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600 sm:text-base">
          Filter by role, location, availability and checked credentials.
          Pricing: contact for pricing until fees are published.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/employers"
            className="employer-primary-cta rounded-lg bg-[#4f6cf5] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3f5ce8]"
          >
            Find candidates
          </Link>
          <Link
            href="/register?role=recruiter&next=/dashboard/recruiter/jobs/new"
            className="employer-secondary-cta rounded-lg border-2 border-[#4f6cf5] px-5 py-2.5 text-sm font-semibold text-[#4f6cf5] transition-colors hover:bg-[#4f6cf5]/10"
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
    <section className="home-faq-section relative overflow-hidden bg-white py-14 sm:py-16 lg:py-20">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 50% 55% at 50% 0%, rgba(79,108,245,0.08), transparent 55%), radial-gradient(ellipse 40% 45% at 100% 100%, rgba(200,240,102,0.18), transparent 50%)",
        }}
      />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-8">
        <div className="text-center">
          <h2 className="faq-display-title text-[2rem] font-bold leading-[1.08] tracking-[-0.03em] text-black sm:text-4xl lg:text-[2.75rem]">
            Frequently asked
            <br />
            questions.
          </h2>
          <p className="faq-intro mx-auto mt-4 max-w-xl text-center text-[15px] leading-relaxed text-[#666666] sm:text-base">
            Quick answers about profiles, verification, learning and how Stella
            Careers works.
          </p>
        </div>

        <div className="mt-10 space-y-3">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.q}
              className="group faq-item rounded-2xl border-2 border-slate-200/90 bg-white px-4 py-1 transition-all duration-200 open:border-[#4f6cf5] open:shadow-[0_14px_30px_-18px_rgba(79,108,245,0.35)] hover:border-[#4f6cf5]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3.5 font-semibold text-[#0f172a] marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="text-left text-[15px] sm:text-base">
                  {item.q}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-[#4f6cf5] transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <p className="border-t border-slate-100 pb-4 pt-3 text-sm leading-relaxed text-slate-600">
                {item.a}
              </p>
            </details>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href={signupHref}
            className="faq-primary-cta inline-flex items-center justify-center rounded-lg bg-[#4f6cf5] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3f5ce8]"
          >
            Build my free profile
          </Link>
        </div>
      </div>
    </section>
  );
}
