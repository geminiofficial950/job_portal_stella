import { UserRound } from "lucide-react";
import SeekerProfileForm from "@/app/components/SeekerProfileForm";

export default function SeekerProfilePage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="relative overflow-hidden rounded-2xl border border-[#e2e8f0] border-l-4 border-l-[#dc2626] bg-white shadow-sm p-6 sm:p-8 mb-8">
        <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-white/20 blur-3xl" />
        <div className="relative">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#64748b]">
            <UserRound className="h-3 w-3" />
            Profile
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#0f172a]">
            Your Career Profile
          </h1>
          <p className="mt-2 text-[#64748b] text-sm">
            Build your career profile so employers can find you.
          </p>
        </div>
      </div>

      <SeekerProfileForm />
    </main>
  );
}
