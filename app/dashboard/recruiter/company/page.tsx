import { Building2 } from "lucide-react";
import CompanyProfileForm from "@/app/components/CompanyProfileForm";

export default function RecruiterCompanyPage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-[#e2e8f0] border-l-4 border-l-[#dc2626] bg-white shadow-sm p-6 sm:p-8 mb-8">
        <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-28 w-28 rounded-full bg-[#c7d2fe]/40 blur-2xl" />
        <div className="relative">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#64748b]">
            <Building2 className="h-3 w-3" />
            Company
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#0f172a]">
            Company Profile
          </h1>
          <p className="mt-2 max-w-xl text-[#64748b] text-sm">
            Add your business details and logo. Profiles stay pending until an
            admin approves them.
          </p>
        </div>
      </div>

      <CompanyProfileForm />
    </main>
  );
}
