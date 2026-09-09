"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search } from "lucide-react";

/** Compact AU job search — same pill styling as the hero search */
export default function HomeJobSearchStrip() {
  const router = useRouter();
  const [jobQuery, setJobQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({ country: "au" });
    if (jobQuery.trim()) params.set("q", jobQuery.trim());
    if (locationQuery.trim()) params.set("location", locationQuery.trim());
    router.push(`/jobs?${params.toString()}`);
  }

  return (
    <section id="job-search" className="bg-slate-50/80 py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-10">
        <h2 className="text-center text-xl font-bold tracking-tight text-[#0f2744] sm:text-2xl">
          Search Australian jobs
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-slate-500">
          Job title and suburb or postcode. Australia is the default country.
        </p>
        <form
          onSubmit={onSubmit}
          className="mx-auto mt-6 flex w-full max-w-3xl flex-col gap-1.5 rounded-2xl bg-white p-1.5 shadow-[0_12px_40px_-12px_rgba(15,39,68,0.18)] sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-2 sm:pl-5"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2 sm:px-0 sm:py-0">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              type="text"
              placeholder="Job title"
              className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none sm:py-2.5"
              value={jobQuery}
              onChange={(e) => setJobQuery(e.target.value)}
            />
          </div>
          <div className="hidden h-8 w-px shrink-0 bg-slate-200 sm:block" />
          <div className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2 sm:px-4 sm:py-0">
            <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              type="text"
              placeholder="Suburb / postcode"
              className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none sm:py-2.5"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
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
