"use client";

import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { BENEFIT_CARDS } from "@/lib/stellaContent";
import { useAuth } from "@/app/components/AuthProvider";

const ICONS = [UserRound, GraduationCap, BookOpen, CalendarDays, ShieldCheck];

/** Per-card accents — same vibe as the reference skills cards */
const THEMES = [
  {
    // purple
    iconBg: "bg-[#f3e8ff]",
    iconColor: "text-[#7c3aed]",
    bar: "from-[#8b5cf6] to-[#c084fc]",
    float: "bg-[#8b5cf6]/15 text-[#7c3aed]",
    glow: "rgba(139, 92, 246, 0.22)",
    pct: "text-[#7c3aed]",
  },
  {
    // pink / magenta
    iconBg: "bg-[#fce7f3]",
    iconColor: "text-[#db2777]",
    bar: "from-[#ec4899] to-[#f9a8d4]",
    float: "bg-[#ec4899]/15 text-[#db2777]",
    glow: "rgba(236, 72, 153, 0.2)",
    pct: "text-[#db2777]",
  },
  {
    // orange
    iconBg: "bg-[#ffedd5]",
    iconColor: "text-[#ea580c]",
    bar: "from-[#f97316] to-[#fdba74]",
    float: "bg-[#f97316]/15 text-[#ea580c]",
    glow: "rgba(249, 115, 22, 0.2)",
    pct: "text-[#ea580c]",
  },
  {
    // blue
    iconBg: "bg-[#dbeafe]",
    iconColor: "text-[#2563eb]",
    bar: "from-[#3b82f6] to-[#93c5fd]",
    float: "bg-[#3b82f6]/15 text-[#2563eb]",
    glow: "rgba(59, 130, 246, 0.2)",
    pct: "text-[#2563eb]",
  },
  {
    // teal
    iconBg: "bg-[#ccfbf1]",
    iconColor: "text-[#0d9488]",
    bar: "from-[#14b8a6] to-[#5eead4]",
    float: "bg-[#14b8a6]/15 text-[#0d9488]",
    glow: "rgba(20, 184, 166, 0.2)",
    pct: "text-[#0d9488]",
  },
] as const;

/** H04 + H06–H10 — five benefits immediately below hero */
export default function MemberBenefitsSection() {
  const { user } = useAuth();
  const profileHref =
    user?.role === "user"
      ? "/profile/setup"
      : "/register?role=user&next=/profile/setup";

  return (
    <section
      id="benefits"
      className="benefits-section relative overflow-hidden py-14 sm:py-16 lg:py-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(167,139,250,0.16),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(251,146,60,0.12),_transparent_45%),linear-gradient(180deg,#f8f5ff_0%,#fff_55%,#fff7ed_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-24 h-56 w-56 rounded-full bg-[#a78bfa]/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-10 h-64 w-64 rounded-full bg-[#fb923c]/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-8 lg:px-10">
        <div
          className="benefits-header mx-auto mb-10 w-full max-w-3xl sm:mb-12"
          style={{ textAlign: "center" }}
        >
          <h2
            className="text-[1.5rem] font-bold leading-tight tracking-tight text-[#0f2744] sm:text-3xl lg:whitespace-nowrap lg:text-4xl"
            style={{ textAlign: "center" }}
          >
            Five ways Stella Careers supports{" "}
            <span className="relative inline-block bg-gradient-to-r from-[#f97316] via-[#ec4899] to-[#8b5cf6] bg-clip-text text-transparent">
              you
              <span
                aria-hidden
                className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-[#f97316] via-[#ec4899] to-[#8b5cf6]"
              />
            </span>
          </h2>
          <div className="mx-auto mt-4 w-full max-w-2xl">
            <p
              className="benefits-intro text-[15px] leading-relaxed text-slate-500 sm:text-base"
              style={{ textAlign: "center" }}
            >
              Only profile building is promised as free across the whole offer.
              Courses, sessions, events and checks show Free, Included for
              members, or their price.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {BENEFIT_CARDS.map((card, i) => {
            const Icon = ICONS[i] || UserRound;
            const theme = THEMES[i] || THEMES[0];
            const href =
              card.id === "free-profile" ? profileHref : card.href;
            return (
              <article
                key={card.id}
                className="benefit-card group relative flex h-full flex-col rounded-[24px] border border-white/80 bg-white/75 p-5 shadow-[0_18px_50px_-20px_rgba(15,39,68,0.28)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_-24px_rgba(15,39,68,0.35)] sm:p-6"
                style={{ boxShadow: `0 18px 50px -20px ${theme.glow}` }}
              >
                <div
                  aria-hidden
                  className={`absolute -right-2 -top-2 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 shadow-md backdrop-blur-sm transition duration-300 group-hover:rotate-6 ${theme.float}`}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                </div>

                <div className="flex items-start justify-between gap-3 pr-6">
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/80 shadow-sm ${theme.iconBg} ${theme.iconColor}`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <h3 className="pt-1.5 text-[1.1rem] font-bold leading-snug text-[#0f2744] sm:text-[1.15rem]">
                      {card.title}
                    </h3>
                  </div>
                  <span
                    aria-hidden
                    className={`shrink-0 pt-1 text-sm font-bold tabular-nums ${theme.pct}`}
                  >
                    {["01", "02", "03", "04", "05"][i]}
                  </span>
                </div>

                <div
                  aria-hidden
                  className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
                >
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${theme.bar} transition-all duration-500 group-hover:brightness-110`}
                    style={{ width: `${[92, 86, 88, 84, 90][i]}%` }}
                  />
                </div>

                <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-500">
                  {card.description}
                </p>

                <Link
                  href={href}
                  className="benefit-card-cta mt-5 inline-flex w-fit items-center rounded-xl bg-[#00082C] px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:bg-[#00061F] hover:shadow-md"
                >
                  {card.button}
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
