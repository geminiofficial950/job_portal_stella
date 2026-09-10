"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import LocationSuggestInput from "@/app/components/LocationSuggestInput";
import KeywordSuggestInput from "@/app/components/KeywordSuggestInput";

const HERO_WORDS = [
  "Opportunity",
  "Career Move",
  "Big Break",
  "Job",
  "Chapter",
  "Fit",
  "Opportunity",
] as const;

function RotatingCareerWord() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = window.setInterval(() => {
      if (!reducedMotion.matches) {
        setWordIndex((index) => (index + 1) % HERO_WORDS.length);
      }
    }, 2800);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <span className="hero-rotating-word">
      <span className="sr-only">Opportunity</span>
      {HERO_WORDS.map((word, index) => (
        <span key={index} className="hero-rotating-sizer" aria-hidden="true">
          {word}
        </span>
      ))}
      <span
        key={wordIndex}
        className="hero-v2-gradient-word hero-rotating-current"
        aria-hidden="true"
      >
        {HERO_WORDS[wordIndex]}
      </span>
    </span>
  );
}

const POPULAR = [
  "Aged Care",
  "Disability Support",
  "Administration",
  "IT & Tech",
  "Construction",
  "Hospitality",
  "Remote",
] as const;

const BENEFITS = [
  { icon: CheckCircle2, label: "Free for candidates", tone: "green" },
  { icon: ShieldCheck, label: "Verified credentials", tone: "blue" },
  { icon: Users, label: "Expert masterclasses", tone: "blue" },
  { icon: TrendingUp, label: "Career growth support", tone: "green" },
] as const;

const JOURNEY_AVATARS = [
  "/assets/09-trust-avatar-01.png",
  "/assets/09-trust-avatar-02.png",
  "/assets/09-trust-avatar-03.png",
  "/assets/09-trust-avatar-05.png",
] as const;

