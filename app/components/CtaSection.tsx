"use client";

import React from "react";
import { Users, Phone, Clock, ArrowRight } from "lucide-react";

export default function CtaSection() {
  return (
    <section id="cta" className="cta-section bg-[#051833] py-16 sm:py-20 lg:py-24">
      <div className="relative mx-auto flex min-h-[280px] max-w-7xl items-center overflow-hidden px-4 sm:min-h-[300px] sm:px-8 lg:min-h-[340px] lg:px-10">
        {/* Left decorative rings */}
        <div
          className="pointer-events-none absolute left-2 top-1/2 flex h-32 w-32 -translate-y-1/2 items-center justify-center sm:left-4 sm:h-36 sm:w-36 lg:left-0 lg:h-44 lg:w-44"
          aria-hidden="true"
        >
          <div className="absolute inset-0 rounded-full border border-dashed border-slate-500/40" />
          <div className="absolute inset-4 rounded-full border border-dashed border-slate-500/30" />
          <div className="absolute inset-8 rounded-full border border-dashed border-slate-500/20" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#0a2040] text-sky-300 sm:h-14 sm:w-14">
            <Users className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
          </div>
        </div>

        {/* Right decorative phone */}
        <div
          className="pointer-events-none absolute right-2 top-1/2 flex h-32 w-32 -translate-y-1/2 items-center justify-center sm:right-4 sm:h-36 sm:w-36 lg:right-0 lg:h-44 lg:w-44"
          aria-hidden="true"
        >
          <div className="absolute inset-0 rounded-full border border-slate-600/50" />
          <div className="absolute inset-6 rounded-full border border-slate-600/35" />
          <Phone className="relative h-12 w-12 text-slate-600/70 sm:h-14 sm:w-14" strokeWidth={1.2} />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-2xl px-8 text-center sm:px-12 lg:px-16">
          <h2 className="cta-title text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-[2rem]">
            Whichever side you are on, someone picks up.
          </h2>
          <p className="cta-section-copy mx-auto mt-4 max-w-xl text-sm leading-relaxed sm:text-base">
            Post a role, build a profile, or just ring and ask. The first conversation costs
            nothing.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a href="#" className="cta-btn cta-btn-primary">
              Post a job
              <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
            </a>
            <a href="#" className="cta-btn cta-btn-ghost">
              Create your profile
            </a>
          </div>

          <div className="cta-section-meta mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <span className="inline-flex items-center gap-2">
              <Phone className="h-3.5 w-3.5" strokeWidth={2.2} />
              1300 000 000
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" strokeWidth={2.2} />
              7:00 to 21:00 AEST
            </span>
            <span className="inline-flex items-center gap-2">
              <Users className="h-3.5 w-3.5" strokeWidth={2.2} />
              Interpreters available
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
