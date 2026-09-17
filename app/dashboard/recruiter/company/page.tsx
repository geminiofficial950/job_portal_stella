import CompanyProfileForm from "@/app/components/CompanyProfileForm";

export default function RecruiterCompanyPage() {
  return (
    <main data-preserve-color className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
          Company Profile
        </h1>
        <p className="mt-1 text-sm text-[#64748b]">
          This is the company page candidates and admins will see.
        </p>
      </div>

      <CompanyProfileForm />
    </main>
  );
}
