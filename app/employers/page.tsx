import Link from "next/link";
import { STELLA_CONTACT } from "@/lib/stellaContent";

export const metadata = { title: "For Employers — Stella Careers" };

export default function EmployersPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-8 lg:px-10">
      <h1 className="text-3xl font-bold text-[#0f2744]">
        Find candidates with the evidence you need
      </h1>
      <p className="mt-2 max-w-2xl text-slate-500">
        Filter by role, location, availability and checked credentials. Contact
        for pricing until fees are published.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-[22px] border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#0f2744]">Find candidates</h2>
          <p className="mt-2 text-sm text-slate-500">
            Browse people who choose to be discoverable to approved employers.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/register?role=recruiter&next=/dashboard/recruiter/candidates"
              className="rounded-lg bg-[#00082C] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Find candidates
            </Link>
            <Link
              href="/recruiters"
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold"
            >
              Company directory
            </Link>
          </div>
        </div>
        <div className="rounded-[22px] border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#0f2744]">Post a job</h2>
          <p className="mt-2 text-sm text-slate-500">
            Publish Australian vacancies with clear location and work type.
          </p>
          <Link
            href="/register?role=recruiter&next=/dashboard/recruiter/jobs/new"
            className="mt-4 inline-flex rounded-lg bg-[#00082C] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Post a job
          </Link>
        </div>
      </div>
      <p className="mt-6 text-sm text-slate-500">
        Enquire:{" "}
        <a href={`mailto:${STELLA_CONTACT.email}`} className="text-[#2563eb]">
          {STELLA_CONTACT.email}
        </a>
        . Phone: {STELLA_CONTACT.phone}. Screening scope: see{" "}
        <Link href="/verification" className="text-[#2563eb]">
          verification
        </Link>
        .
      </p>
    </main>
  );
}
