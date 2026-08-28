"use client";

import React from "react";
import { Playfair_Display } from "next/font/google";
import { ShieldCheck, Users, BadgeCheck } from "lucide-react";
import {
  TRUSTED_LOGOS_ROW1,
  TRUSTED_LOGOS_ROW2,
  TRUSTED_LOGOS_ALL,
} from "@/app/components/trustedByLogos";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["italic", "normal"],
  display: "swap",
});

const AVATARS = [
  { src: "/assets/09-trust-avatar-01.png", alt: "Candidate" },
  { src: "/assets/09-trust-avatar-02.png", alt: "Candidate" },
  { src: "/assets/09-trust-avatar-03.png", alt: "Candidate" },
  { src: "/assets/09-trust-avatar-04.png", alt: "Candidate" },
  { src: "/assets/09-trust-avatar-05.png", alt: "Candidate" },
];

const LEFT_FLOATS = [
  { type: "avatar", index: 0, className: "top-[8%] left-[2%] lg:left-[4%]" },
  { type: "shield", className: "top-[38%] left-[0%] lg:left-[2%]" },
  { type: "avatar", index: 1, className: "bottom-[18%] left-[3%] lg:left-[6%]" },
] as const;

const RIGHT_FLOATS = [
  { type: "avatar", index: 2, className: "top-[6%] right-[2%] lg:right-[4%]" },
  { type: "badge100", className: "top-[28%] right-[0%] lg:right-[2%]" },
  { type: "avatar", index: 3, className: "top-[48%] right-[4%] lg:right-[7%]" },
  { type: "people", className: "bottom-[28%] right-[1%] lg:right-[3%]" },
  { type: "avatar", index: 4, className: "bottom-[8%] right-[5%] lg:right-[9%]" },
] as const;

function FloatAvatar({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-white shadow-md ring-1 ring-slate-200/80 sm:h-16 sm:w-16 lg:h-[68px] lg:w-[68px]">
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
}

function FloatIcon({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <div
      className={`flex h-12 w-12 items-center justify-center rounded-full border border-white bg-white shadow-md ring-1 ring-slate-200/70 sm:h-14 sm:w-14 ${className}`}
    >
      {children}
    </div>
  );
}

export default function TrustedBySection() {
  return (
    <section className="trusted-by-section relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        <svg
          className="absolute inset-0 h-full w-full text-slate-300/70"
          viewBox="0 0 1200 420"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M90 120 C 180 80, 260 140, 340 170"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 6"
          />
          <path
            d="M80 280 C 170 320, 250 260, 330 230"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 6"
          />
          <path
            d="M1110 100 C 1020 70, 940 130, 860 160"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 6"
          />
          <path
            d="M1120 290 C 1030 330, 950 270, 870 240"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 6"
          />
        </svg>

        {LEFT_FLOATS.map((item, i) => (
          <div key={`l-${i}`} className={`absolute ${item.className}`}>
            {item.type === "avatar" ? (
              <FloatAvatar src={AVATARS[item.index].src} alt={AVATARS[item.index].alt} />
            ) : (
              <FloatIcon className="bg-blue-50 text-blue-600">
                <ShieldCheck className="h-6 w-6" strokeWidth={2.2} />
              </FloatIcon>
            )}
          </div>
        ))}

        {RIGHT_FLOATS.map((item, i) => (
          <div key={`r-${i}`} className={`absolute ${item.className}`}>
            {item.type === "avatar" ? (
              <FloatAvatar src={AVATARS[item.index].src} alt={AVATARS[item.index].alt} />
            ) : item.type === "badge100" ? (
              <FloatIcon className="bg-pink-50 text-xl">💯</FloatIcon>
            ) : (
              <FloatIcon className="bg-orange-50 text-orange-500">
                <Users className="h-6 w-6" strokeWidth={2.2} />
              </FloatIcon>
            )}
          </div>
        ))}
      </div>

      <div className="trusted-by-header relative mx-auto flex max-w-7xl flex-col items-center px-4 pt-10 pb-8 text-center sm:px-8 sm:pt-12 sm:pb-10 lg:px-10">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#2563eb] sm:text-xs">
          Trusted by
        </p>

        <h2 className="trusted-by-title w-full max-w-3xl text-center text-[1.65rem] font-bold leading-[1.12] tracking-tight text-[#0f2744] sm:text-4xl lg:text-[2.65rem]">
          <span className="block">Trusted by leading</span>
          <span className="mt-1 block">
            <span className="relative inline-block">
              <span className={`${playfair.className} font-normal italic text-[#2563eb]`}>
                Australian
              </span>
              <svg
                className="absolute -bottom-1 left-0 w-full text-violet-400/80"
                viewBox="0 0 120 8"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M2 6 C30 2, 90 2, 118 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            employers
          </span>
        </h2>

        <p className="trusted-by-sub mt-4 max-w-2xl text-center text-sm leading-relaxed text-slate-500 sm:text-[15px]">
          Healthcare. Community services. Corporate. Government. Australia&apos;s most
          trusted workplaces hire on Stella.
        </p>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-12 sm:px-8 sm:pb-14 lg:px-10">
        <div className="rounded-[28px] bg-[#f4f7fb] p-4 sm:p-5 lg:p-6">
          {/* Mobile — horizontal auto-scroll */}
          <div className="trusted-logo-scroll lg:hidden">
            <div className="trusted-logo-marquee">
              {[...TRUSTED_LOGOS_ALL, ...TRUSTED_LOGOS_ALL].map(({ name, Logo }, i) => (
                <div
                  key={`${name}-${i}`}
                  className="flex h-[72px] w-[148px] shrink-0 items-center justify-center rounded-2xl border border-slate-100/80 bg-white px-3 py-4 shadow-[0_2px_12px_rgba(15,39,68,0.05)]"
                >
                  <Logo className="h-8 w-full max-w-[110px]" />
                </div>
              ))}
            </div>
          </div>

          {/* Desktop — grid */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-5 gap-3">
              {TRUSTED_LOGOS_ROW1.map(({ name, Logo }) => (
                <div
                  key={name}
                  className="flex min-h-[80px] items-center justify-center rounded-2xl border border-slate-100/80 bg-white px-3 py-4 shadow-[0_2px_12px_rgba(15,39,68,0.05)]"
                >
                  <Logo className="h-9 w-full max-w-[110px]" />
                </div>
              ))}
            </div>

            <div className="mx-auto mt-3 grid max-w-4xl grid-cols-4 gap-3">
              {TRUSTED_LOGOS_ROW2.map(({ name, Logo }) => (
                <div
                  key={name}
                  className="flex min-h-[80px] items-center justify-center rounded-2xl border border-slate-100/80 bg-white px-3 py-4 shadow-[0_2px_12px_rgba(15,39,68,0.05)]"
                >
                  <Logo className="h-9 w-full max-w-[110px]" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400 lg:hidden">
          <BadgeCheck className="h-4 w-4 text-emerald-500" />
          Verified employers across Australia
        </div>
      </div>
    </section>
  );
}
