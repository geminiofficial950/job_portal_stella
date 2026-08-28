"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, MapPin } from "lucide-react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["italic", "normal"],
  display: "swap",
});

export default function HeroSection() {
  const [jobQuery, setJobQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  const searchUrl = `/jobs${
    jobQuery || locationQuery
      ? `?${new URLSearchParams({
          ...(jobQuery ? { q: jobQuery } : {}),
          ...(locationQuery ? { location: locationQuery } : {}),
        }).toString()}`
      : ""
  }`;

  return (
    <section className="hero-section relative overflow-hidden bg-[#005682] text-white">
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-start gap-0 px-4 sm:px-8 lg:grid-cols-2 lg:items-start lg:px-10">
        <div className="relative z-10 flex flex-col pt-4 pb-2 sm:py-5 lg:pt-14 lg:pb-8 lg:pr-8">
          <Link
            href="/jobs"
            className="mb-2.5 inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1 text-[11px] font-medium text-white/95 backdrop-blur-sm transition-colors hover:bg-white/15 sm:mb-4 sm:px-4 sm:py-1.5 sm:text-xs"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            Job Alert Subscribe
          </Link>

          <h1 className="hero-title mb-2 max-w-xl text-[1.85rem] font-bold leading-[1.08] tracking-tight text-white sm:mb-3 sm:text-5xl lg:text-[3.35rem]">
            Find what&apos;s{" "}
            <span
              className={`${playfair.className} font-normal italic text-[#eddcb1]`}
            >
              Next
            </span>
          </h1>

          <p className="mb-3 max-w-lg text-[13px] leading-relaxed text-sky-100/90 sm:mb-5 sm:text-[15px] sm:text-base">
            Australia&apos;s most intelligent talent platform — matching verified
            candidates to the right roles, faster.
          </p>

          <div className="flex w-full max-w-2xl flex-col gap-1.5 rounded-2xl bg-white p-1.5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.35)] sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-2 sm:pl-5">
            <div className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2 sm:gap-3 sm:px-0 sm:py-0">
              <Search className="h-4 w-4 shrink-0 text-slate-400 sm:h-[18px] sm:w-[18px]" />
              <input
                type="text"
                placeholder="Job title"
                className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none sm:py-2.5"
                value={jobQuery}
                onChange={(e) => setJobQuery(e.target.value)}
              />
            </div>

            <div className="mx-3 h-px bg-slate-200 sm:mx-0 sm:hidden" />
            <div className="hidden h-8 w-px shrink-0 bg-slate-200 sm:block" />

            <div className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2 sm:gap-3 sm:px-4 sm:py-0">
              <MapPin className="h-4 w-4 shrink-0 text-slate-400 sm:h-[18px] sm:w-[18px]" />
              <input
                type="text"
                placeholder="Location"
                className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none sm:py-2.5"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
            </div>

            <Link
              href={searchUrl}
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#074e79] px-8 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#053d61] active:scale-[0.98] sm:rounded-full"
            >
              Search
            </Link>
          </div>

          <div className="mt-3 flex items-center gap-2.5 text-[11px] text-sky-100/85 sm:mt-4 sm:text-[13px]">
            <span className="inline-flex h-2.5 w-8 rounded-full bg-white/20 ring-1 ring-white/15">
              <span className="m-auto h-1.5 w-3 rounded-full bg-sky-300/80" />
            </span>
            5,000+ candidates placed this year
          </div>
        </div>

        <div className="relative mt-1 flex justify-center sm:mt-0 lg:justify-end lg:self-end">
          <div className="relative leading-none">
            <img
              src="/homebanner.png"
              alt="Professional finding their next role"
              className="mx-auto block h-[220px] w-auto max-w-[min(100%,280px)] object-contain object-bottom sm:h-[400px] sm:max-w-full lg:h-[440px] lg:max-w-none"
            />

            <div className="absolute bottom-3 right-0 hidden items-center gap-3 rounded-2xl border border-slate-100/80 bg-white px-4 py-3 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.35)] lg:flex">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                <span className="h-3 w-3 rounded-full bg-white" />
              </div>
              <div className="text-left leading-tight text-slate-900">
                <p className="text-[11px] font-medium text-slate-500">
                  Candidates placed
                </p>
                <p className="text-sm font-bold">5k+ this year</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
