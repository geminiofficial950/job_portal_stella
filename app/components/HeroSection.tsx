"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search } from "lucide-react";
import { Figtree } from "next/font/google";
import LocationSuggestInput from "@/app/components/LocationSuggestInput";
import KeywordSuggestInput from "@/app/components/KeywordSuggestInput";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

/** H02–H03 hero — checklist copy; job search lives after benefits (H05) */
export default function HeroSection() {
  const router = useRouter();
  const [jobQuery, setJobQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({ country: "au" });
    if (jobQuery.trim()) params.set("q", jobQuery.trim());
    if (locationQuery.trim()) {
      params.set("location", locationQuery.trim());
    }
    router.push(`/jobs?${params.toString()}`);
  }

  return (
    <section className="hero-section relative w-full overflow-hidden bg-white text-[#0f172a]">
      <div className="hero-atmosphere pointer-events-none absolute inset-0" aria-hidden />
      <div className="hero-orb hero-orb--lime pointer-events-none absolute -left-20 top-8 h-72 w-72 rounded-full" aria-hidden />
      <div className="hero-orb hero-orb--blue pointer-events-none absolute -right-16 top-1/3 h-80 w-80 rounded-full" aria-hidden />
      <div className="hero-orb hero-orb--lime-soft pointer-events-none absolute bottom-[-10%] left-[35%] h-56 w-56 rounded-full" aria-hidden />

      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-5 py-10 sm:gap-10 sm:px-8 sm:py-12 lg:grid-cols-2 lg:gap-4 lg:px-10 lg:py-6">
        <div className="hero-copy hero-copy-enter relative z-10 flex w-full flex-col items-center text-center lg:items-start lg:pr-8 lg:text-left">
          <h1
            className={`${figtree.className} hero-title max-w-xl text-[1.9rem] font-semibold leading-[1.1] tracking-tight text-[#0f172a] sm:text-5xl lg:text-[3.55rem]`}
          >
            Find what&apos;s{" "}
            <span className="hero-next-word font-semibold italic text-[#4f6cf5]">
              Next
            </span>
          </h1>

          <p className="hero-sub mt-0 max-w-md text-[15px] leading-relaxed text-slate-600 sm:max-w-lg sm:text-[17px] sm:leading-relaxed">
            Australia&apos;s most intelligent talent platform - matching
            verified candidates to the right roles, faster.
          </p>

          <form
            onSubmit={onSubmit}
            className="hero-search-form mt-0 flex w-full max-w-xl flex-col gap-1.5 rounded-2xl border border-[#4f6cf5]/12 bg-white/90 p-1.5 shadow-[0_18px_50px_-20px_rgba(79,108,245,0.35)] backdrop-blur-sm transition sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-1.5 sm:pl-4"
          >
            <div className="relative min-w-0 flex-1 px-3 py-2 sm:px-0 sm:py-0">
              <KeywordSuggestInput
                value={jobQuery}
                onChange={setJobQuery}
                placeholder="Job title"
                leading={<Search className="h-4 w-4 shrink-0 text-[#4f6cf5]/70" />}
                inputClassName="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none sm:py-2.5"
                className="home-location-suggest"
              />
            </div>
            <div className="hidden h-7 w-px shrink-0 bg-slate-200 sm:block" />
            <div className="relative min-w-0 flex-1 px-3 py-2 sm:px-3 sm:py-0">
              <LocationSuggestInput
                value={locationQuery}
                onChange={setLocationQuery}
                placeholder="Location"
                leading={<MapPin className="h-4 w-4 shrink-0 text-[#4f6cf5]/70" />}
                inputClassName="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none sm:py-2.5"
                className="home-location-suggest"
              />
            </div>
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-[#4f6cf5] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#3f5ce8] sm:rounded-lg"
            >
              Search
            </button>
          </form>
        </div>

        <div className="hero-visual relative z-10 flex w-full items-end justify-center lg:justify-end">
          <div className="relative leading-none">
            <div className="hero-visual-glow pointer-events-none absolute bottom-[8%] left-1/2 -translate-x-1/2" aria-hidden />
            <div className="hero-visual-disc pointer-events-none absolute left-1/2 top-[2%] -translate-x-1/2" aria-hidden />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/herosectionnewImage.png"
              alt="Adult professional building their career in Australia"
              className="hero-visual-img relative mx-auto block h-[220px] w-auto max-w-[min(100%,280px)] object-contain object-bottom sm:h-[420px] sm:max-w-full lg:h-[460px] lg:max-w-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
