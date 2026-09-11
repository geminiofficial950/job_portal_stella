"use client";

const PLATFORMS = [
  {
    name: "SEEK",
    logo: "/logos/seek.png",
    width: 164,
  },
  {
    name: "Indeed",
    logo: "/logos/indeed.svg",
    width: 120,
  },
  {
    name: "LinkedIn",
    logo: "/logos/linkedin.svg",
    width: 120,
  },
  {
    name: "Jora",
    logo: "/logos/jora.svg",
    width: 205,
    offset: 39,
  },
  {
    name: "gov.au",
    logo: "/logos/gov-au.png",
    width: 130,
  },
  {
    name: "Australian JobSearch",
    logo: "/logos/australian-jobsearch.svg",
    width: 180,
    offset: 28,
  },
] as const;

export default function TrustedJobPlatforms() {
  return (
    <section className="trusted-platforms w-full">
      <div className="trusted-platforms-inner mx-auto max-w-[1450px] px-5 pb-5 pt-0 sm:px-8 sm:pb-6 lg:px-12 lg:pb-7">
        <p className="trusted-platforms-eyebrow mb-5 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-black sm:mb-6 sm:text-[11px] sm:tracking-[0.22em]">
          Jobs from top employers and leading platforms, all in one place
        </p>

        <div className="trusted-platforms-row flex flex-wrap items-center justify-center gap-x-8 gap-y-6 sm:gap-x-10 md:flex-nowrap md:justify-between md:gap-x-5 lg:gap-x-9 xl:gap-x-12">
          {PLATFORMS.map((platform) => (
            <div
              key={platform.name}
              className="trusted-platforms-logo flex h-12 w-[140px] shrink-0 items-center justify-center overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={platform.logo}
                alt={platform.name}
                width={platform.width}
                height={40}
                className="h-auto max-w-none shrink-0 object-contain object-center"
                style={{
                  width: platform.width,
                  transform: "offset" in platform ? `translateX(${platform.offset}px)` : undefined,
                }}
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
