import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Clock3,
  Monitor,
} from "lucide-react";
import { ensureLearningSeeded } from "@/lib/learningStore";
import { formatPrice } from "@/lib/stellaContent";
import {
  LEARNING_CARD_THEMES,
  LEARNING_PAGE_BG,
} from "@/lib/learningCardThemes";
import { Course } from "@/models/Learning";

export const metadata = { title: "Courses — Stella Careers" };

export default async function CoursesPage() {
  await ensureLearningSeeded();
  const items = await Course.find({ published: true }).sort({ title: 1 }).lean();

  return (
    <main className="relative min-h-[70vh] overflow-hidden">
      <div aria-hidden className={LEARNING_PAGE_BG} />

      <div className="relative mx-auto max-w-[1400px] px-4 py-12 sm:px-8 lg:px-10">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-[#0f2744] sm:text-4xl">
            Courses
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
            Distinguish qualifications, accredited training and non-accredited
            development before enrolling. Every course states training type and
            price.
          </p>
        </div>

        {items.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-slate-300/80 bg-white/60 p-6 text-sm text-slate-500">
            No courses published yet.{" "}
            <Link href="/profile/setup" className="font-semibold text-[#2563eb]">
              Build your free profile
            </Link>{" "}
            while courses are prepared.
          </p>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((c, i) => {
              const theme = LEARNING_CARD_THEMES[i % LEARNING_CARD_THEMES.length];
              const trainingLabel = `${String(c.trainingType || "").replace(/-/g, " ")}${
                c.nationallyRecognised ? " · nationally recognised claim" : ""
              }`;
              return (
                <article
                  key={String(c._id)}
                  className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-white/80 bg-white/65 p-5 backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/80 sm:p-6"
                >
                  <div
                    aria-hidden
                    className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${theme.glow} blur-2xl`}
                  />

                  <div className="relative flex items-start justify-between gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${theme.iconBg}`}
                    >
                      <BookOpen className="h-6 w-6" strokeWidth={1.75} />
                    </div>
                    {c.pendingOwnerContent ? (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                        Pending owner content
                      </span>
                    ) : (
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${theme.chip}`}
                      >
                        {trainingLabel}
                      </span>
                    )}
                  </div>

                  <h2 className="relative mt-4 text-xl font-bold leading-snug text-[#0f2744]">
                    {c.title}
                  </h2>
                  <p className="relative mt-2 flex-1 text-sm leading-relaxed text-slate-500">
                    {c.outcome}
                  </p>

                  <div className="relative mt-4 space-y-2 text-sm text-slate-600">
                    <p className="flex items-start gap-2">
                      <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <span>{c.duration}</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <Monitor className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <span className="capitalize">{c.mode}</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <span>{c.provider}</span>
                    </p>
                    <p className="font-semibold text-[#0f2744]">
                      {formatPrice(c.price)}
                    </p>
                  </div>

                  <div className="relative mt-5 flex justify-end">
                    <Link
                      href={`/courses/${c.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#00082C] px-4 py-2.5 text-sm font-bold !text-white transition hover:bg-[#00061F]"
                      style={{ color: "#ffffff" }}
                    >
                      View more
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
