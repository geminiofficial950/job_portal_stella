"use client";

import React from "react";
import { Playfair_Display } from "next/font/google";
import {
  Calendar,
  Shield,
  User,
  Check,
  Users,
  Phone,
  FolderOpen,
} from "lucide-react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["italic", "normal"],
  display: "swap",
});

const MATCH_BARS = [
  { label: "Shift Pattern & Availability", val: 96, color: "#3b82f6", Icon: Calendar },
  { label: "Verified Credentials & Clearances", val: 94, color: "#8b5cf6", Icon: Shield },
  { label: "Role Capability & Skills Test", val: 88, color: "#22c55e", Icon: User },
] as const;

const VERIFY_LEFT = [
  { text: "Identity matched", tone: "title" as const },
  { text: "Passport & Driver License", tone: "sub" as const },
  { text: "Work rights via VEVO", tone: "title" as const },
  { text: "Direct DHA Database Link", tone: "link" as const },
] as const;

const VERIFY_RIGHT = [
  { text: "Qualification at source", tone: "title" as const },
  { text: "University & TAFE Verified", tone: "sub" as const },
  { text: "Clearance current today", tone: "title" as const },
  { text: "NDIS & Police Check Valid", tone: "sub" as const },
] as const;

const LANGS = [
  "English",
  "Hindi",
  "Tagalog",
  "Tiếng Việt",
  "Arabic",
  "Bahasa",
  "+ 6 more",
] as const;

function ScriptAccent({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <span className={`${playfair.className} font-normal italic ${className}`}>
      {children}
    </span>
  );
}

function DonutChart({ size = "lg" }: { size?: "lg" | "md" }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const pct = 0.98;
  const dim = size === "lg" ? "h-[112px] w-[112px]" : "h-[96px] w-[96px]";
  return (
    <div className={`relative shrink-0 ${dim}`}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e8edf4" strokeWidth="7" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#2563eb"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xl font-bold leading-none text-[#0f2744] sm:text-2xl">98%</span>
        <span className="mt-0.5 text-[9px] font-medium text-slate-500">Match Score</span>
      </div>
    </div>
  );
}

function VerifyLine({
  text,
  tone,
}: {
  text: string;
  tone: "title" | "sub" | "link";
}) {
  const textClass =
    tone === "title"
      ? "font-medium text-white"
      : tone === "link"
        ? "text-sky-300"
        : "text-slate-400";

  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#38bdf8]">
        <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
      </span>
      <p className={`whitespace-nowrap text-xs leading-none sm:text-[13px] ${textClass}`}>
        {text}
      </p>
    </div>
  );
}

function VerifyChecklist() {
  return (
    <div className="mt-8 flex gap-4 sm:mt-9 sm:gap-5">
      <div className="flex shrink-0 flex-col gap-3">
        {VERIFY_LEFT.map((line) => (
          <VerifyLine key={line.text} text={line.text} tone={line.tone} />
        ))}
      </div>
      <div className="flex shrink-0 flex-col gap-3">
        {VERIFY_RIGHT.map((line) => (
          <VerifyLine key={line.text} text={line.text} tone={line.tone} />
        ))}
      </div>
    </div>
  );
}

