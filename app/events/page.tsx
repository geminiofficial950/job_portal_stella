import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  MapPin,
  Users,
} from "lucide-react";
import { ensureLearningSeeded } from "@/lib/learningStore";
import { formatPrice, formatWhen } from "@/lib/stellaContent";
import {
  LEARNING_CARD_THEMES,
  LEARNING_PAGE_BG,
} from "@/lib/learningCardThemes";
import { ProfessionalEvent } from "@/models/Learning";

export const metadata = { title: "Events — Stella Careers" };

type Props = {
  searchParams: Promise<{ industry?: string; format?: string; region?: string }>;
};

export default async function EventsPage({ searchParams }: Props) {
  const sp = await searchParams;
  await ensureLearningSeeded();
  const filter: Record<string, unknown> = {
    published: true,
    startsAt: { $gte: new Date() },
  };
  if (sp.industry) filter.industry = new RegExp(sp.industry, "i");
  if (sp.format) filter.format = sp.format;
  if (sp.region) filter.region = sp.region;

  const items = await ProfessionalEvent.find(filter)
    .sort({ startsAt: 1 })
    .lean();

  const filters = [
    {
      href: "/events",
      label: "All upcoming",
      active: !sp.format && !sp.region && !sp.industry,
    },
    {
      href: "/events?format=online",
      label: "Online",
      active: sp.format === "online",
    },
    {
      href: "/events?format=in-person",
      label: "In person",
      active: sp.format === "in-person",
    },
    {
      href: "/events?region=au",
      label: "Australia",
      active: sp.region === "au",
    },
  ];

  return (
    <main className="relative min-h-[70vh] overflow-hidden">
      <div aria-hidden className={LEARNING_PAGE_BG} />

      <div className="relative mx-auto max-w-[1400px] px-4 py-12 sm:px-8 lg:px-10">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-[#0f2744] sm:text-4xl">
            Events
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
            Filter by industry, format and region. External bookings are
            labelled — external clicks are not Stella attendance.
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
            No events in this filter.{" "}
            <Link href="/profile/setup" className="font-semibold text-[#2563eb]">
              Build your free profile
            </Link>{" "}
            while events are prepared.
          </p>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((ev, i) => {
              const theme = LEARNING_CARD_THEMES[i % LEARNING_CARD_THEMES.length];
              const when = formatWhen(
                new Date(ev.startsAt).toISOString(),
                ev.timeZone,
              );
              const hostedLabel =
                ev.hostedBy === "stella" ? "Stella hosted" : "External booking";
              return (
                <article
                  key={String(ev._id)}
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
                      <Users className="h-6 w-6" strokeWidth={1.75} />
                    </div>
                    {ev.pendingOwnerContent ? (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                        Pending owner content
                      </span>
                    ) : (
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${theme.chip}`}
                      >
                        {hostedLabel}
                      </span>
                    )}
                  </div>

                  <h2 className="relative mt-4 text-xl font-bold leading-snug text-[#0f2744]">
                    {ev.title}
                  </h2>
                  <p className="relative mt-2 flex-1 text-sm leading-relaxed text-slate-500">
                    {ev.industry}
                    {ev.format ? ` · ${String(ev.format).replace(/-/g, " ")}` : ""}
                  </p>

                  <div className="relative mt-4 space-y-2 text-sm text-slate-600">
                    <p className="flex items-start gap-2">
                      <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <span>{ev.organiser}</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <span>{ev.location}</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <span>{when}</span>
                    </p>
                    <p className="font-semibold text-[#0f2744]">
                      {formatPrice(ev.price)}
                    </p>
                  </div>

                  <div className="relative mt-5 flex justify-end">
                    <Link
                      href={`/events/${ev.slug}`}
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
