import { ensureLearningSeeded } from "@/lib/learningStore";
import {
  Masterclass,
  Course,
  ProfessionalEvent,
  SessionBooking,
  CourseEnrolment,
} from "@/models/Learning";
import Link from "next/link";

export default async function AdminLearningPage() {
  await ensureLearningSeeded();
  const [mcs, courses, events, bookings, enrolments] = await Promise.all([
    Masterclass.countDocuments(),
    Course.countDocuments(),
    ProfessionalEvent.countDocuments(),
    SessionBooking.countDocuments({ status: "confirmed" }),
    CourseEnrolment.countDocuments(),
  ]);

  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      <h1 className="text-2xl font-bold text-[#0f172a]">Learning admin</h1>
      <p className="mt-1 text-sm text-slate-500">
        A01 — catalog is seeded from configurable content. Edit records in Mongo
        or update <code>lib/stellaContent.ts</code> and reseed empty DB. Full
        CMS editors can replace this panel without a code deploy later.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Masterclasses", mcs, "/masterclasses"],
          ["Courses", courses, "/courses"],
          ["Events", events, "/events"],
          ["Confirmed bookings", bookings, "/masterclasses"],
          ["Course enrolments", enrolments, "/courses"],
        ].map(([label, count, href]) => (
          <Link
            key={String(label)}
            href={String(href)}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-bold text-[#0f172a]">{count}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