function VerificationShieldGraphic() {
  return (
    <div
      className="pointer-events-none absolute top-[32%] right-0 z-[1] h-[190px] w-[190px] -translate-y-1/2 sm:right-1 sm:top-[28%] sm:h-[210px] sm:w-[210px] lg:top-[26%] lg:h-[230px] lg:w-[230px]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 220 220" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id="shieldFaceLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="shieldFaceDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          <linearGradient id="orbitStroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#c4b5fd" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
          </linearGradient>
          <filter id="shieldGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#2563eb" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Orbital rings */}
        <ellipse
          cx="110"
          cy="112"
          rx="92"
          ry="34"
          fill="none"
          stroke="url(#orbitStroke)"
          strokeWidth="1.4"
          transform="rotate(-18 110 112)"
        />
        <ellipse
          cx="110"
          cy="108"
          rx="38"
          ry="92"
          fill="none"
          stroke="url(#orbitStroke)"
          strokeWidth="1.2"
          transform="rotate(-18 110 108)"
        />
        <ellipse
          cx="110"
          cy="110"
          rx="78"
          ry="78"
          fill="none"
          stroke="#c4b5fd"
          strokeWidth="0.8"
          opacity="0.25"
        />

        {/* Orbit nodes */}
        <circle cx="168" cy="98" r="3" fill="#c4b5fd" opacity="0.9" />
        <circle cx="52" cy="126" r="2.5" fill="#38bdf8" opacity="0.8" />
        <circle cx="142" cy="158" r="2" fill="#a78bfa" opacity="0.7" />
        <circle cx="78" cy="72" r="2" fill="#e0e7ff" opacity="0.85" />

        {/* Shield body — 3D split facets */}
        <g filter="url(#shieldGlow)" transform="translate(110 118)">
          <path
            d="M0 -58 L48 -40 L48 8 C48 36 0 62 0 62 C0 62 -48 36 -48 8 L-48 -40 Z"
            fill="url(#shieldFaceLight)"
          />
          <path
            d="M0 -58 L48 -40 L48 8 C48 36 0 62 0 62 L0 -58 Z"
            fill="url(#shieldFaceDark)"
            opacity="0.95"
          />
          <path
            d="M0 -58 L48 -40 L48 8 C48 36 0 62 0 62 C0 62 -48 36 -48 8 L-48 -40 Z"
            fill="none"
            stroke="#bfdbfe"
            strokeWidth="1.5"
            opacity="0.5"
          />

          {/* White badge */}
          <circle cx="0" cy="6" r="24" fill="#ffffff" />
          <circle cx="0" cy="6" r="24" fill="none" stroke="#e2e8f0" strokeWidth="1" opacity="0.6" />

          {/* Green check */}
          <path
            d="M-12 6 L-4 14 L14 -6"
            fill="none"
            stroke="#22c55e"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
}

