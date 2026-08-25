import { BookmarkX, Search } from "lucide-react";
import Link from "next/link";

export default function SeekerSavedPage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
          Saved Jobs
        </h1>
        <p className="mt-1 text-sm text-[#64748b]">
          Keep interesting roles here while you decide.
        </p>
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
