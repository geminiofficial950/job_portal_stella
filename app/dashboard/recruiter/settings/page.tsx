import RecruiterSettingsForm from "@/app/components/RecruiterSettingsForm";

export default function RecruiterSettingsPage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
          Account Settings
        </h1>
        <p className="mt-1 text-sm text-[#64748b]">
          Manage your profile, notifications, hiring defaults, and team access.
        </p>
      </div>

      <RecruiterSettingsForm />
    </main>
  );
}
