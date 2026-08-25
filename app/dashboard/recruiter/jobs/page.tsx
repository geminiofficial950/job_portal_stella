import Link from "next/link";
import { PlusCircle, Briefcase } from "lucide-react";
import RecruiterJobsList from "@/app/components/RecruiterJobsList";

export default function RecruiterJobsPage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-[#e2e8f0] border-l-4 border-l-[#dc2626] bg-white shadow-sm p-6 sm:p-8 mb-8">
        <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-[#fde68a]/30 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#64748b]">
              <Briefcase className="h-3 w-3" />
              My Jobs
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#0f172a]">
              Job Listings
            </h1>
            <p className="mt-2 text-[#64748b] text-sm">
              Manage your open, paused, and closed roles.
            </p>
          </div>
          <Link
            href="/dashboard/recruiter/jobs/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#92400e] shadow-lg hover:bg-[#fef3c7] transition-all duration-200 hover:scale-105"
          >
            <PlusCircle className="h-4 w-4" />
            Post a Job
          </Link>
        </div>
      </div>

      <RecruiterJobsList />
    </main>
  );
}
