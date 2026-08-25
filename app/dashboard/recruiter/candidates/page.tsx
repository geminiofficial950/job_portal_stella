import { UserSearch } from "lucide-react";

export default function RecruiterCandidatesPage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
          Talent Pool
        </h1>
        <p className="mt-1 text-sm text-[#64748b]">
          Shortlisted and matched candidates for your roles.
        </p>
      </div>

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
