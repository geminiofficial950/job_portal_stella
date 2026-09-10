"use client";

const PLATFORMS = [
  {
    name: "SEEK",
    logo: "/logos/seek.png",
    width: 122,
  },
  {
    name: "Indeed",
    logo: "/logos/indeed.svg",
    width: 108,
  },
  {
    name: "LinkedIn",
    logo: "/logos/linkedin.svg",
    width: 118,
  },
  {
    name: "Jora",
    logo: "/logos/jora.svg",
    width: 88,
  },
  {
    name: "gov.au",
    logo: "/logos/gov-au.png",
    width: 130,
  },
  {
    name: "Australian JobSearch",
    logo: "/logos/australian-jobsearch.svg",
    width: 128,
  },
] as const;

export default function TrustedJobPlatforms() {
  return (
    <section className="trusted-platforms w-full">
      <div className="trusted-platforms-inner mx-auto max-w-[1450px] px-5 pb-5 pt-0 sm:px-8 sm:pb-6 lg:px-12 lg:pb-7">
        <p className="trusted-platforms-eyebrow mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-black sm:mb-3.5 sm:text-[11px] sm:tracking-[0.22em]">
          Jobs from top employers and leading platforms, all in one place
        </p>

        <div className="trusted-platforms-row flex flex-wrap items-center justify-center gap-x-8 gap-y-6 sm:gap-x-10 md:flex-nowrap md:justify-between md:gap-x-5 lg:gap-x-9 xl:gap-x-12">
          {PLATFORMS.map((platform) => (
            <div
              key={platform.name}
              className="trusted-platforms-logo flex h-11 shrink-0 items-center justify-center sm:h-12"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={platform.logo}
                alt={platform.name}
                width={platform.width}
                height={40}
                className="h-8 w-auto max-w-[140px] object-contain object-center sm:h-9"
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
