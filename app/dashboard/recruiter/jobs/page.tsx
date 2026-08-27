import Link from "next/link";
import { PlusCircle } from "lucide-react";
import RecruiterJobsList from "@/app/components/RecruiterJobsList";

export default function RecruiterJobsPage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
            Job Listings
          </h1>
          <p className="mt-1 text-sm text-[#64748b]">
            Manage your open, paused, and closed roles.
          </p>
        </div>
        <Link
          href="/dashboard/recruiter/jobs/new"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#5850ec] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(88,80,236,0.35)] hover:bg-[#4f46e5] transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Post a Job
        </Link>
      </div>

      <RecruiterJobsList />
    </main>
  );
}
