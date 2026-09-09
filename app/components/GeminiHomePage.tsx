"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import HeroSection from "./HeroSection";
import MemberBenefitsSection from "./MemberBenefitsSection";
import HomeJobSearchStrip from "./HomeJobSearchStrip";
import HomeJobDetailModal from "./HomeJobDetailModal";
import {
  CareerJourneyStrip,
  LearningPreviewStrip,
  SampleVerificationStrip,
  EmployersHomeStrip,
  HomeFaqStrip,
} from "./StellaHomeExtras";
import "../gemini-home.css";
import { jobOffersVisaSponsorship } from "@/lib/visa-sponsorship";

type HomeJob = {
  id: string;
  title: string;
  company?: string;
  companyLogoUrl?: string;
  companyAbout?: string;
  location?: string;
  employmentType?: string;
  workMode?: string;
  category?: string;
  experienceLevel?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
  salaryPeriod?: string;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  skills?: string[];
  source?: string;
  applyUrl?: string;
  adref?: string;
  countryLabel?: string;
  createdAt?: string | null;
};

const PERIOD_LABELS: Record<string, string> = {
  hour: "hour",
  day: "day",
  week: "week",
  month: "month",
  year: "year",
};

function formatSalary(job: HomeJob) {
  const currency = (job.salaryCurrency || "AUD").toUpperCase();
  if (job.salaryMin == null && job.salaryMax == null) {
    return `${currency} — ask employer`;
  }
  const fmt = (n: number) =>
    n.toLocaleString("en-AU", { maximumFractionDigits: 0 });
  const min = job.salaryMin != null ? fmt(job.salaryMin) : "";
  const max = job.salaryMax != null ? fmt(job.salaryMax) : "";
  const amount =
    min && max && min !== max
      ? `${currency} ${min}–${max}`
      : `${currency} ${min || max}`;
  const period = job.salaryPeriod
    ? PERIOD_LABELS[job.salaryPeriod] || job.salaryPeriod
    : "";
  return period ? `${amount} / ${period}` : amount;
}

function formatLocationLines(location?: string): [string, string?] {
  const raw = (location || "Australia").trim();
  if (raw.includes(" · ")) {
    const [a, ...rest] = raw
      .split(" · ")
      .map((s) => s.trim())
      .filter(Boolean);
    return [a || raw, rest.join(" · ") || undefined];
  }
  if (raw.includes(",")) {
    const parts = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length >= 2) {
      return [parts[0], parts.slice(1).join(", ")];
    }
  }
  return [raw];
}

function mapHomeJob(j: Record<string, unknown>): HomeJob {
  const company = j.company;
  let companyNameStr = "";
  let companyLogoUrl = "";
  if (typeof company === "string") {
    companyNameStr = company;
  } else if (company && typeof company === "object") {
    const c = company as { name?: unknown; logoUrl?: unknown };
    companyNameStr = typeof c.name === "string" ? c.name : "";
    companyLogoUrl = typeof c.logoUrl === "string" ? c.logoUrl : "";
  }

  const companyAbout =
    company && typeof company === "object"
      ? String((company as { about?: unknown }).about || "")
      : "";

  const skills = Array.isArray(j.skills)
    ? j.skills.map((s) => String(s).trim()).filter(Boolean)
    : [];

  return {
    id: String(j.id || j._id || ""),
    title: String(j.title || "Role"),
    company: companyNameStr,
    companyLogoUrl,
    companyAbout,
    location: j.location ? String(j.location) : "",
    employmentType: j.employmentType ? String(j.employmentType) : "",
    workMode: j.workMode ? String(j.workMode) : "",
    category: j.category ? String(j.category) : "",
    experienceLevel: j.experienceLevel ? String(j.experienceLevel) : "",
    salaryMin: typeof j.salaryMin === "number" ? j.salaryMin : null,
    salaryMax: typeof j.salaryMax === "number" ? j.salaryMax : null,
    salaryCurrency: j.salaryCurrency ? String(j.salaryCurrency) : "AUD",
    salaryPeriod: j.salaryPeriod ? String(j.salaryPeriod) : "",
    description: j.description ? String(j.description) : "",
    requirements: j.requirements ? String(j.requirements) : "",
    responsibilities: j.responsibilities ? String(j.responsibilities) : "",
    skills,
    source: j.source ? String(j.source) : "",
    applyUrl: j.applyUrl ? String(j.applyUrl) : "",
    adref: j.adref ? String(j.adref) : "",
    countryLabel: j.countryLabel ? String(j.countryLabel) : "",
    createdAt: j.createdAt ? String(j.createdAt) : null,
  };
}

/** Prefer AU jobs that publish a pay rate; favour AUD when available. */
function pickPaidAuJobs(
  list: Array<Record<string, unknown>>,
  limit = 5,
): HomeJob[] {
  const withPay = list.filter(
    (j) =>
      typeof j.salaryMin === "number" || typeof j.salaryMax === "number",
  );
  const aud = withPay.filter(
    (j) => String(j.salaryCurrency || "").toUpperCase() === "AUD",
  );
  const ordered = [...aud, ...withPay.filter((j) => !aud.includes(j))];
  const seen = new Set<string>();
  const out: HomeJob[] = [];
  for (const j of ordered) {
    const mapped = mapHomeJob(j);
    if (!mapped.id || seen.has(mapped.id)) continue;
    seen.add(mapped.id);
    out.push(mapped);
    if (out.length >= limit) break;
  }
  return out;
}

