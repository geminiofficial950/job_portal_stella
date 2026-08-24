"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Bookmark, MapPin } from "lucide-react";
import { useReveal } from "../hooks/useReveal";

const recommendedJobsData = [
  { id: "rec-1", company: "Glints",  logoBg: "#0052CC", logoText: "✦", title: "Senior UI/UX Designer",    workModel: "Remote", type: "Full-time", salary: "$3,500/mo", location: "Jakarta, ID",   matchScore: 98, tags: ["Figma", "UI Design", "Prototyping"] },
  { id: "rec-2", company: "Apple",   logoBg: "#1d1d1f", logoSvg: true,  title: "Lead Product Designer",   workModel: "Hybrid", type: "Full-time", salary: "$120k/yr",  location: "Cupertino, CA", matchScore: 95, tags: ["Product Design", "Design Systems", "iOS"] },
  { id: "rec-3", company: "Stripe",  logoBg: "#635BFF", logoText: "S",  title: "Frontend React Architect", workModel: "Remote", type: "Full-time", salary: "$4,800/mo", location: "Remote, US",   matchScore: 92, tags: ["React", "Next.js", "TypeScript"] },
  { id: "rec-4", company: "Notion",  logoBg: "#191919", logoText: "N",  title: "Growth Marketing Manager", workModel: "Remote", type: "Full-time", salary: "$95k/yr",   location: "San Francisco, CA", matchScore: 88, tags: ["Growth", "SEO", "Analytics"] },
];

function AppleLogo() {
  return (
    <svg className="w-5 h-5 fill-white" viewBox="0 0 170 170">
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.82.13-9.68-1.95-14.58-6.23-3.25-2.77-7.14-7.42-11.67-13.97-6.52-9.42-11.66-19.7-15.42-30.85-3.76-11.15-5.64-21.84-5.64-32.07 0-14.16 3.52-25.75 10.56-34.78 7.04-9.03 15.93-13.62 26.67-13.78 4.82 0 10.12 1.25 15.9 3.75 5.78 2.5 9.77 3.75 11.97 3.75 1.8 0 5.86-1.31 12.18-3.93 6.32-2.62 11.45-3.83 15.4-3.63 11.46.7 20.8 4.79 28.02 12.27-10.3 6.25-15.3 14.99-15 26.22.31 8.89 3.74 16.29 10.29 22.2 6.55 5.91 14.3 9.3 23.25 10.17-2.3 6.78-5.4 13.97-9.3 21.57zM119.22 31.87c0-6.72 2.42-13.11 7.26-18.17 4.84-5.06 10.87-8.08 18.09-9.06.13.9.19 1.77.19 2.62 0 6.64-2.52 13.06-7.56 18.26-5.04 5.2-11.13 8.21-18.27 9.03-.06-.88-.1-1.77-.1-2.68z" />
    </svg>
  );
}

function MatchBar({ score }: { score: number }) {
  const color = score >= 95 ? "#dc2626" : score >= 90 ? "#3B82F6" : "#F59E0B";
  return (
    <div className="flex items-center gap-2 min-w-[90px]">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color, transition: "width 0.8s ease" }} />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color }}>{score}%</span>
    </div>
  );
}

export default function RecommendedJobs() {
  const [saved, setSaved] = useState<string[]>(["rec-1"]);
  const sectionRef = useReveal() as React.RefObject<HTMLElement>;
  const listRef = useReveal({ threshold: 0.08 }) as React.RefObject<HTMLDivElement>;

  const toggleSave = (id: string) =>
    setSaved((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  return (
    <section ref={sectionRef} className="reveal py-14 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-100">
      <div className="max-w-5xl mx-auto">
        <div className="reveal flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-manrope tracking-tight">
              Recommended for You
            </h2>
            <p className="text-sm text-slate-500 mt-1 font-inter">
              Roles curated to your experience, skills, and preferred work model.
            </p>
          </div>
          <Link href="/jobs" className="inline-flex items-center gap-1 text-xs font-bold text-[#b91c1c] hover:underline shrink-0">
            View all <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div ref={listRef} className="reveal-stagger flex flex-col divide-y divide-slate-100">
          {recommendedJobsData.map((job) => {
            const isSaved = saved.includes(job.id);
            return (
              <div key={job.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 py-5 hover:bg-slate-50/70 transition-colors duration-200 rounded-2xl px-3 -mx-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{ background: job.logoBg }}>
                  {job.logoSvg ? <AppleLogo /> : (
                    <span className="text-white font-black text-base">{job.logoText}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 mb-0.5">
                    <span className="text-[13px] font-semibold text-slate-400 font-inter">{job.company}</span>
                    <span className="text-slate-200">·</span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <MapPin className="w-3 h-3" />{job.location}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-manrope truncate mb-2">{job.title}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
                      style={{ background: "#f0fdf4", borderColor: "#bbf7d0", color: "#15803d" }}>{job.workModel}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">{job.type}</span>
                    {job.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-50 text-slate-500 border border-slate-200">{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 hidden sm:flex flex-col gap-1 items-end w-28">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Match</span>
                  <MatchBar score={job.matchScore} />
                </div>

                <div className="shrink-0 hidden sm:block text-right w-24">
                  <div className="text-sm font-extrabold text-slate-900 font-manrope">{job.salary}</div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button type="button" onClick={() => toggleSave(job.id)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-200 cursor-pointer"
                    style={{
                      background: isSaved ? "#f0fdf4" : "#fff",
                      borderColor: isSaved ? "#bbf7d0" : "#e2e8f0",
                      color: isSaved ? "#16a34a" : "#94a3b8",
                    }}>
                    <Bookmark className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
                  </button>
                  <Link href="/jobs"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95 whitespace-nowrap"
                    style={{ background: "#b91c1c", boxShadow: "0 4px 12px rgba(185,28,28,0.2)" }}>
                    Apply
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
