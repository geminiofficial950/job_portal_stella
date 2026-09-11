import { notFound } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Job } from "@/models/Job";
import { Company } from "@/models/Company";

type Props = { params: Promise<{ id: string }> };

/** J05 — permanent job detail URL for Gemini Jobs-listed vacancies */
export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;

  // External aggregated IDs are not Mongo ObjectIds — send to browse with query
  if (!/^[a-f\d]{24}$/i.test(id)) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold text-[#0f2744]">External listing</h1>
        <p className="mt-2 text-sm text-slate-500">
          This ID is from an imported source. Open it from the jobs board with
          source attribution.
        </p>
        <Link
          href={`/jobs?q=${encodeURIComponent(id)}`}
          className="mt-4 inline-block text-[#2563eb]"
        >
          Back to jobs
        </Link>
      </main>
    );
  }

  await connectDB();
  const job = await Job.findById(id).lean();
  if (!job || job.status !== "open") notFound();

  const company = await Company.findById(job.companyId)
    .select("name logoUrl status location")
    .lean();
  if (!company || company.status !== "approved") notFound();

  const currency = job.salaryCurrency || "AUD";
  const salary =
    job.salaryMin != null || job.salaryMax != null
      ? `${currency} ${job.salaryMin ?? "?"}–${job.salaryMax ?? "?"}${
          job.salaryPeriod ? ` / ${job.salaryPeriod}` : ""
        }`
      : `${currency} — ask employer`;

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
      <Link href="/jobs" className="text-sm text-[#2563eb]">
        ← Jobs
      </Link>
      <p className="mt-3 text-xs font-bold uppercase text-[#2563eb]">
        Gemini Jobs employer listing
      </p>
      <h1 className="mt-1 text-3xl font-bold text-[#0f2744]">{job.title}</h1>
      <p className="mt-2 text-slate-500">
        {company.name} · {job.location} · {job.workMode} · {job.employmentType}
      </p>
      <div className="mt-6 rounded-[22px] border border-slate-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
        <p>
          <strong>Salary:</strong> {salary}
        </p>
        <p>
          <strong>Experience:</strong> {job.experienceLevel || "n/a"}
        </p>
        <p>
          <strong>Category:</strong> {job.category || "n/a"}
        </p>
        <p className="mt-3 whitespace-pre-wrap">{job.description}</p>
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Applying here creates a Gemini Jobs application. External imported jobs show
        their own destination on the board and are not counted as Gemini Jobs
        applications without confirmation.
      </p>
    </main>
  );
}
