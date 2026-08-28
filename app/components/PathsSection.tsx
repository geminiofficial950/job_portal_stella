"use client";

import React, { useState } from "react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["italic", "normal"],
  display: "swap",
});

const PATHS_AMBER = "#FBB03B";
const PATHS_PURPLE = "#7158E2";

export type PathTab = "seek" | "hire" | "new";

type PathLabels = {
  titleLine: string;
  titleAccent: string;
  tabs: { id: PathTab; label: string; lead: string }[];
};

const PATH_CONTENT: Record<
  PathTab,
  {
    image: string;
    steps: { title: string; desc: string }[];
    human: {
      header: string;
      name: string;
      role: string;
      rows: [string, string][];
      speaks: string[];
    };
  }
> = {
  seek: {
    image: "/assets/paths-seeker-consultant.png",
    steps: [
      {
        title: "Bring what you already have",
        desc: "Import LinkedIn, upload certificates, add overseas qualifications. Once, not ten times.",
      },
      {
        title: "Prove the parts that matter",
        desc: "Short assessments on job-relevant skills. Each one lifts your level and your ranking.",
      },
      {
        title: "Get a call, not an auto-reply",
        desc: "Reach Level 5 and a consultant rings you, in English or your first language.",
      },
      {
        title: "Go to employers pre-checked",
        desc: "Your clearances and screening note travel with you, so interviews start at the real questions.",
      },
    ],
    human: {
      header: "Seeker support line",
      name: "Anjali Kaur",
      role: "Candidate consultant, Melbourne",
      rows: [
        ["Direct line", "1300 000 000"],
        ["Typical answer", "< 90 sec"],
        ["Callback", "Same day"],
      ],
      speaks: ["English", "हिन्दी", "ਪੰਜਾਬੀ", "Interpreter"],
    },
  },
  hire: {
    image: "/assets/paths-hire-manager.png",
    steps: [
      {
        title: "Post the role in five minutes",
        desc: "Or call your account manager and dictate it. Both work.",
      },
      {
        title: "Set your own bar",
        desc: "Choose the minimum level, clearances, and availability. Anything below it never reaches you.",
      },
      {
        title: "We verify the details for you",
        desc: "Identity, work rights, qualifications, and clearances checked at the source before a candidate reaches your shortlist.",
      },
      {
        title: "Read the note, not just the score",
        desc: "Every shortlisted candidate has been interviewed by phone and written up by a person you can ring.",
      },
      {
        title: "Fill the shift",
        desc: "Compliance evidence is attached before the first interview, so onboarding does not stall.",
      },
    ],
    human: {
      header: "Your account manager",
      name: "Marcus Tan",
      role: "Dedicated employer manager",
      rows: [
        ["Direct mobile", "Yours, not a queue"],
        ["Knows your roster", "Every role you run"],
        ["Pipeline call", "Weekly, 15 min"],
      ],
      speaks: ["English", "中文", "Bahasa", "Interpreter"],
    },
  },
  new: {
    image: "/assets/paths-newcomer-adviser.png",
    steps: [
      {
        title: "Find out what your qualification counts as",
        desc: "We map overseas study to the Australian framework and tell you plainly where the gap is.",
      },
      {
        title: "Understand your work rights",
        desc: "Visa conditions, hour limits, and what employers are allowed to ask. No jargon.",
      },
      {
        title: "Get the missing pieces",
        desc: "Police check, NDIS screening, first aid, whatever your target job actually requires.",
      },
      {
        title: "Talk to someone who has done it",
        desc: "A consultant who speaks your language walks through the first job, not the tenth.",
      },
    ],
    human: {
      header: "Newcomer support",
      name: "Rania Salim",
      role: "Settlement and skills adviser",
      rows: [
        ["First consult", "Free, 30 min"],
        ["Walk-in centres", "Melbourne, Sydney"],
        ["Written summary", "In your language"],
      ],
      speaks: ["English", "العربية", "Tiếng Việt", "Interpreter"],
    },
  },
};

