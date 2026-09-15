"use client";

const PLATFORMS = [
  {
    name: "SEEK",
    logo: "/logos/seek.svg",
    width: 118,
  },
  {
    name: "Indeed",
    logo: "/logos/indeed.svg",
    width: 100,
  },
  {
    name: "LinkedIn",
    logo: "/logos/linkedin.svg",
    width: 100,
  },
  {
    name: "Jora",
    logo: "/logos/jora.svg",
    width: 130,
  },
  {
    name: "gov.au",
    logo: "/logos/gov-au.svg",
    width: 110,
  },
  {
    name: "Australian JobSearch",
    logo: "/logos/australian-jobsearch.svg",
    width: 140,
  },
] as const;

export default function TrustedJobPlatforms() {
  return (
    <section className="trusted-platforms w-full">
      <div className="trusted-platforms-inner w-full px-5 pb-5 pt-0 sm:px-8 sm:pb-6 lg:px-12 lg:pb-7">
        <p className="trusted-platforms-eyebrow mb-5 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-black sm:mb-6 sm:text-[11px] sm:tracking-[0.22em]">
          Jobs from top employers and leading platforms, all in one place
        </p>

        <div className="trusted-platforms-row flex flex-wrap items-center justify-center gap-x-5 gap-y-4 sm:gap-x-6 md:flex-nowrap md:gap-x-7 lg:gap-x-8">
          {PLATFORMS.map((platform) => (
            <div
              key={platform.name}
              className="trusted-platforms-logo flex h-10 w-auto shrink-0 items-center justify-center bg-transparent"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={platform.logo}
                alt={platform.name}
                width={platform.width}
                height={36}
                className="h-9 w-auto max-w-none shrink-0 bg-transparent object-contain object-center"
                style={{ width: platform.width }}
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
