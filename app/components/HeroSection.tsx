"use client";

import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { useAuth } from "@/app/components/AuthProvider";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["italic", "normal"],
  display: "swap",
});

/** H02–H03 hero — checklist copy; job search lives after benefits (H05) */
export default function HeroSection() {
  const { user } = useAuth();

  const primaryHref =
    user?.role === "user"
      ? "/profile/setup"
      : "/register?role=user&next=/profile/setup";

  return (
    <section className="hero-section relative w-full overflow-hidden bg-[#005682] text-white">
      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-6 px-5 sm:gap-8 sm:px-8 lg:grid-cols-2 lg:items-start lg:gap-0 lg:px-10">
        <div className="hero-copy relative z-10 flex w-full flex-col items-center pt-8 pb-2 text-center sm:py-10 lg:items-start lg:pt-14 lg:pb-12 lg:pr-8 lg:text-left">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#eddcb1] sm:text-xs">
            Career support for Australia
          </p>

          <h1 className="hero-title mb-3 max-w-xl text-[1.75rem] font-bold leading-[1.12] tracking-tight text-white sm:mb-4 sm:text-5xl lg:text-[3.35rem]">
            Build your profile. Grow your skills. Get{" "}
            <span
              className={`${playfair.className} font-normal italic text-[#eddcb1]`}
            >
              noticed
            </span>
            .
          </h1>

          <p className="mb-6 max-w-lg text-[14px] leading-relaxed text-sky-100/95 sm:text-base">
            Create your free profile, learn from industry experts, access
            professional development and career events, and get your
            qualifications and work experience checked for employers.
          </p>

          <div className="flex w-full max-w-sm flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center lg:justify-start">
            <Link
              href={primaryHref}
              className="hero-primary-cta inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-[15px] font-bold shadow-[0_12px_30px_rgba(0,0,0,0.25)] hover:bg-white/95 sm:px-6 sm:py-3.5 sm:text-base"
            >
              Build my free profile
            </Link>
            <a
              href="#benefits"
              className="hero-secondary-cta inline-flex items-center justify-center rounded-xl border border-white/45 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Explore member benefits
            </a>
          </div>

          <Link
            href="/employers"
            className="mt-4 inline-block text-sm font-medium text-[#eddcb1] underline underline-offset-4"
          >
            Hiring? Find verified candidates
          </Link>
        </div>

        <div className="relative flex w-full justify-center pb-0 sm:mt-0 lg:justify-end lg:self-end lg:pb-0">
          <div className="relative leading-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/homebanner.png"
              alt="Adult professional building their career in Australia"
              className="mx-auto block h-[200px] w-auto max-w-[min(100%,260px)] object-contain object-bottom sm:h-[400px] sm:max-w-full lg:h-[440px] lg:max-w-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