/** H15 — current AU vacancies only; no demo feeds or unsupported claims */
function GenuineJobsStrip() {
  const [jobs, setJobs] = useState<HomeJob[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedJob, setSelectedJob] = useState<HomeJob | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/jobs/browse?country=au&fast=1");
        const data = await res.json();
        const list = (data.jobs || []) as Array<Record<string, unknown>>;
        if (cancelled) return;
        setJobs(pickPaidAuJobs(list, 5));
      } catch {
        if (!cancelled) setJobs([]);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="au-vacancies-section relative overflow-hidden py-12 sm:py-14 lg:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(37,99,235,0.12),_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(16,185,129,0.1),_transparent_45%),linear-gradient(180deg,#eef4fb_0%,#f8fafc_55%,#f0fdf4_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1500px] px-3 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-[#0f2744] sm:text-3xl">
            Current Australian vacancies
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Live Australian-eligible roles with published pay rates where
            supplied. Currency is shown explicitly.
          </p>
        </div>

        {!loaded ? (
          <p className="mt-6 text-sm text-slate-500">Loading jobs…</p>
        ) : jobs.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-white/60 bg-white/50 p-5 text-sm text-slate-500 backdrop-blur-md">
            No vacancies with published pay to preview right now.{" "}
            <Link
              href="/jobs?country=au"
              className="font-semibold text-[#2563eb]"
            >
              Browse all Australian jobs
            </Link>
          </p>
        ) : (
          <div className="mt-8 overflow-hidden rounded-[28px] border border-white/70 bg-white/45 shadow-[0_24px_60px_-28px_rgba(15,39,68,0.35)] backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/60 bg-white/35 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    <th className="px-5 py-4 font-bold sm:px-6">Role</th>
                    <th className="px-4 py-4 font-bold sm:px-5">Company</th>
                    <th className="px-4 py-4 font-bold sm:px-5">Location</th>
                    <th className="px-4 py-4 font-bold sm:px-5">Type</th>
                    <th className="px-4 py-4 font-bold sm:px-5">Pay rate</th>
                    <th className="px-5 py-4 text-right font-bold sm:px-6">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job, i) => (
                    <tr
                      key={job.id}
                      className={`border-b border-white/50 last:border-b-0 transition hover:bg-white/55 ${
                        i % 2 === 1 ? "bg-white/20" : "bg-transparent"
                      }`}
                    >
                      <td className="px-5 py-4 align-middle sm:px-6">
                        <p className="font-semibold leading-snug text-[#0f2744]">
                          {job.title}
                        </p>
                      </td>
                      <td className="px-4 py-4 align-middle text-sm text-slate-600 sm:px-5">
                        {job.company || "—"}
                      </td>
                      <td className="max-w-[220px] px-4 py-4 align-middle text-sm text-slate-600 sm:px-5">
                        {(() => {
                          const [line1, line2] = formatLocationLines(
                            job.location,
                          );
                          return (
                            <span className="block leading-snug">
                              <span className="block font-medium text-[#0f2744]">
                                {line1}
                              </span>
                              {line2 ? (
                                <span className="mt-0.5 block text-xs text-slate-500">
                                  {line2}
                                </span>
                              ) : null}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-4 align-middle sm:px-5">
                        <div className="flex flex-wrap gap-1.5">
                          {jobOffersVisaSponsorship(job) ? (
                            <span className="rounded-full border border-teal-300 bg-teal-50 px-2.5 py-0.5 text-[11px] font-extrabold text-teal-700">
                              Visa Sponsorship
                            </span>
                          ) : null}
                          {job.workMode ? (
                            <span className="rounded-full bg-sky-50/90 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-sky-700">
                              {job.workMode}
                            </span>
                          ) : null}
                          {job.employmentType ? (
                            <span className="rounded-full bg-slate-100/90 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-slate-600">
                              {job.employmentType}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 align-middle text-sm font-semibold text-[#0f2744] sm:px-5">
                        {formatSalary(job)}
                      </td>
                      <td className="px-5 py-4 align-middle text-right sm:px-6">
                        <button
                          type="button"
                          onClick={() => setSelectedJob(job)}
                          className="vacancy-table-cta inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#2563eb] px-4 py-2.5 text-sm font-bold shadow-sm transition hover:bg-[#1d4ed8]"
                          style={{ color: "#ffffff" }}
                        >
                          View more
                          <svg
                            aria-hidden
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Link
            href="/jobs?country=au"
            className="vacancy-find-more inline-flex items-center gap-2 rounded-full bg-[#00082C] px-7 py-3.5 text-sm font-bold shadow-[0_12px_30px_rgba(0,8,44,0.25)] transition hover:bg-[#00061F]"
            style={{ color: "#ffffff" }}
          >
            Find more jobs
            <svg
              aria-hidden
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      <HomeJobDetailModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
      />
    </section>
  );
}

/**
 * Homepage built to H01–H16 only (existing Stella visual language).
 * Old marketing sections (four things, demand board, demo tickers) removed.
 */
export default function GeminiHomePage() {
  return (
    <div className="gemini-home">
      <main id="top">
        {/* H02–H03 */}
        <HeroSection />

        {/* H04, H06–H10 — immediately below hero */}
        <MemberBenefitsSection />

        {/* H05 */}
        <HomeJobSearchStrip />

        {/* H11 */}
        <CareerJourneyStrip />

        {/* H12 */}
        <LearningPreviewStrip />

        {/* H13 */}
        <SampleVerificationStrip />

        {/* H14 */}
        <EmployersHomeStrip />

        {/* H15 */}
        <GenuineJobsStrip />

        {/* H16 */}
        <HomeFaqStrip />
      </main>
    </div>
  );
}
