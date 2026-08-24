import { Users, UserSearch } from "lucide-react";

export default function RecruiterCandidatesPage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#ec4899] via-[#db2777] to-[#f472b6] p-6 sm:p-8 mb-8">
        <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-28 w-28 rounded-full bg-[#fbcfe8]/40 blur-2xl" />
        <div className="relative">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm">
            <Users className="h-3 w-3" />
            Candidates
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
            Talent Pool
          </h1>
          <p className="mt-2 max-w-xl text-white/70 text-sm">
            Shortlisted and matched candidates for your roles.
          </p>
        </div>
      </div>

      {/* Empty state */}
      <div className="rounded-2xl border-2 border-dashed border-[#fbcfe8] bg-gradient-to-br from-[#fdf2f8] to-[#fce7f3] px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ec4899] to-[#f472b6] shadow-lg">
          <UserSearch className="h-8 w-8 text-white" />
        </div>
        <p className="text-lg font-bold text-[#831843]">No candidates yet</p>
        <p className="mt-2 text-sm text-[#6b7a9e]">
          Matches and shortlists will show up here once applications arrive.
        </p>
      </div>
    </main>
  );
}
