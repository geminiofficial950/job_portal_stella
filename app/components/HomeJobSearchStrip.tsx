"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search } from "lucide-react";
import LocationSuggestInput from "@/app/components/LocationSuggestInput";
import KeywordSuggestInput from "@/app/components/KeywordSuggestInput";

/** Compact AU job search — same pill styling as the hero search */
export default function HomeJobSearchStrip() {
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
    <section id="job-search" className="home-job-search-strip bg-slate-50/80 py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-10">
        <div className="home-job-search-intro mx-auto max-w-xl">
          <h2 className="text-center text-xl font-bold tracking-tight text-[#0f2744] sm:text-2xl">
            Search Australian jobs
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Job title and suburb or postcode. Australia is the default country.
          </p>
        </div>
        <form
          onSubmit={onSubmit}
          className="mx-auto mt-6 flex w-full max-w-3xl flex-col gap-1.5 rounded-2xl bg-white p-1.5 shadow-[0_12px_40px_-12px_rgba(15,39,68,0.18)] sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-2 sm:pl-5"
        >
          <div className="relative min-w-0 flex-1 px-3 py-2 sm:px-0 sm:py-0">
            <KeywordSuggestInput
              value={jobQuery}
              onChange={setJobQuery}
              placeholder="Job title"
              leading={<Search className="h-4 w-4 shrink-0 text-slate-400" />}
              inputClassName="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none sm:py-2.5"
              className="home-location-suggest"
            />
          </div>
          <div className="hidden h-8 w-px shrink-0 bg-slate-200 sm:block" />
          <div className="relative min-w-0 flex-1 px-3 py-2 sm:px-4 sm:py-0">
            <LocationSuggestInput
              value={locationQuery}
              onChange={setLocationQuery}
              placeholder="Suburb / postcode"
              leading={<MapPin className="h-4 w-4 shrink-0 text-slate-400" />}
              inputClassName="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none sm:py-2.5"
              className="home-location-suggest"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-[#00082C] px-6 py-3 text-sm font-semibold text-white hover:bg-[#00061F] sm:rounded-full"
          >
            Search
          </button>
        </form>
      </div>
    </section>
  );
}
