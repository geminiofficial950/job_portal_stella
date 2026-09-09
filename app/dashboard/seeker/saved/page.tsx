import SeekerSavedJobsList from "@/app/components/SeekerSavedJobsList";

export default function SeekerSavedPage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
          Saved Jobs
        </h1>
        <p className="mt-1 text-sm text-[#64748b]">
          Roles you bookmarked — open any card to review details or apply.
        </p>
      </div>

      <SeekerSavedJobsList />
    </main>
  );
}
