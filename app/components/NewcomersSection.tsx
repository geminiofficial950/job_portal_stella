"use client";

import React from "react";
import {
  GraduationCap,
  IdCard,
  ShieldCheck,
  Briefcase,
  ArrowRight,
} from "lucide-react";

const TOPIC_CARDS = [
  {
    title: "Does my degree count?",
    desc: "How overseas qualifications are assessed against the Australian framework.",
    Icon: GraduationCap,
  },
  {
    title: "Work rights by visa",
    desc: "Hour limits, conditions, and what changes when your visa does.",
    Icon: IdCard,
  },
  {
    title: "Checks and clearances",
    desc: "Police check, NDIS screening, working with children. Which one, and when.",
    Icon: ShieldCheck,
  },
  {
    title: "Your first Australian job",
    desc: "Pay rates, award basics, and the questions employers cannot legally ask.",
    Icon: Briefcase,
  },
] as const;

export default function NewcomersSection() {
  return (
    <section id="newcomers" className="newcomers-section bg-white pt-10 pb-16 sm:pt-12 sm:pb-20 lg:pt-14 lg:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-10">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_24px_rgba(15,39,68,0.04)] lg:grid lg:grid-cols-[minmax(0,0.92fr)_1.08fr] lg:items-stretch">
          {/* Left */}
          <div className="flex flex-col justify-center border-b border-slate-200 p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2563eb]">
              New to Australia
            </p>
            <h2 className="newcomers-title mt-3 text-[1.75rem] font-bold leading-[1.12] tracking-tight text-[#0f2744] sm:text-[2rem] lg:text-[2.15rem]">
              Nobody should have to guess how this country works.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
              If you arrived recently, the hardest part is not the job. It is knowing which of
              your qualifications count, what an employer is allowed to ask, and which check to
              get first. That information is free here, whether you ever apply for a role or not.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#cta" className="newcomers-btn newcomers-btn-primary">
                Book a free consult
                <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
              </a>
              <a href="#demand" className="newcomers-btn newcomers-btn-ghost">
                See what is in demand
              </a>
            </div>
          </div>

          {/* Right — 2×2 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2">
            {TOPIC_CARDS.map(({ title, desc, Icon }, index) => {
              const cellBorder = [
                "border-b border-slate-100 sm:border-r",
                "border-b border-slate-100",
                "border-b border-slate-100 sm:border-r sm:border-b-0",
                "sm:border-b-0",
              ][index];

              return (
              <a
                key={title}
                href="#cta"
                className={`newcomers-card group flex h-full items-start gap-3 p-5 transition-colors hover:bg-slate-50 sm:p-6 ${cellBorder}`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[#2563eb]">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold leading-snug text-[#0f2744] sm:text-[15px]">
                    {title}
                  </span>
                  <span className="mt-1.5 block text-xs leading-relaxed text-slate-600 sm:text-[13px]">
                    {desc}
                  </span>
                </span>
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-colors group-hover:border-[#2563eb] group-hover:text-[#2563eb]">
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
                </span>
              </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
