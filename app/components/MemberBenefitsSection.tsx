"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BENEFIT_CARDS } from "@/lib/stellaContent";
import { useAuth } from "@/app/components/AuthProvider";

const CARD_IMAGES = [
  "/assets/why/1.png",
  "/assets/why/2.png",
  "/assets/why/3.png",
  "/assets/why/4.png",
  "/assets/why/5.png",
] as const;

const CARD_BLURBS = [
  "Build a professional profile that shows your experience, skills and career goals.",
  "Learn from industry experts about resumes, interviews and building your career.",
  "Build practical skills with courses that support your next career step.",
  "Discover industry events, meet professionals and connect with employers.",
  "Get qualifications and work experience verified with clear status updates.",
] as const;

const CARD_BUTTONS = [
  "Build my free profile",
  "Explore masterclasses",
  "Explore courses",
  "Find events",
  "See how it works",
] as const;

export default function MemberBenefitsSection() {
  const { user } = useAuth();

  const profileHref =
    user?.role === "user"
      ? "/profile/setup"
      : "/register?role=user&next=/profile/setup";

  // Duplicate cards for seamless infinite animation
  const scrollingCards = [...BENEFIT_CARDS, ...BENEFIT_CARDS];

  return (
    <section id="benefits" className="benefits-section relative overflow-hidden bg-white py-7 sm:py-8 lg:py-9">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[430px_minmax(0,1fr)] xl:gap-14">
          {/* LEFT SIDE */}
          <div className="relative z-20 max-w-[440px]">
            <h2 className="text-[2.8rem] font-bold leading-[0.98] tracking-[-0.045em] text-[#06143b] sm:text-[3.3rem] lg:text-[3.55rem] xl:text-[4rem]">
              More than
              <br />a job search.
            </h2>

            <p className="mt-6 max-w-[390px] text-[16px] font-medium leading-[1.55] text-[#667085] sm:text-[17px]">
              Gemini Jobs gives you the tools, support and opportunities to
              build a brighter future.
            </p>

            <Link
              href={profileHref}
              className="benefits-primary-cta group mt-8 inline-flex min-h-[58px] w-full max-w-[390px] items-center justify-center gap-3 rounded-[14px] bg-[#246BFD] px-7 text-[15px] font-semibold text-white shadow-[0_16px_40px_rgba(36,107,253,0.20)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#1758df] hover:shadow-[0_20px_50px_rgba(36,107,253,0.28)] sm:text-[16px]"
            >
              Create Your Free Profile
              <ArrowRight
                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                strokeWidth={2.3}
              />
            </Link>
          </div>

          {/* RIGHT SIDE AUTO SCROLL */}
          <div className="relative min-w-0 overflow-hidden">
            {/* Soft fade left */}
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 hidden w-16 bg-gradient-to-r from-white to-transparent lg:block"
            />

            {/* Soft fade right */}
            {/* <div
              aria-hidden
              className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-16 bg-gradient-to-l from-white to-transparent sm:w-24"
            /> */}

            <div className="benefits-marquee overflow-hidden py-3">
              <div className="benefits-marquee-track flex w-max gap-4 sm:gap-5">
                {scrollingCards.map((card, index) => {
                  const originalIndex = index % BENEFIT_CARDS.length;

                  const href =
                    card.id === "free-profile" ? profileHref : card.href;

                  const isBlue = originalIndex % 2 === 0;

                  return (
                    <article
                      key={`${card.id}-${index}`}
                      className={`benefit-card group relative h-[440px] w-[265px] shrink-0 overflow-hidden rounded-[24px] sm:h-[470px] sm:w-[285px] lg:h-[500px] lg:w-[300px] ${
                        isBlue ? "benefit-card--blue" : "benefit-card--green"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={CARD_IMAGES[originalIndex]}
                        alt=""
                        className="benefit-card-img absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />

                      {/* dark gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/5" />

                      {/* subtle tint */}
                      <div
                        className={`absolute inset-0 ${
                          isBlue ? "bg-[#3459ff]/10" : "bg-[#a7d94a]/10"
                        }`}
                      />

                      <div className="relative z-10 flex h-full flex-col p-5 sm:p-6">
                        <div className="mt-auto">
                          <h3 className="text-[1.08rem] font-bold leading-snug text-white sm:text-[1.18rem]">
                            {card.title}
                          </h3>

                          <p className="mt-2 text-[13px] leading-[1.6] text-white/80 sm:text-[13.5px]">
                            {CARD_BLURBS[originalIndex]}
                          </p>

                          <Link
                            href={href}
                            className={`mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[12px] font-semibold transition-all duration-300 sm:text-[13px] ${
                              isBlue
                                ? "bg-[#4f6cf5] text-white hover:bg-[#617bff]"
                                : "bg-[#c8f066] text-[#0f172a] hover:bg-[#d6fa7e]"
                            }`}
                          >
                            {CARD_BUTTONS[originalIndex]}

                            <span
                              className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${
                                isBlue ? "bg-white/20" : "bg-black/10"
                              }`}
                            >
                              <ArrowRight
                                className="h-3 w-3"
                                strokeWidth={2.5}
                              />
                            </span>
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .benefits-marquee-track {
          animation: benefits-scroll 32s linear infinite;
          will-change: transform;
        }

        .benefits-marquee:hover .benefits-marquee-track {
          animation-play-state: paused;
        }

        @keyframes benefits-scroll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .benefits-marquee-track {
            animation: none;
          }
        }

        @media (max-width: 1023px) {
          .benefits-marquee {
            overflow-x: auto;
            scrollbar-width: none;
          }

          .benefits-marquee::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
