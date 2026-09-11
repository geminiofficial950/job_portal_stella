import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  GraduationCap,
  Mic2,
  ArrowRight,
} from "lucide-react";
import { ensureLearningSeeded } from "@/lib/learningStore";
import { formatPrice, formatWhen } from "@/lib/stellaContent";
import {
  LEARNING_CARD_THEMES,
  LEARNING_PAGE_BG,
} from "@/lib/learningCardThemes";
import { Masterclass } from "@/models/Learning";

export const metadata = { title: "Masterclasses — Gemini Jobs" };

type Props = { searchParams: Promise<{ topic?: string; view?: string }> };

export default async function MasterclassesPage({ searchParams }: Props) {
  const sp = await searchParams;
  await ensureLearningSeeded();

  const view = sp.view === "replay" ? "replay" : "upcoming";
  const filter: Record<string, unknown> = { published: true };
  if (sp.topic) filter.topic = new RegExp(`^${sp.topic}$`, "i");
  if (view === "replay") filter.isReplay = true;
  else {
    filter.isReplay = { $ne: true };
    filter.startsAt = { $gte: new Date() };
  }

  const items = await Masterclass.find(filter).sort({ startsAt: 1 }).lean();
  const topics = await Masterclass.distinct("topic", { published: true });

  const filters = [
    {
      href: "/masterclasses?view=upcoming",
      label: "Upcoming",
      active: view === "upcoming" && !sp.topic,
    },
    {
      href: "/masterclasses?view=replay",
      label: "Replay",
      active: view === "replay" && !sp.topic,
    },
    ...topics.map((t) => ({
      href: `/masterclasses?topic=${encodeURIComponent(String(t))}`,
      label: String(t),
      active: sp.topic?.toLowerCase() === String(t).toLowerCase(),
    })),
  ];

  return (
    <main className="relative min-h-[70vh] overflow-hidden">
      <div aria-hidden className={LEARNING_PAGE_BG} />

      <div className="relative mx-auto max-w-[1400px] px-4 py-12 sm:px-8 lg:px-10">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-[#0f2744] sm:text-4xl">
            Masterclasses
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
            Speaker, outcome, time and price are shown before booking. Filter
            by topic or upcoming/replay.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {filters.map((f) => (
            <Link
              key={f.href + f.label}
              href={f.href}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                f.active
                  ? "bg-[#00082C] text-white shadow-sm"
                  : "border border-white/80 bg-white/70 text-slate-600 hover:bg-white"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {items.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-slate-300/80 bg-white/60 p-6 text-sm text-slate-500">
            No sessions in this filter.{" "}
            <Link href="/profile/setup" className="font-semibold text-[#2563eb]">
              Build your free profile
            </Link>{" "}
            while sessions are prepared.
          </p>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((m, i) => {
              const theme =
                LEARNING_CARD_THEMES[i % LEARNING_CARD_THEMES.length];
              const when = formatWhen(
                new Date(m.startsAt).toISOString(),
                m.timeZone,
              );
              return (
                <article
                  key={String(m._id)}
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
                      <GraduationCap className="h-6 w-6" strokeWidth={1.75} />
                    </div>
                    {m.pendingOwnerContent ? (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                        Pending owner content
                      </span>
                    ) : (
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${theme.chip}`}
                      >
                        {m.topic || "Session"}
                      </span>
                    )}
                  </div>

                  <h2 className="relative mt-4 text-xl font-bold leading-snug text-[#0f2744]">
                    {m.title}
                  </h2>
                  <p className="relative mt-2 flex-1 text-sm leading-relaxed text-slate-500">
                    {m.outcome}
                  </p>

                  <div className="relative mt-4 space-y-2 text-sm text-slate-600">
                    <p className="flex items-start gap-2">
                      <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <span>{when}</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <Mic2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <span>{m.speaker}</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <span className="font-semibold text-[#0f2744]">
                        {formatPrice(m.price)}
                      </span>
                    </p>
                  </div>

                  <div className="relative mt-5 flex justify-end">
                    <Link
                      href={`/masterclasses/${m.slug}`}
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
