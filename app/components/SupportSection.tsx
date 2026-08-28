"use client";

import React from "react";
import { Playfair_Display } from "next/font/google";
import {
  Clock,
  Users,
  Globe,
  Calendar,
  Pencil,
  Phone,
  MessageCircle,
  Languages,
  ShieldCheck,
  Shield,
  FileCheck,
  Smartphone,
  Check,
  Star,
  User,
} from "lucide-react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["italic", "normal"],
  display: "swap",
});

const METRICS = [
  { value: "90s", label: "Median answer time, seeker line", Icon: Clock },
  { value: "1", label: "Account manager per employer", Icon: Users },
  { value: "12", label: "Languages across both desks", Icon: Globe },
  { value: "6h", label: "Posting to screened shortlist", Icon: Calendar },
] as const;

const SEEKER_ITEMS = [
  {
    text: "Free help writing your profile and choosing assessments",
    Icon: Pencil,
  },
  {
    text: "Structured phone interview once you reach Level 5",
    Icon: Phone,
  },
  {
    text: "Honest feedback when you are not ready for a role yet",
    Icon: MessageCircle,
  },
  {
    text: "Interpreter arranged at no cost for any call",
    Icon: Languages,
  },
] as const;

const EMPLOYER_ITEMS = [
  {
    text: "Every credential verified with the issuing body, not just uploaded",
    Icon: ShieldCheck,
  },
  {
    text: "Work rights confirmed against VEVO, expiry dates tracked for you",
    Icon: Shield,
  },
  {
    text: "Clearances checked as current on the day you see the profile",
    Icon: FileCheck,
  },
  {
    text: "Direct mobile to your manager, no call queue, no ticket triage",
    Icon: Smartphone,
  },
] as const;

const EMPLOYER_CHECKS = [
  "Identity verified",
  "Work rights confirmed",
  "Qualifications checked",
  "Clearances current",
] as const;

function FloatCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <div
      className={`absolute flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-[0_8px_24px_rgba(15,39,68,0.08)] ${className}`}
    >
      {children}
    </div>
  );
}

function DeskPanel({
  tone,
  label,
  title,
  description,
  items,
  visual,
}: {
  tone: "blue" | "green";
  label: string;
  title: string;
  description: string;
  items: readonly { text: string; Icon: React.ElementType }[];
  visual: React.ReactNode;
}) {
  const accent = tone === "blue" ? "#2563eb" : "#16a34a";
  const accentSoft = tone === "blue" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600";
  const iconBg = tone === "blue" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600";

  return (
    <div className="grid grid-cols-1 gap-8 border-t border-slate-200 py-10 lg:grid-cols-[72px_1fr_280px] lg:items-center lg:gap-10 lg:py-12">
      <div className="flex flex-row items-center gap-3 lg:flex-col lg:items-center lg:gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${accentSoft}`}
        >
          {tone === "blue" ? (
            <User className="h-5 w-5" strokeWidth={2.2} />
          ) : (
            <Shield className="h-5 w-5" strokeWidth={2.2} />
          )}
        </div>
        <p
          className="text-[11px] font-bold uppercase tracking-[0.18em] lg:[writing-mode:vertical-rl] lg:rotate-180"
          style={{ color: accent }}
        >
          {label}
        </p>
      </div>

      <div className="min-w-0">
        <h3 className="text-xl font-bold tracking-tight text-[#0f2744] sm:text-2xl">
          {title}
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-[15px]">
          {description}
        </p>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-5">
          {items.map(({ text, Icon }) => (
            <div key={text} className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconBg}`}
              >
                <Icon className="h-4 w-4" strokeWidth={2.2} />
              </span>
              <p className="text-sm leading-snug text-slate-700">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center lg:justify-end">{visual}</div>
    </div>
  );
}

function EmployerShieldVisual() {
  return (
    <div className="relative flex items-center gap-4">
      <div className="relative flex h-[120px] w-[100px] items-center justify-center">
        <div
          className="flex h-full w-full items-center justify-center"
          style={{
            clipPath:
              "polygon(50% 0%, 92% 18%, 92% 58%, 50% 100%, 8% 58%, 8% 18%)",
            background: "linear-gradient(145deg, #4ade80 0%, #16a34a 45%, #15803d 100%)",
            boxShadow: "0 16px 32px rgba(22,163,74,0.35)",
          }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md">
            <Check className="h-6 w-6 text-emerald-500" strokeWidth={3} />
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_10px_30px_rgba(15,39,68,0.08)]">
        {EMPLOYER_CHECKS.map((item) => (
          <div key={item} className="flex items-center gap-2 py-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span className="text-xs font-medium text-slate-700">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SupportSection() {
  return (
    <section id="support" className="support-section bg-white py-12 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-10">
        {/* Hero */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <h2 className="support-hero-title text-[2rem] font-bold leading-[1.1] tracking-tight text-[#0f2744] sm:text-[2.35rem] lg:text-[2.55rem]">
              The matching is automated.{" "}
              <span className={`${playfair.className} font-normal italic text-[#2563eb]`}>
                The judgement is not.
              </span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-[17px]">
              Two support desks, staffed by people with names, direct lines, and enough
              context to be useful on the first call.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none lg:justify-self-end">
            <div className="relative mx-auto aspect-[4/5] max-h-[420px] w-[78%] max-w-[320px]">
              <div className="absolute inset-0 rounded-[42%_58%_48%_52%] bg-sky-100/80" />
              <img
                src="/assets/04-support-agent-headset.png"
                alt=""
                className="relative z-10 h-full w-full object-contain object-bottom"
              />
              <FloatCard className="left-[-8%] top-[18%]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                Verified credentials
              </FloatCard>
              <FloatCard className="bottom-[28%] left-[-12%]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Users className="h-3.5 w-3.5" strokeWidth={2.2} />
                </span>
                Right role match
              </FloatCard>
              <FloatCard className="right-[-6%] top-[32%]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Star className="h-3.5 w-3.5" strokeWidth={2.2} />
                </span>
                Shortlist ready
              </FloatCard>
              <div className="absolute bottom-[8%] right-[4%] z-20 flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb] text-white shadow-lg">
                <Phone className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="mt-12 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_24px_rgba(15,39,68,0.05)] sm:mt-14">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {METRICS.map(({ value, label, Icon }, i) => (
              <div
                key={label}
                className={`flex items-start gap-4 p-5 sm:p-6 ${
                  i < METRICS.length - 1 ? "border-slate-200 lg:border-r" : ""
                } ${i % 2 === 0 ? "border-r sm:border-r-0" : ""} ${
                  i < 2 ? "border-b lg:border-b-0" : ""
                }`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-500">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-tight text-[#0f2744] sm:text-3xl">
                    {value}
                  </p>
                  <p className="mt-1 text-xs leading-snug text-slate-500 sm:text-sm">
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desks */}
        <DeskPanel
          tone="blue"
          label="For job seekers"
          title="A phone line a person picks up."
          description="Not a chatbot, not a ticket number. If your application stalls, you ring and find out why."
          items={SEEKER_ITEMS}
          visual={
            <img
              src="/assets/05-support-phone.png"
              alt=""
              className="h-[200px] w-auto max-w-[220px] object-contain sm:h-[230px]"
            />
          }
        />

        <DeskPanel
          tone="green"
          label="For employers"
          title="We do the verifying, you do the hiring."
          description="Identity, work rights, qualifications, and clearances are checked at the source before a shortlist reaches you."
          items={EMPLOYER_ITEMS}
          visual={<EmployerShieldVisual />}
        />
      </div>
    </section>
  );
}
