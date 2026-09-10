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

/** H04 + H06–H10 — five benefits immediately below hero */
export default function MemberBenefitsSection() {
  const { user } = useAuth();
  const profileHref =
    user?.role === "user"
      ? "/profile/setup"
      : "/register?role=user&next=/profile/setup";

  return (
    <section
      id="benefits"
      className="benefits-section relative overflow-hidden bg-white pb-6 pt-14 sm:pb-8 sm:pt-16 lg:pb-10 lg:pt-20"
    >
      <div className="relative mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div
          data-home-animate
          className="benefits-header mx-auto mb-12 w-full max-w-3xl sm:mb-14"
        >
          <h2 className="benefits-display-title mx-auto text-center text-[2.35rem] font-bold leading-[1.05] tracking-[-0.03em] text-black sm:text-5xl lg:text-[3.75rem]">
            Five ways
            <br />
            Stella supports you.
          </h2>
          <p className="benefits-intro mx-auto mt-6 max-w-xl text-center text-[15px] font-normal leading-relaxed text-[#666666] sm:mt-7 sm:text-lg sm:leading-relaxed">
            Stella Careers gives you a complete career experience that helps you
            build your profile, gain real skills and take the next step with
            employers.
          </p>
        </div>

        <div
          data-home-stagger
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4 xl:gap-5"
        >
          {BENEFIT_CARDS.map((card, i) => {
            const href =
              card.id === "free-profile" ? profileHref : card.href;
            const isBlue = i % 2 === 0;

            return (
              <article
                key={card.id}
                className={`benefit-card group relative flex min-h-[380px] flex-col overflow-hidden rounded-[22px] sm:min-h-[420px] lg:min-h-[460px] xl:min-h-[500px] ${
                  isBlue ? "benefit-card--blue" : "benefit-card--green"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={CARD_IMAGES[i]}
                  alt=""
                  className="benefit-card-img absolute inset-0 h-full w-full object-cover"
                />
                <div aria-hidden className="benefit-card-shade absolute inset-0" />
                <div aria-hidden className="benefit-card-tint absolute inset-0" />
                <div aria-hidden className="benefit-card-shine" />

                <div className="relative z-10 flex h-full flex-col p-4 text-left sm:p-5">
                  <div className="benefit-card-copy mt-auto flex w-full flex-col items-start text-left">
                    <h3 className="benefit-card-title min-h-[2.6em] w-full text-left text-[1.05rem] font-bold leading-snug text-white sm:text-[1.1rem]">
                      {card.title}
                    </h3>
                    <p className="benefit-card-desc mt-1.5 min-h-[3.9em] w-full text-left text-[13px] leading-relaxed text-white/85">
                      {CARD_BLURBS[i]}
                    </p>

                    <Link
                      href={href}
                      className={`benefit-card-cta mt-4 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-left text-[12px] font-semibold sm:text-[13px] ${
                        isBlue
                          ? "benefit-card-cta--blue bg-[#4f6cf5] text-white"
                          : "benefit-card-cta--green bg-[#c8f066] text-[#0f172a]"
                      }`}
                    >
                      {CARD_BUTTONS[i]}
                      <span
                        className={`benefit-card-cta-icon inline-flex h-5 w-5 items-center justify-center rounded-full ${
                          isBlue ? "bg-white/20" : "bg-black/10"
                        }`}
                      >
                        <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
