import AdminCompaniesPanel from "@/app/components/AdminCompaniesPanel";

export default function AdminCompaniesPage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      <h1 className="text-3xl font-medium tracking-[-0.04em]">Companies</h1>
      <p className="mt-2 max-w-2xl text-[#6b7a9e]">
        Approve or reject employer profiles. Only approved companies can post
        jobs.
      </p>
      <div className="mt-8">
        <AdminCompaniesPanel />
      </div>
    </main>
  );
}
