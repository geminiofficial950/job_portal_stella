import RecruiterApplicationsPanel from "@/app/components/RecruiterApplicationsPanel";

export default function RecruiterApplicationsPage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
          Incoming Applications
        </h1>
        <p className="mt-1 text-sm text-[#64748b]">
          Review candidates and update their application status.
        </p>
      </div>

      <RecruiterApplicationsPanel />
    </main>
  );
}
