import SeekerProfileForm from "@/app/components/SeekerProfileForm";

export default function SeekerProfilePage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
          Your Career Profile
        </h1>
        <p className="mt-1 text-sm text-[#64748b]">
          Build your career profile so employers can find you.
        </p>
      </div>

      <SeekerProfileForm />
    </main>
  );
}
