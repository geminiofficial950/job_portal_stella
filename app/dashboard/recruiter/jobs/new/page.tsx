import { PlusCircle } from "lucide-react";
import PostJobForm from "@/app/components/PostJobForm";

export default function RecruiterNewJobPage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-[#e2e8f0] border-l-4 border-l-[#dc2626] bg-white shadow-sm p-6 sm:p-8 mb-8">
        <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-32 w-32 rounded-full bg-[#a5f3fc]/30 blur-2xl" />
        <div className="relative">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#64748b]">
            <PlusCircle className="h-3 w-3" />
            New Listing
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#0f172a]">
            Post a Job
          </h1>
          <p className="mt-2 max-w-xl text-[#64748b] text-sm">
            Fill in the role details. Your company must be approved before you
            can publish.
          </p>
        </div>
      </div>

      <PostJobForm />
    </main>
  );
}