function Waveform() {
  return (
    <div className="flex h-9 items-end gap-[3px]">
      {[5, 10, 7, 14, 9, 16, 11, 18, 13, 20, 15, 17, 9, 12, 6].map((h, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-violet-400"
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
}

export default function FourThingsSection() {
  return (
    <section id="difference" className="four-things-section bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-10">
        {/* Header — centered copy, man top-right */}
        <div className="four-things-header relative flex flex-col items-center pt-14 pb-10 text-center sm:pt-16 sm:pb-12">
          <div className="pointer-events-none absolute right-0 top-2 hidden sm:block lg:top-0">
            <div className="relative h-[130px] w-[140px] lg:h-[160px] lg:w-[175px]">
              <div className="absolute inset-0 rounded-[45%_55%_50%_50%] bg-violet-200/80" />
              <img
                src="/assets/02-four-things-man.png"
                alt=""
                className="relative z-10 h-full w-full object-contain object-bottom"
              />
              <div className="absolute -right-0.5 bottom-10 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 shadow-md ring-2 ring-white">
                <Check className="h-4 w-4 text-white" strokeWidth={3} />
              </div>
            </div>
          </div>

          <h2 className="four-things-title w-full max-w-3xl text-center text-[1.75rem] font-bold leading-[1.12] tracking-tight text-[#0f2744] sm:text-4xl lg:text-[2.65rem]">
            Four things a job board{" "}
            <span className="text-rose-400 line-through decoration-rose-400/90 decoration-2">
              cannot
            </span>{" "}
            do.
          </h2>
          <p className="four-things-sub mt-4 max-w-xl text-center text-[15px] leading-relaxed text-slate-500 sm:text-base">
            Matching is the easy part. Everything around it is where hiring actually
            breaks.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-5 pb-16 lg:grid-cols-2 lg:items-stretch lg:gap-6 lg:pb-20">
          {/* 1 — Matching Engine */}
          <article className="relative flex h-full flex-col overflow-hidden rounded-[22px] border border-slate-100 bg-white p-4 shadow-[0_10px_40px_rgba(15,39,68,0.07)] sm:p-5">
            <div
              className="pointer-events-none absolute right-0 top-0 h-40 w-44 opacity-35"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #94a3b8 1.2px, transparent 1.2px)",
                backgroundSize: "11px 11px",
              }}
            />

            <div className="relative flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#2563eb]">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50">
                  <FolderOpen className="h-3.5 w-3.5" />
                </span>
                Matching Engine
              </div>
              <DonutChart size="md" />
            </div>

            <h3 className="four-things-card-title relative z-10 mt-3 max-w-[62%] text-[1.25rem] font-bold leading-snug text-[#0f2744] sm:text-[1.35rem]">
              Backed with the{" "}
              <ScriptAccent className="text-[#2563eb]">reasoning shown.</ScriptAccent>
            </h3>
            <p className="relative z-10 mt-1.5 max-w-[58%] text-[12px] leading-snug text-slate-500 sm:text-[13px]">
              Every score comes with its evidence: which credential matched, which shift
              pattern fits, and exactly what is missing. No black box.
            </p>

            <div className="relative z-10 mt-auto space-y-2.5 pt-3">
              {MATCH_BARS.map(({ label, val, color, Icon }) => (
                <div key={label}>
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-50 text-slate-400 ring-1 ring-slate-100">
                        <Icon className="h-3 w-3" />
                      </span>
                      <span className="truncate text-[12px] text-slate-600 sm:text-[13px]">{label}</span>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-[#0f2744] sm:text-sm">{val}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${val}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* 2 — Instant Verification */}
          <article className="relative flex h-full flex-col overflow-hidden rounded-[22px] bg-[#0c2440] p-5 text-white sm:p-6">
            <div
              className="pointer-events-none absolute bottom-0 left-0 h-28 w-36 opacity-[0.12]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(-45deg, #fff 0 1px, transparent 1px 12px)",
              }}
            />
            <div
              className="pointer-events-none absolute bottom-0 right-0 h-24 w-32 opacity-20"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(56,189,248,0.35) 8px, rgba(56,189,248,0.35) 9px)",
              }}
            />
            <VerificationShieldGraphic />

            <div className="relative z-10 pr-0 sm:pr-[30%]">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em]">
                <span className="text-white/90">Instant </span>
                <span className="text-sky-300">Verification</span>
              </p>
              <h3 className="four-things-card-title mt-3 text-[1.85rem] font-bold leading-[1.08] tracking-tight sm:text-[2rem] lg:text-[2.15rem]">
                <span className="block">We check,</span>
                <span className="mt-0.5 block">
                  so you <ScriptAccent className="text-sky-200">don&apos;t.</ScriptAccent>
                </span>
              </h3>

              <VerifyChecklist />
            </div>
          </article>

          {/* 3 — Multilingual Support */}
          <article className="relative flex h-full flex-col overflow-hidden rounded-[22px] bg-[#fce9dc] p-5">
            <div className="relative z-10 max-w-[62%]">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-600">
                Multilingual Support
              </p>
              <h3 className="four-things-card-title mt-4 text-[1.35rem] font-bold leading-snug text-[#0f2744] sm:text-[1.45rem]">
                Native languages{" "}
                <ScriptAccent className="text-orange-600">on the phones.</ScriptAccent>
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-600 sm:text-sm">
                Stella consultants speak your language — and the platform does too. No
                translation layers, no miscommunication.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {LANGS.map((lang) => (
                  <span
                    key={lang}
                    className="rounded-full border border-orange-100 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm"
                  >
                    {lang}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                <Users className="h-4 w-4 text-orange-500" />
                All available to candidates at no cost.
              </div>
            </div>

            <img
              src="/assets/03-four-things-support-woman.png"
              alt=""
              className="pointer-events-none absolute -bottom-2 right-0 z-10 h-[150px] w-auto object-contain sm:h-[170px]"
            />
          </article>

          {/* 4 — Level 5 Pre-Screened */}
          <article className="relative flex h-full flex-col overflow-hidden rounded-[22px] bg-[#f3f4f8] p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-violet-600">
                Level 5 Pre-Screened
              </p>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold text-violet-700 shadow-sm ring-1 ring-violet-100">
                <Phone className="h-3 w-3" />
                Phone Verified
              </span>
            </div>

            <h3 className="four-things-card-title mt-3 max-w-md text-[1.35rem] font-bold leading-snug text-[#0f2744] sm:text-[1.45rem]">
              A phone interview{" "}
              <ScriptAccent className="text-violet-600">before the shortlist.</ScriptAccent>
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-600 sm:text-sm">
              When a candidate reaches Level 5, a consultant calls, works through a script
              built from the gaps in that profile, and writes a note that travels with
              them.
            </p>

            <div className="mt-4 flex flex-1 flex-col justify-end">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_4px_20px_rgba(15,39,68,0.06)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0f2744]">Consultant Note</p>
                    <p className="text-xs text-slate-500">Emily R. • 2 days ago</p>
                  </div>
                </div>
                <Waveform />
              </div>
              <p className="mt-3 text-[13px] italic leading-relaxed text-slate-600">
                &ldquo;10+ years aged care experience. Full 24/7 availability. Excellent
                communication skills and verified NDIS clearance.&rdquo;
              </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
