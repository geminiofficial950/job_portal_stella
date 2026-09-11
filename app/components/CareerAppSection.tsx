"use client";

import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Search,
  BriefcaseBusiness,
  UserRound,
} from "lucide-react";
import { useState } from "react";

const TESTIMONIALS = [
  {
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    quote:
      "Gemini Jobs made it so easy to find opportunities that match my skills. The support from the team has been amazing!",
    name: "James T.",
    role: "Administration Officer, NSW",
  },
  {
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
    quote:
      "I found the right opportunity much faster than I expected. Gemini Jobs made the whole job search process simple.",
    name: "Sarah M.",
    role: "Customer Service Officer, VIC",
  },
  {
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    quote:
      "From creating my profile to applying for jobs, everything felt smooth and straightforward.",
    name: "Daniel K.",
    role: "Support Worker, QLD",
  },
];

const APP_FEATURES = [
  "Search and apply on the go",
  "Get job alerts",
  "Build and manage your profile",
  "Access career resources",
];

export default function CareerAppSection() {
  const [activeSlide, setActiveSlide] = useState(0);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const previousSlide = () => {
    setActiveSlide(
      (prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length,
    );
  };

  const testimonial = TESTIMONIALS[activeSlide];

  return (
    <section className="career-app-section w-full bg-white py-6 sm:py-7 lg:py-8">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* LEFT TESTIMONIAL */}
          <div className="relative h-[390px] overflow-hidden rounded-[22px] sm:h-[410px] lg:h-[360px] xl:h-[380px]">
            <Image
              src={testimonial.image}
              alt={testimonial.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/10" />

            {/* Quote Card */}
            <div
              className="
            absolute
            bottom-5 left-5 right-5
            rounded-[18px]
            bg-[#1267B2]/95
            p-5
            text-white

            sm:bottom-auto
            sm:left-auto
            sm:right-5
            sm:top-1/2
            sm:w-[47%]
            sm:-translate-y-1/2

            lg:right-5
            lg:w-[48%]
            lg:p-5

            xl:right-6
            xl:w-[46%]
          "
            >
              <p className="text-[14px] font-medium leading-[1.6] lg:text-[13px] xl:text-[14px]">
                “{testimonial.quote}”
              </p>

              <div className="mt-4">
                <h4 className="text-[15px] font-semibold">
                  {testimonial.name}
                </h4>

                <p className="mt-1 text-[11px] text-white/80">
                  {testimonial.role}
                </p>
              </div>
            </div>

            {/* Slider Controls */}
            <div className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 items-center gap-3 sm:flex">
              <button
                type="button"
                onClick={previousSlide}
                aria-label="Previous testimonial"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 transition hover:scale-105"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex items-center gap-1.5">
                {TESTIMONIALS.map((_, index) => (
                  <button
                    type="button"
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    aria-label={`Go to testimonial ${index + 1}`}
                    className={`rounded-full transition-all duration-300 ${
                      activeSlide === index
                        ? "h-2 w-5 bg-[#1976D2]"
                        : "h-2 w-2 bg-white/75"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next testimonial"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 transition hover:scale-105"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* RIGHT APP PROMO */}
          <div
            className="
          relative
          h-[510px]
          overflow-hidden
          rounded-[22px]
          bg-gradient-to-br
          from-[#f6eaff]
          via-[#eee8ff]
          to-[#dce4ff]

          sm:h-[500px]
          lg:h-[360px]
          xl:h-[380px]
        "
          >
            {/* very subtle background */}
            <div className="pointer-events-none absolute -left-16 -top-20 h-[200px] w-[200px] rounded-full bg-[#f2a8ff]/10 blur-3xl" />

            <div className="relative z-10 grid h-full grid-cols-1 lg:grid-cols-[46%_54%]">
              {/* LEFT CONTENT */}
              <div
                className="
              relative z-20
              flex flex-col
              justify-center
              p-6

              sm:p-8

              lg:p-6

              xl:p-7
            "
              >
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#6758d9] xl:text-[10px]">
                  Gemini Jobs
                </p>

                <h2
                  className="
                mt-2
                max-w-[300px]
                text-[30px]
                font-bold
                leading-[1.04]
                tracking-[-0.045em]
                text-[#17172b]

                sm:text-[34px]

                lg:text-[25px]

                xl:text-[28px]
              "
                >
                  Take your career further with the Gemini Jobs app
                </h2>

                {/* FEATURES */}
                <div className="mt-5 space-y-2.5 lg:mt-4 lg:space-y-2">
                  {APP_FEATURES.map((feature) => (
                    <div key={feature} className="flex items-center gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#c9ddff] text-[#1769d2]">
                        <Check size={11} strokeWidth={3} />
                      </span>

                      <span className="text-[13px] font-medium text-[#34344a] lg:text-[10px] xl:text-[11px]">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* QR + STORES */}
                <div className="mt-5 flex items-center gap-2.5 lg:mt-4">
                  {/* QR */}
                  <div className="hidden h-[58px] w-[58px] shrink-0 rounded-[8px] bg-white p-2 sm:block lg:h-[52px] lg:w-[52px]">
                    <div className="grid h-full w-full grid-cols-5 gap-[2px]">
                      {Array.from({ length: 25 }).map((_, index) => (
                        <span
                          key={index}
                          className={
                            [
                              0, 1, 2, 4, 5, 8, 10, 12, 13, 14, 16, 18, 20, 21,
                              22, 24,
                            ].includes(index)
                              ? "bg-black"
                              : "bg-transparent"
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      className="
                    flex h-[31px] min-w-[112px]
                    items-center
                    rounded-[6px]
                    bg-black
                    px-3
                    text-left
                    text-white
                    transition
                    hover:scale-[1.02]
                  "
                    >
                      <div>
                        <p className="text-[6px] leading-none">
                          Download on the
                        </p>

                        <p className="mt-1 text-[11px] font-semibold leading-none">
                          App Store
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="
                    flex h-[31px] min-w-[112px]
                    items-center
                    rounded-[6px]
                    bg-black
                    px-3
                    text-left
                    text-white
                    transition
                    hover:scale-[1.02]
                  "
                    >
                      <div>
                        <p className="text-[6px] leading-none">GET IT ON</p>

                        <p className="mt-1 text-[11px] font-semibold leading-none">
                          Google Play
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* DESKTOP PHONES */}
              <div className="relative hidden h-full lg:block">
                {/* MAIN PHONE */}
                <div
                  className="
                absolute
                bottom-[-78px]
                left-[4%]
                w-[49%]
                rotate-[-2deg]

                xl:bottom-[-88px]
                xl:left-[5%]
                xl:w-[50%]
              "
                >
                  <PhoneMockup type="jobs" />
                </div>

                {/* SECOND PHONE */}
                <div
                  className="
                absolute
                bottom-[-90px]
                right-[-2%]
                w-[46%]
                rotate-[4deg]

                xl:bottom-[-100px]
                xl:right-[-1%]
                xl:w-[47%]
              "
                >
                  <PhoneMockup type="profile" />
                </div>
              </div>

              {/* MOBILE */}
              <div className="relative h-[250px] overflow-hidden lg:hidden">
                <div className="absolute bottom-[-100px] left-[20%] w-[42%] rotate-[-3deg] sm:left-[27%] sm:w-[32%]">
                  <PhoneMockup type="jobs" />
                </div>

                <div className="absolute bottom-[-115px] right-[12%] w-[39%] rotate-[5deg] sm:right-[22%] sm:w-[30%]">
                  <PhoneMockup type="profile" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PhoneMockup({ type }: { type: "jobs" | "profile" }) {
  return (
    <div
      className="
        relative
        aspect-[0.52/1]
        w-full
        rounded-[28px]
        border-[5px]
        border-[#16161c]
        bg-white
        p-1.5
        shadow-[0_24px_50px_rgba(37,35,70,0.2)]
      "
    >
      {/* Notch */}
      <div className="absolute left-1/2 top-1.5 z-20 h-[15px] w-[36%] -translate-x-1/2 rounded-full bg-[#16161c]" />

      <div className="h-full overflow-hidden rounded-[21px] bg-[#faf9ff]">
        {type === "jobs" ? (
          <div className="p-3 pt-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-[7px] font-bold text-[#6959de]">
                ✦ Gemini Jobs
              </span>

              <UserRound size={11} />
            </div>

            <h3 className="mt-4 text-[12px] font-bold text-[#242433]">
              Hi, Sarah
            </h3>

            <p className="mt-1 text-[6px] leading-[1.4] text-slate-500">
              Your next opportunity
              <br />
              is closer than you think.
            </p>

            {/* Search */}
            <div className="mt-3 flex h-7 items-center gap-1.5 rounded-md bg-white px-2 shadow-sm">
              <Search size={9} className="text-slate-400" />

              <span className="text-[6px] text-slate-400">Search jobs...</span>
            </div>

            <p className="mt-3 text-[7px] font-bold">Recommended for you</p>

            <JobRow title="Aged Care Worker" />
            <JobRow title="Administration Officer" />
            <JobRow title="Support Worker" />
            <JobRow title="Customer Service Officer" />
          </div>
        ) : (
          <div className="flex h-full flex-col items-center bg-gradient-to-b from-[#f7e9ff] to-white pt-9 text-center">
            {/* Person avatar */}
            <div className="relative h-20 w-20 overflow-hidden rounded-full bg-[#ded4ff]">
              <div className="absolute inset-x-4 bottom-0 h-14 rounded-t-full bg-[#1c2b50]" />

              <div className="absolute left-1/2 top-3 h-10 w-10 -translate-x-1/2 rounded-full bg-[#e7b08f]" />

              <div className="absolute left-1/2 top-1.5 h-6 w-11 -translate-x-1/2 rounded-t-full bg-[#32241f]" />
            </div>

            <div className="mt-auto w-full rounded-t-[22px] bg-white px-3 pb-5 pt-5">
              <h4 className="text-[14px] font-bold leading-[1.1] text-[#292940]">
                Build
                <br />
                Grow
                <br />
                Succeed
              </h4>

              <button
                type="button"
                className="mt-4 w-full rounded-md bg-[#2469f4] py-2 text-[7px] font-semibold text-white"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function JobRow({ title }: { title: string }) {
  return (
    <div className="mt-2 flex items-center gap-1.5 border-b border-slate-100 pb-2">
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#edf1ff]">
        <BriefcaseBusiness size={8} className="text-[#6959de]" />
      </div>

      <div className="min-w-0">
        <p className="truncate text-[6px] font-semibold text-[#333344]">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[4.5px] text-slate-400">
          Gemini Jobs • Melbourne, VIC
        </p>
      </div>
    </div>
  );
}
