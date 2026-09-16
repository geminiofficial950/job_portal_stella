import { brandText } from "@/app/components/brandText";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import styles from "@/app/components/LearningDetail.module.css";
import { notFound } from "next/navigation";
import { ensureLearningSeeded } from "@/lib/learningStore";
import { formatPrice } from "@/lib/stellaContent";
import { Course } from "@/models/Learning";
import InterestForm from "@/app/components/InterestForm";
import CourseEnrolActions from "@/app/components/CourseEnrolActions";

type Props = { params: Promise<{ id: string }> };
type CourseDetails = {
  slug: string; title: string; outcome: string; provider: string;
  duration: string; mode: string; prerequisites: string; price: string;
  trainingType: string; nationallyRecognised: boolean; accessInstructions: string;
};

export default async function CourseDetailPage({ params }: Props) {
  const { id } = await params;
  await ensureLearningSeeded();
  let course = await Course.findOne({ slug: id, published: true }).lean<CourseDetails>();
  if (!course && /^[a-f\d]{24}$/i.test(id)) {
    course = await Course.findById(id).lean<CourseDetails>();
  }
  if (!course) notFound();

  const trainingLabel =
    course.trainingType === "qualification"
      ? "Qualification pathway"
      : course.trainingType === "accredited" || course.nationallyRecognised
        ? "Accredited / nationally recognised (only when substantiated)"
        : "Non-accredited professional development";

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link href="/courses" className={styles.back}><ArrowLeft size={16} /> All courses</Link>
        <header className={styles.intro}>
          <h1>{course.title}</h1>
          <p>{course.outcome}</p>
        </header>

        <div className={styles.split}>
          <div className={styles.visual}>
            <Image src="/assets/paths-seeker-consultant.png" alt="" fill loading="eager"
              sizes="(max-width: 767px) 100vw, (max-width: 1208px) 50vw, 580px"
              className={styles.image} />
            <div className={styles.caption}>
              <span>GEMINI JOBS · COURSES</span>
              <p>Build skills for your next opportunity.</p>
            </div>
          </div>
          <section className={styles.form} aria-labelledby="course-interest-title">
            <h2 id="course-interest-title">Interested in this course?</h2>
            <p>Leave your details or ask a question. We’ll register your enquiry with Gemini Jobs.</p>
            <InterestForm kind="course" itemId={course.slug} itemTitle={course.title} />
          </section>
        </div>

        <section className={styles.information} aria-labelledby="course-details-title">
          <h2 id="course-details-title">About this course</h2>
          <dl className={styles.details}>
            <div><dt>Provider</dt><dd>{/pending/i.test(course.provider) ? "To be announced" : brandText(course.provider)}</dd></div>
            <div><dt>Duration</dt><dd>{course.duration}</dd></div>
            <div><dt>Learning format</dt><dd>{course.mode === "online" ? "Online" : course.mode}</dd></div>
            <div><dt>Prerequisites</dt><dd>{brandText(course.prerequisites)}</dd></div>
            <div><dt>Training type</dt><dd>{trainingLabel}</dd></div>
            <div><dt>Price</dt><dd>{/pending/i.test(course.price) ? "To be announced" : formatPrice(course.price)}</dd></div>
          </dl>
          {course.accessInstructions && <p className={styles.speaker}>{brandText(course.accessInstructions)}</p>}
          <CourseEnrolActions slug={course.slug} />
        </section>
      </div>
    </main>
  );
}