function ScriptAccent({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block">
      <span
        className={`${playfair.className} font-normal italic text-[#7158E2]`}
      >
        {children}
      </span>
      <svg
        className="absolute -bottom-0.5 left-0 w-full text-[#7158E2]/75"
        viewBox="0 0 120 8"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M2 6 C30 2, 90 2, 118 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function splitLead(lead: string) {
  const trimmed = lead.trim();
  const lastSpace = trimmed.lastIndexOf(" ");
  if (lastSpace === -1) return { before: trimmed, accent: "" };
  return {
    before: `${trimmed.slice(0, lastSpace + 1)}`,
    accent: trimmed.slice(lastSpace + 1),
  };
}

export default function PathsSection({ labels }: { labels: PathLabels }) {
  const [activePath, setActivePath] = useState<PathTab>("seek");
  const content = PATH_CONTENT[activePath];
  const activeTab =
    labels.tabs.find((tab) => tab.id === activePath) ?? labels.tabs[0];
  const { before: leadBefore, accent: leadAccent } = splitLead(activeTab.lead);

  return (
    <section
      id="paths"
      className="paths-section relative overflow-hidden py-16 sm:py-20 lg:py-24"
      style={{ backgroundColor: PATHS_AMBER }}
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-8 lg:px-10">
        <h2 className="paths-title text-[2rem] font-bold leading-[1.05] tracking-tight text-white sm:text-[2.35rem] lg:text-[2.65rem]">
          {labels.titleLine} <ScriptAccent>{labels.titleAccent}</ScriptAccent>
        </h2>

        <p className="mt-4 max-w-2xl text-lg leading-snug text-white/95 sm:text-xl">
          {leadBefore}
          {leadAccent ? <ScriptAccent>{leadAccent}</ScriptAccent> : null}
        </p>

        <div
          className={`mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 ${
            content.steps.length > 4
              ? "lg:grid-cols-3 xl:grid-cols-5"
              : "lg:grid-cols-4"
          }`}
          role="tabpanel"
          id={`p-${activePath}`}
          aria-labelledby={`tab-${activePath}`}
        >
          {content.steps.map((step) => (
            <div key={step.title} className="min-w-0">
              <div className="mb-3 flex items-start gap-2.5">
                <span
                  className="mt-2 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: PATHS_PURPLE }}
                />
                <h3 className="text-[15px] font-semibold leading-snug text-white sm:text-base">
                  {step.title}
                </h3>
              </div>
              <p className="pl-5 text-sm leading-relaxed text-white/85">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <div
          className="mt-10 flex flex-wrap gap-2.5"
          role="tablist"
          aria-label="Choose your path"
        >
          {labels.tabs.map((tab) => {
            const selected = activePath === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`p-${tab.id}`}
                onClick={() => setActivePath(tab.id)}
                className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-colors sm:px-5 sm:text-[15px] ${
                  selected
                    ? "border-transparent text-white shadow-sm"
                    : "border-white/80 bg-transparent text-white hover:bg-white/10"
                }`}
                style={
                  selected
                    ? {
                        backgroundColor: PATHS_PURPLE,
                        borderColor: PATHS_PURPLE,
                      }
                    : undefined
                }
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:mt-10 sm:flex-row sm:items-stretch sm:gap-5">
          <div className="shrink-0 sm:w-[148px] lg:w-[168px]">
            <img
              src={content.image}
              alt=""
              className="h-[148px] w-full rounded-2xl object-cover object-center ring-4 ring-[#7158E2] lg:h-[168px]"
            />
          </div>

          <div
            className="flex min-w-0 flex-1 flex-col justify-center overflow-hidden rounded-[1.75rem] p-4 text-white shadow-[0_16px_40px_rgba(113,88,226,0.28)] sm:p-5 lg:p-6"
            style={{ backgroundColor: PATHS_PURPLE }}
          >
            <p className="text-lg font-semibold sm:text-xl">
              {content.human.header}
            </p>
            <p className="mt-1 text-xl font-bold sm:text-2xl">
              {content.human.name}
            </p>
            <p className="mt-0.5 text-sm text-white/75">{content.human.role}</p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3">
              {content.human.rows.map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <p className="text-sm text-white/80">
                    {label} —{" "}
                    <span className="font-semibold text-white">{value}</span>
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-sm text-white/85">
              {content.human.speaks.join(" / ")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
