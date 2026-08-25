import SeekerApplicationsList from "@/app/components/SeekerApplicationsList";

export default function SeekerApplicationsPage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
          Your Applications
        </h1>
        <p className="mt-1 text-sm text-[#64748b]">
          Track every role you apply to — status updates show here.
        </p>
      </div>

      <SeekerApplicationsList />
    </main>
  );
}
