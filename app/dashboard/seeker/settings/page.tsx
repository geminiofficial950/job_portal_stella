import { Settings } from "lucide-react";
import SeekerSettingsForm from "@/app/components/SeekerSettingsForm";

export default function SeekerSettingsPage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#475569] via-[#334155] to-[#94a3b8] p-6 sm:p-8 mb-8">
        <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-white/20 blur-3xl" />
        <div className="relative">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm">
            <Settings className="h-3 w-3" />
            Settings
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
            Account Settings
          </h1>
          <p className="mt-2 text-white/70 text-sm">
            Manage your account, alerts, and password.
          </p>
        </div>
      </div>

      <SeekerSettingsForm />
    </main>
  );
}
