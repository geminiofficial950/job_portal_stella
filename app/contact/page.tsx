import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import ContactForm from "@/app/components/ContactForm";
import { STELLA_CONTACT } from "@/lib/stellaContent";

export const metadata: Metadata = {
  title: "Contact Us — Gemini Jobs",
  description: "Contact Gemini Jobs about job search, hiring, privacy, or your account.",
};

export default function ContactPage() {
  const email = STELLA_CONTACT.email;

  return (
    <main className="relative flex-1 overflow-hidden bg-white text-[#0f2744]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_70%_at_12%_0%,rgba(196,181,253,0.28),transparent_58%),linear-gradient(180deg,#f4f7ff_0%,#ffffff_42%)]"
      />
      <div className="relative mx-auto w-full max-w-[1080px] px-5 py-14 sm:px-8 sm:py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3b59ff]">
          Gemini Jobs
        </p>
        <h1 className="mt-3 text-[2rem] font-bold tracking-tight text-[#0f2744] sm:text-[2.35rem]">
          Contact us
        </h1>
        <p className="mt-4 max-w-2xl text-[18px] leading-8 text-[#334155]">
          Questions about a listing, your account, hiring on Gemini Jobs, or privacy — send a message and we’ll reply by email.
        </p>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_36px_-18px_rgba(15,39,68,0.28)] sm:p-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef2ff] text-[#3b59ff]">
              <Mail size={20} />
            </div>
            <h2 className="mt-4 text-lg font-bold text-[#0f2744]">Email</h2>
            <a href={`mailto:${email}`} className="mt-1 inline-block text-[17px] font-medium text-[#2563eb] hover:underline">
              {email}
            </a>
            <p className="mt-4 text-[15px] leading-7 text-slate-600">
              We reply on business days, Australia time. For privacy requests, include “Privacy” in the subject.
            </p>
            <ul className="mt-6 space-y-2 text-[15px] leading-7 text-[#334155]">
              <li>
                Looking for work?{" "}
                <Link href="/jobs" className="font-semibold text-[#2563eb] hover:underline">
                  Browse jobs
                </Link>
              </li>
              <li>
                Hiring?{" "}
                <Link href="/register?role=recruiter" className="font-semibold text-[#2563eb] hover:underline">
                  Post a role
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="font-medium text-[#2563eb] hover:underline">
                  Privacy Policy
                </Link>
                <span className="mx-2 text-slate-300">/</span>
                <Link href="/terms" className="font-medium text-[#2563eb] hover:underline">
                  Terms
                </Link>
              </li>
            </ul>
          </aside>
          <ContactForm email={email} />
        </div>
      </div>
    </main>
  );
}
