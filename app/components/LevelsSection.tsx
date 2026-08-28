"use client";

import React from "react";
import { Playfair_Display } from "next/font/google";
import {
  User,
  IdCard,
  ShieldCheck,
  ClipboardList,
  Headphones,
  Shield,
  Users,
  Star,
  Check,
} from "lucide-react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["italic", "normal"],
  display: "swap",
});

const LEVEL_STEPS = [
  {
    n: "L1",
    num: 1,
    title: "Profile started",
    desc: "History, availability, location.",
    Icon: User,
  },
  {
    n: "L2",
    num: 2,
    title: "Identity and work rights",
    desc: "ID matched, visa status confirmed.",
    Icon: IdCard,
  },
  {
    n: "L3",
    num: 3,
    title: "Credentials verified",
    desc: "Checked at the source, overseas study included.",
    Icon: ShieldCheck,
  },
  {
    n: "L4",
    num: 4,
    title: "Skills tested",
    desc: "Job-relevant assessments and referees.",
    Icon: ClipboardList,
  },
] as const;

const FILTER_LEVELS = ["L1+", "L2+", "L3+", "L4+", "L5"] as const;

function ScriptAccent({ children }: { children: React.ReactNode }) {
  return (
    <span className={`${playfair.className} font-normal italic text-[#2563eb]`}>
      {children}
    </span>
  );
}

function LevelHeroVisual() {
  return (
    <div
      className="levels-hero-visual relative mx-auto h-[190px] w-full max-w-[270px] sm:h-[210px] sm:max-w-[290px] lg:mx-0"
      aria-hidden="true"
    >
      {/* Soft blob + path — no box, edges fade out */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 290 210"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="levels-blob-a" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#bfdbfe" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="levels-blob-b" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#dbeafe" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="175" cy="125" rx="120" ry="85" fill="url(#levels-blob-a)" />
        <ellipse cx="130" cy="145" rx="95" ry="70" fill="url(#levels-blob-b)" />
        <path
          d="M28 168 C70 125, 115 85, 165 52 C205 28, 235 18, 258 12"
          fill="none"
          stroke="#93c5fd"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="28" cy="168" r="5" fill="#60a5fa" />
        <circle cx="115" cy="88" r="4" fill="#60a5fa" />
        <circle cx="195" cy="38" r="3.5" fill="#60a5fa" />
      </svg>

      <div className="absolute right-2 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#0c2440] shadow-[0_6px_20px_rgba(12,36,64,0.25)]">
        <Star className="h-4 w-4 text-white" fill="currentColor" strokeWidth={0} />
      </div>

      <div className="absolute bottom-0 left-0 right-6 rounded-2xl bg-white p-3.5 shadow-[0_14px_44px_rgba(15,39,68,0.1)] sm:p-4">
        <div className="flex items-center gap-3">
          <img
            src="/assets/07-level5-profile-person.png"
            alt=""
            className="levels-hero-avatar h-12 w-12 rounded-full object-cover sm:h-14 sm:w-14"
          />
          <div>
            <p className="text-xs font-medium text-slate-500 sm:text-sm">Level 5</p>
            <p className="text-lg font-bold leading-tight text-[#0f2744] sm:text-xl">Verified</p>
          </div>
        </div>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="space-y-2">
            <div className="h-1.5 w-14 rounded-full bg-slate-100 sm:w-16" />
            <div className="h-1.5 w-20 rounded-full bg-slate-100 sm:w-24" />
          </div>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50">
            <Check className="h-4 w-4 text-emerald-500" strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LevelsSection() {
  return (
    <section id="levels" className="levels-section bg-white py-10 sm:py-12 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="min-w-0 flex-1 lg:max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2563eb]">
              The level system
            </p>
            <h2 className="levels-title mt-3 text-[2rem] font-bold leading-[1.1] tracking-tight text-[#0f2744] sm:text-[2.35rem] lg:text-[2.5rem]">
              A level you <ScriptAccent>earn</ScriptAccent>,
              <br />
              not a badge you <ScriptAccent>buy.</ScriptAccent>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">
              Every profile starts at one. Each level adds evidence that somebody actually
              checked. Employers filter on it, so it has to mean something.
            </p>
          </div>
          <div className="flex shrink-0 justify-center lg:w-[300px] lg:justify-end">
            <LevelHeroVisual />
          </div>
        </div>

        {/* L1–L4 timeline */}
        <div className="relative mt-8 lg:mt-10">
          <div
            className="absolute left-[12%] right-[12%] top-5 hidden h-px border-t border-dashed border-sky-300 lg:block"
            aria-hidden="true"
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {LEVEL_STEPS.map(({ n, num, title, desc, Icon }) => (
              <div key={n} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 mb-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-sky-200 bg-white text-sm font-bold text-[#2563eb] shadow-sm">
                  {num}
                </div>
                <article className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-[0_4px_20px_rgba(15,39,68,0.04)]">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#2563eb]">
                    {n}
                  </p>
                  <div className="mt-4 flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-[#2563eb]">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-[#0f2744]">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
                </article>
              </div>
            ))}
          </div>
        </div>

        {/* L5 gate */}
        <div className="mt-8 overflow-hidden rounded-2xl bg-[#0c2440] px-5 py-5 sm:mt-10 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:px-6 sm:py-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#13325e] text-sky-300 ring-2 ring-sky-400/30">
              <Headphones className="h-6 w-6" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-300">
                L5
              </p>
              <h3 className="text-xl font-bold text-white sm:text-2xl">Human screened</h3>
              <p className="mt-1 text-sm text-sky-100/90">
                Phone interview, written note, shortlist ready.
              </p>
            </div>
          </div>
          <span className="mt-4 inline-flex rounded-full border border-white/35 px-5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white sm:mt-0">
            Gate
          </span>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 grid grid-cols-1 gap-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4 sm:px-6 lg:mt-8">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#2563eb] shadow-sm">
              <Shield className="h-4 w-4" strokeWidth={2.2} />
            </span>
            <div>
              <p className="text-sm font-bold text-[#0f2744]">Employers use levels to filter</p>
              <p className="mt-1 text-sm text-slate-600">
                Higher levels show more verified evidence.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {FILTER_LEVELS.map((level) => (
              <span
                key={level}
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  level === "L5"
                    ? "bg-[#0c2440] text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200"
                }`}
              >
                {level}
              </span>
            ))}
          </div>

          <div className="flex items-start gap-3 sm:justify-end">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#2563eb] shadow-sm">
              <Users className="h-4 w-4" strokeWidth={2.2} />
            </span>
            <div className="sm:text-right">
              <p className="text-sm font-bold text-[#0f2744]">Built for trust, not trophies</p>
              <p className="mt-1 text-sm text-slate-600">
                Real checks. Real people. Real confidence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
