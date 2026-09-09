import Link from "next/link";
import { notFound } from "next/navigation";
import { ensureLearningSeeded } from "@/lib/learningStore";
import { formatPrice } from "@/lib/stellaContent";
import { Course } from "@/models/Learning";
import InterestForm from "@/app/components/InterestForm";
import CourseEnrolActions from "@/app/components/CourseEnrolActions";

type Props = { params: Promise<{ id: string }> };

export default async function CourseDetailPage({ params }: Props) {
  const { id } = await params;
  await ensureLearningSeeded();
  let course: any = await Course.findOne({ slug: id, published: true }).lean();
  if (!course && /^[a-f\d]{24}$/i.test(id)) {
    course = await Course.findById(id).lean();
  }
  if (!course) notFound();

  const trainingLabel =
    course.trainingType === "qualification"
      ? "Qualification pathway"
      : course.trainingType === "accredited" || course.nationallyRecognised
        ? "Accredited / nationally recognised (only when substantiated)"
        : "Non-accredited professional development";

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
      <Link href="/courses" className="text-sm text-[#2563eb]">
        ← All courses
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-[#0f2744]">{course.title}</h1>
      <p className="mt-2 text-slate-500">{course.outcome}</p>
      <div className="mt-6 rounded-[22px] border border-slate-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
        <p>Provider: {course.provider}</p>
        <p>Duration: {course.duration}</p>
        <p>Mode: {course.mode}</p>
        <p>Prerequisites: {course.prerequisites}</p>
        <p>
          <strong>Training type:</strong> {trainingLabel}
        </p>
        <p>Price: {formatPrice(course.price)}</p>
        <p className="mt-2">{course.accessInstructions}</p>
      </div>

      <CourseEnrolActions slug={course.slug} />

      <div className="mt-8">
        <h2 className="text-lg font-bold text-[#0f2744]">Interest / enquiry</h2>
        <InterestForm
          kind="course"
          itemId={course.slug}
          itemTitle={course.title}
        />
      </div>
    </main>
  );
}
