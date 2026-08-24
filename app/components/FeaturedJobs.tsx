"use client";

import React, { useState } from "react";
import { Bookmark, ArrowUpRight, MapPin } from "lucide-react";
import { useReveal } from "../hooks/useReveal";

const BrandLogos: Record<string, React.ReactNode> = {
  Glints: (
    <div className="w-10 h-10 rounded-2xl bg-[#EEF3FF] flex items-center justify-center">
      <span className="text-[#0052CC] text-base font-black">✦</span>
    </div>
  ),
  Apple: (
    <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center">
      <svg className="w-5 h-5 fill-white" viewBox="0 0 170 170">
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.82.13-9.68-1.95-14.58-6.23-3.25-2.77-7.14-7.42-11.67-13.97-6.52-9.42-11.66-19.7-15.42-30.85-3.76-11.15-5.64-21.84-5.64-32.07 0-14.16 3.52-25.75 10.56-34.78 7.04-9.03 15.93-13.62 26.67-13.78 4.82 0 10.12 1.25 15.9 3.75 5.78 2.5 9.77 3.75 11.97 3.75 1.8 0 5.86-1.31 12.18-3.93 6.32-2.62 11.45-3.83 15.4-3.63 11.46.7 20.8 4.79 28.02 12.27-10.3 6.25-15.3 14.99-15 26.22.31 8.89 3.74 16.29 10.29 22.2 6.55 5.91 14.3 9.3 23.25 10.17-2.3 6.78-5.4 13.97-9.3 21.57zM119.22 31.87c0-6.72 2.42-13.11 7.26-18.17 4.84-5.06 10.87-8.08 18.09-9.06.13.9.19 1.77.19 2.62 0 6.64-2.52 13.06-7.56 18.26-5.04 5.2-11.13 8.21-18.27 9.03-.06-.88-.1-1.77-.1-2.68z" />
      </svg>
    </div>
  ),
  BMW: (
    <div className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center">
      <span className="font-black text-[9px] tracking-tighter text-slate-900">BMW</span>
    </div>
  ),
  IBM: (
    <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] flex items-center justify-center">
      <span className="font-black text-[#006699] text-xs tracking-wider">IBM</span>
    </div>
  ),
  Google: (
    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center">
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
      </svg>
    </div>
  ),
  Paypal: (
    <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] flex items-center justify-center">
      <svg className="w-5 h-5 fill-[#003087]" viewBox="0 0 24 24">
        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .761-.645h6.634c2.475 0 4.382.527 5.474 1.527 1.026.94 1.408 2.296 1.103 3.924-.038.204-.085.408-.142.612-.862 3.109-3.033 4.971-6.175 4.971H9.86a.64.64 0 0 0-.633.537l-.95 6.033a.64.64 0 0 1-.633.537h-.568z" />
      </svg>
    </div>
  ),
};

const jobsData = [
  { id: "1", company: "Glints",  title: "UI/UX Designer",     workModel: "Onsite", type: "Full-time", salary: "$3,000/mo", location: "Jakarta, ID",   category: "Full Time" },
  { id: "2", company: "Apple",   title: "Product Designer",   workModel: "Onsite", type: "Part-time", salary: "$25/hr",    location: "Batam, ID",    category: "Part Time" },
  { id: "3", company: "BMW",     title: "Web Designer",       workModel: "Onsite", type: "Full-time", salary: "$1,500/mo", location: "Medan, ID",    category: "Full Time" },
  { id: "4", company: "IBM",     title: "Data Analyst",       workModel: "Remote", type: "Part-time", salary: "$40/hr",    location: "Bali, ID",     category: "Part Time" },
  { id: "5", company: "Google",  title: "Graphic Designer",   workModel: "Hybrid", type: "Full-time", salary: "$1,400/mo", location: "Surabaya, ID", category: "Full Time" },
  { id: "6", company: "Paypal",  title: "Software Engineer",  workModel: "Remote", type: "Part-time", salary: "$80/hr",    location: "Remote, US",   category: "Part Time" },
];

const filterTabs = ["All Jobs", "Full Time", "Remote", "Part Time", "Contract"];

export default function FeaturedJobs() {
  const [activeTab, setActiveTab] = useState("All Jobs");
  const [savedJobs, setSavedJobs] = useState<string[]>(["2"]);
  const headingRef = useReveal() as React.RefObject<HTMLDivElement>;
  const gridRef    = useReveal({ threshold: 0.06 }) as React.RefObject<HTMLDivElement>;

  const toggleBookmark = (id: string) =>
    setSavedJobs((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  const filteredJobs = activeTab === "All Jobs" ? jobsData
    : jobsData.filter((job) =>
        activeTab === "Full Time" ? job.type === "Full-time"
        : activeTab === "Part Time" ? job.type === "Part-time"
        : activeTab === "Remote" ? job.workModel === "Remote"
        : true
      );

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-100">
      <div className="max-w-5xl mx-auto">

        <div ref={headingRef} className="reveal flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-manrope tracking-tight">Featured Job Offers</h2>
            <p className="text-sm text-slate-500 mt-1 font-inter">Know your worth and find the job that qualifies your life.</p>
          </div>
          <button type="button" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b91c1c] hover:underline shrink-0 self-start md:self-auto">
            View All Jobs <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
          {filterTabs.map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)}
              className="px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all duration-200"
              style={{
                background: activeTab === tab ? "#0f172a" : "#f1f5f9",
                color: activeTab === tab ? "#fff" : "#64748b",
                boxShadow: activeTab === tab ? "0 4px 12px rgba(15,23,42,0.18)" : "none",
                transform: activeTab === tab ? "scale(1.03)" : "scale(1)",
              }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div ref={gridRef} className="reveal-stagger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => {
            const isBookmarked = savedJobs.includes(job.id);
            return (
              <div key={job.id}
                className="bg-white border border-slate-100 rounded-3xl p-4 flex flex-col gap-3 cursor-pointer"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease" }}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.transform = "translateY(-4px)"; el.style.boxShadow = "0 12px 32px rgba(0,0,0,0.1)"; }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"; }}
              >
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    {BrandLogos[job.company]}
                    <button type="button" onClick={() => toggleBookmark(job.id)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                      style={{ background: isBookmarked ? "#dc2626" : "#fff", color: isBookmarked ? "#fff" : "#94a3b8", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-slate-400 font-inter mb-0.5">{job.company}</p>
                  <h3 className="text-base font-bold text-slate-900 font-manrope mb-3">{job.title}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {[job.workModel, job.type].map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-xl text-[11px] font-semibold bg-white border border-slate-200 text-slate-600 font-inter">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between px-1">
                  <div>
                    <p className="font-extrabold text-slate-900 text-sm font-manrope">{job.salary}</p>
                    <p className="text-[11px] text-slate-400 font-inter flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />{job.location}
                    </p>
                  </div>
                  <button type="button"
                    className="px-4 py-1.5 rounded-xl text-xs font-bold border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all duration-200 cursor-pointer">
                    Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
