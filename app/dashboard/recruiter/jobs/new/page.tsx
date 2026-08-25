import PostJobForm from "@/app/components/PostJobForm";

export default function RecruiterNewJobPage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
          Post a Job
        </h1>
        <p className="mt-1 text-sm text-[#64748b]">
          Fill in the role details. Your company must be approved before you can
          publish.
        </p>
      </div>

      <PostJobForm />
    </main>
  );
}
