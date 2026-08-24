import { Settings } from "lucide-react";
import RecruiterSettingsForm from "@/app/components/RecruiterSettingsForm";

export default function RecruiterSettingsPage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#64748b] via-[#475569] to-[#94a3b8] p-6 sm:p-8 mb-8">
        <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-28 w-28 rounded-full bg-[#e2e8f0]/30 blur-2xl" />
        <div className="relative">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm">
            <Settings className="h-3 w-3" />
            Settings
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
            Account Settings
          </h1>
          <p className="mt-2 max-w-xl text-white/70 text-sm">
            Manage your profile, notifications, hiring defaults, and team
            access.
          </p>
        </div>
      </div>

      <RecruiterSettingsForm />
    </main>
  );
}
