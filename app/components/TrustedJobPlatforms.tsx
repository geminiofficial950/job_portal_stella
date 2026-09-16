"use client";

const PLATFORMS = [
  {
    name: "SEEK",
    logo: "/logos/seek.svg",
  },
  {
    name: "Indeed",
    logo: "/logos/indeed.svg",
  },
  {
    name: "LinkedIn",
    logo: "/logos/linkedin.svg",
  },
  {
    name: "Jora",
    logo: "/logos/jora.svg",
  },
  {
    name: "gov.au",
    logo: "/logos/gov-au.svg",
  },
  {
    name: "Australian JobSearch",
    logo: "/logos/australian-jobsearch.svg",
  },
] as const;

export default function TrustedJobPlatforms() {
  return (
    <section className="trusted-platforms w-full">
      <div className="trusted-platforms-inner w-full px-5 pb-5 pt-0 sm:px-8 sm:pb-6 lg:px-12 lg:pb-7">
        <p className="trusted-platforms-eyebrow mb-5 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-black sm:mb-6 sm:text-[11px] sm:tracking-[0.22em]">
          Jobs from top employers and leading platforms, all in one place
        </p>

        <div className="trusted-platforms-row">
          {PLATFORMS.map((platform) => (
            <div
              key={platform.name}
              className="trusted-platforms-logo"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${platform.logo}?v=aligned-2`}
                alt={platform.name}
                width={140}
                height={60}
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
