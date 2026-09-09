import SeekerSuggestedJobsList from "@/app/components/SeekerSuggestedJobsList";

export default function SeekerSuggestedPage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
          Suggested Jobs
        </h1>
        <p className="mt-1 text-sm text-[#64748b]">
          Roles matched to your profile skills — open any card to review or
          apply.
        </p>
      </div>

      <SeekerSuggestedJobsList />
    </main>
  );
}
