import Link from "next/link";
import { ArrowRight, Briefcase, Search } from "lucide-react";
import { STELLA_CONTACT } from "@/lib/stellaContent";

export const metadata = { title: "For Employers — Gemini Jobs" };

export default function EmployersPage() {
  return (
    <main className="relative min-h-[70vh] overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(37,99,235,0.1),_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(13,148,136,0.1),_transparent_45%),linear-gradient(180deg,#eef4fb_0%,#f8fafc_55%,#f0fdf4_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-8 lg:px-10">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-[#0f2744] sm:text-4xl">
            Find candidates with the evidence you need
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-500 sm:text-base">
            Filter by role, location, availability and checked credentials.
            Contact for pricing until fees are published.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <article className="relative flex h-full flex-col overflow-hidden rounded-[24px] border border-white/80 bg-white/75 p-6 backdrop-blur-md sm:p-7">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
              <Search className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-[#0f2744]">Find candidates</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">
              Browse people who choose to be discoverable to approved employers.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/register?role=recruiter&next=/dashboard/recruiter/candidates"
                className="inline-flex items-center gap-2 rounded-xl bg-[#00082C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#00061F]"
              >
                Find candidates
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/recruiters"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-semibold text-[#0f2744] transition hover:bg-white"
              >
                Company directory
              </Link>
            </div>
          </article>

          <article className="relative flex h-full flex-col overflow-hidden rounded-[24px] border border-white/80 bg-white/75 p-6 backdrop-blur-md sm:p-7">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
              <Briefcase className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-[#0f2744]">Post a job</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">
              Publish Australian vacancies with clear location and work type.
            </p>
            <Link
              href="/register?role=recruiter&next=/dashboard/recruiter/jobs/new"
              className="mt-5 inline-flex items-center gap-2 self-start rounded-xl bg-[#00082C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#00061F]"
            >
              Post a job
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        </div>

        <p className="mt-8 text-sm leading-relaxed text-slate-500">
          Enquire:{" "}
          <a
            href={`mailto:${STELLA_CONTACT.email}`}
            className="font-semibold text-[#2563eb] hover:underline"
          >
            {STELLA_CONTACT.email}
          </a>
          . Phone: {STELLA_CONTACT.phone}. Screening scope: see{" "}
          <Link
            href="/verification"
            className="font-semibold text-[#2563eb] hover:underline"
          >
            verification
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