/** Hero matching the Sydney career mockup — soft-blend photo, left copy */
export default function HeroSection() {
  const router = useRouter();
  const [jobQuery, setJobQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({ country: "au" });
    if (jobQuery.trim()) params.set("q", jobQuery.trim());
    if (locationQuery.trim()) params.set("location", locationQuery.trim());
    router.push(`/jobs?${params.toString()}`);
  }

  function searchPopular(term: string) {
    router.push(`/jobs?${new URLSearchParams({ country: "au", q: term })}`);
  }

  return (
    <section className="hero-section hero-section--v2 hero-reference relative w-full overflow-hidden">
      <div
        className="hero-v2-wash pointer-events-none absolute inset-0"
        aria-hidden
      />

      <div className="hero-shell relative mx-auto grid w-full max-w-[1400px] items-center gap-6 px-5 pb-0 pt-12 sm:px-8 sm:pb-0 sm:pt-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)] lg:gap-6 lg:px-10 lg:pb-0 lg:pt-16 xl:gap-8 xl:px-12">
        {/* LEFT */}
        <div className="hero-copy hero-copy-enter relative z-20 flex w-full min-w-0 flex-col items-start lg:max-w-[620px] xl:max-w-[660px]">
          <h1 className="hero-v2-title">
            Your Next
            <br />
            <RotatingCareerWord />
            <br />
            Starts Here.
          </h1>

          <p className="hero-sub mt-5 text-[15px] font-medium leading-[1.55] text-[#334155] sm:text-[16px]">
            AI-POWERED, HUMAN-SUPPORTED, BUILT FOR AUSTRALIA
            <br />
            Connecting Aussie’s to opportunities - locally & globally
          </p>

          <form
            onSubmit={onSubmit}
            className="hero-search-form hero-v2-search mt-7 w-full sm:mt-8"
          >
            <div className="hero-search-fields flex w-full flex-col gap-2 rounded-[1.35rem] bg-white p-2 shadow-[0_10px_40px_-12px_rgba(15,23,42,0.22)] sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-[6px] sm:pl-5">
              <div className="relative min-w-0 flex-[1.25] px-2 sm:px-0">
                <KeywordSuggestInput
                  value={jobQuery}
                  onChange={setJobQuery}
                  placeholder="Job title, skill or keyword"
                  leading={
                    <Search className="h-[18px] w-[18px] shrink-0 text-[#3b59ff]" />
                  }
                  inputClassName="w-full bg-transparent py-2.5 text-[14px] text-slate-800 placeholder:text-slate-400 outline-none focus:outline-none focus-visible:outline-none sm:py-3 sm:text-[15px]"
                  className="home-location-suggest w-full"
                />
              </div>

              <div
                className="hero-search-midline mx-0.5 hidden h-6 w-px shrink-0 bg-slate-200 sm:block"
                aria-hidden
              />

              <div className="relative min-w-0 flex-1 px-2 sm:px-0">
                <LocationSuggestInput
                  value={locationQuery}
                  onChange={setLocationQuery}
                  placeholder="City, suburb or remote"
                  leading={
                    <MapPin className="h-[18px] w-[18px] shrink-0 text-[#3b59ff]" />
                  }
                  inputClassName="w-full bg-transparent py-2.5 text-[14px] text-slate-800 placeholder:text-slate-400 outline-none focus:outline-none focus-visible:outline-none sm:py-3 sm:text-[15px]"
                  className="home-location-suggest w-full"
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-2xl bg-[#3b59ff] px-5 py-3 text-[14px] font-bold text-white transition hover:bg-[#2f4ae6] focus:outline-none focus-visible:outline-none sm:ml-1 sm:w-auto sm:rounded-full sm:px-5 sm:py-[13px] sm:text-[14.5px]"
              >
                Search Jobs
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
          </form>

          <div className="hero-v2-popular mt-4 flex w-full flex-wrap items-center gap-2">
            <span className="mr-0.5 text-[12px] font-medium text-slate-500">
              Popular searches:
            </span>
            {POPULAR.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => searchPopular(term)}
                className="rounded-full border border-slate-300/90 bg-transparent px-2.5 py-[5px] text-[11.5px] font-medium text-slate-600 transition hover:border-[#3b59ff]/50 hover:text-[#3b59ff]"
              >
                {term}
              </button>
            ))}
          </div>

          <ul className="hero-v2-benefits relative z-50 mt-8 flex w-full flex-wrap gap-x-5 gap-y-3 sm:mt-10 sm:gap-x-6">
            {BENEFITS.map(({ icon: Icon, label, tone }) => (
              <li
                key={label}
                className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#334155]"
              >
                <span
                  className={`hero-v2-benefit-icon hero-v2-benefit-icon--${tone}`}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT — soft-blend photo (no hard card box) */}
        <div className="hero-v2-visual relative z-10 w-full min-w-0 lg:justify-self-stretch">
          <p className="hero-v2-script pointer-events-none absolute right-[8%] top-[3%] z-30 hidden sm:block">
            More
            <br />
            Opportunities
            <br />A Brighter You
          </p>

          <div className="hero-v2-float hero-v2-float--skills absolute left-[2%] top-[18%] z-30 lg:left-0 lg:top-[16%]">
            <span className="hero-v2-float-icon hero-v2-float-icon--violet">
              <Brain className="h-4 w-4" strokeWidth={2.2} />
            </span>
            <div>
              <p className="text-[13px] font-bold leading-snug text-[#0f172a]">
                AI matches jobs to your skills
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                Smarter opportunities, faster.
              </p>
            </div>
          </div>

          <div className="hero-v2-float hero-v2-float--people absolute right-[4%] top-[42%] z-30 lg:right-[2%] lg:top-[40%]">
            <span className="hero-v2-float-icon hero-v2-float-icon--blue">
              <Users className="h-4 w-4" strokeWidth={2.2} />
            </span>
            <div>
              <p className="text-[13px] font-bold leading-snug text-[#0f172a]">
                Real human support
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                Our team is here when you need us.
              </p>
            </div>
          </div>

          <div className="hero-v2-float hero-v2-float--count absolute bottom-[8%] right-[3%] z-30 max-w-[min(100%,300px)] lg:bottom-[7%] lg:right-[2%]">
            <div className="flex items-center gap-2.5">
              <div className="flex shrink-0 -space-x-2">
                {JOURNEY_AVATARS.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className="h-8 w-8 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <p className="min-w-0 flex-1 text-[12px] font-semibold leading-snug text-slate-700">
                <span className="font-extrabold text-[#0b1220]">50,000+</span>{" "}
                Australians already on their journey
              </p>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-[#3b59ff]"
                strokeWidth={2.5}
              />
            </div>
          </div>

          <div className="hero-v2-photo relative w-full">
            <Image
              src="/hero-sydney-woman-v4.png"
              width={1536}
              height={1024}
              preload
              sizes="(min-width: 1024px) 58vw, 100vw"
              alt="Professional starting her next career move in Australia"
              className="hero-v2-photo-img relative z-10 block h-[400px] w-full object-cover object-[center_12%] sm:h-[460px] lg:h-full lg:min-h-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
