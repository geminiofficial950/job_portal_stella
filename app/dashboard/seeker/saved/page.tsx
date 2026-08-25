import { Bookmark, BookmarkX } from "lucide-react";
import Link from "next/link";
import { Search } from "lucide-react";

export default function SeekerSavedPage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="relative overflow-hidden rounded-2xl border border-[#e2e8f0] border-l-4 border-l-[#dc2626] bg-white shadow-sm p-6 sm:p-8 mb-8">
        <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-white/20 blur-3xl" />
        <div className="relative">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#64748b]">
            <Bookmark className="h-3 w-3" />
            Saved Jobs
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#0f172a]">
            Saved Jobs
          </h1>
          <p className="mt-2 text-[#64748b] text-sm">
            Keep interesting roles here while you decide.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-dashed border-[#fbcfe8] bg-gradient-to-br from-[#fdf2f8] to-[#fce7f3] px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#db2777] to-[#f472b6] shadow-lg">
          <BookmarkX className="h-8 w-8 text-white" />
        </div>
        <p className="text-lg font-bold text-[#831843]">No saved jobs</p>
        <p className="mt-2 text-sm text-[#6b7a9e]">
          Bookmark roles from Find Jobs and they&apos;ll land here.
        </p>
        <Link
          href="/dashboard/seeker/jobs"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#db2777] to-[#f472b6] px-5 py-3 text-sm font-bold text-white shadow-md hover:scale-105 transition-transform"
        >
          <Search className="h-4 w-4" />
          Find Jobs
        </Link>
      </div>
    </main>
  );
}
