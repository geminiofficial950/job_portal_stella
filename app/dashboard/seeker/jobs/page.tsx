import SeekerJobsList from "@/app/components/SeekerJobsList";

export default function SeekerJobsPage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
          Open Roles
        </h1>
        <p className="mt-1 text-sm text-[#64748b]">
          Live openings from approved employers on Stella Jobs.
        </p>
      </div>

      <SeekerJobsList />
    </main>
  );
}
