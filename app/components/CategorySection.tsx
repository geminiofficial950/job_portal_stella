"use client";

import React from "react";
import Link from "next/link";
import {
  Megaphone, Code2, Palette, UserSearch,
  ShieldCheck, Briefcase, Users, Coins,
  ChevronRight, ArrowUpRight,
} from "lucide-react";
import { useReveal } from "../hooks/useReveal";

const categories = [
  { id: "marketing",   title: "Marketing",        jobs: "58 jobs",  icon: Megaphone   },
  { id: "development", title: "Development",       jobs: "48 jobs",  icon: Code2       },
  { id: "uiux",        title: "UI/UX Design",      jobs: "78 jobs",  icon: Palette     },
  { id: "hr",          title: "Human Resources",   jobs: "120 jobs", icon: UserSearch  },
  { id: "security",    title: "Security",          jobs: "90 jobs",  icon: ShieldCheck },
  { id: "business",    title: "Business",          jobs: "31 jobs",  icon: Briefcase   },
  { id: "management",  title: "Management",        jobs: "52 jobs",  icon: Users       },
  { id: "finance",     title: "Finance",           jobs: "80 jobs",  icon: Coins       },
];

export default function CategorySection() {
  const headingRef = useReveal() as React.RefObject<HTMLDivElement>;
  const gridRef    = useReveal({ threshold: 0.08 }) as React.RefObject<HTMLDivElement>;

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8"
      style={{ background: "#fffafa" }}>
      <div className="max-w-5xl mx-auto">

        <div ref={headingRef} className="reveal flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#b91c1c] font-manrope tracking-tight">
              One platform, Many Solutions
            </h2>
            <p className="text-sm text-slate-500 mt-1 font-inter">
              Explore opportunities across every industry and discipline.
            </p>
          </div>
          <Link href="/jobs" className="inline-flex items-center gap-1 text-xs font-bold text-[#b91c1c] hover:text-[#b91c1c] transition-colors shrink-0">
            See All Categories <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div ref={gridRef} className="reveal-stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button key={cat.id} type="button"
                className="group flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl bg-white border border-slate-200 hover:bg-[#b91c1c] hover:text-white hover:border-[#b91c1c] hover:shadow-lg cursor-pointer text-left"
                style={{
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}>
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-white/15 flex items-center justify-center shrink-0 transition-colors duration-200">
                    <Icon className="w-4 h-4 text-[#b91c1c] group-hover:text-white transition-colors duration-200" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-sm text-[#b91c1c] group-hover:text-white font-manrope truncate leading-snug transition-colors duration-200">{cat.title}</p>
                    <p className="text-[11px] text-slate-500 group-hover:text-slate-200 font-inter truncate transition-colors duration-200">{cat.jobs}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0 text-slate-300 group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
