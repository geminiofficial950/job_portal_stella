import Link from "next/link";
import { notFound } from "next/navigation";
import { ensureLearningSeeded } from "@/lib/learningStore";
import { formatPrice, formatWhen } from "@/lib/stellaContent";
import { ProfessionalEvent } from "@/models/Learning";
import InterestForm from "@/app/components/InterestForm";

type Props = { params: Promise<{ id: string }> };

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  await ensureLearningSeeded();
  let event: any = await ProfessionalEvent.findOne({
    slug: id,
    published: true,
  }).lean();
  if (!event && /^[a-f\d]{24}$/i.test(id)) {
    event = await ProfessionalEvent.findById(id).lean();
  }
  if (!event) notFound();

  const external = event.hostedBy === "external";

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
      <Link href="/events" className="text-sm text-[#2563eb]">
        ← All events
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-[#0f2744]">{event.title}</h1>
      <p className="mt-2 text-slate-500">
        {external
          ? "External event — booking is with the organiser. Clicks are not counted as Stella bookings or attendance."
          : "Hosted by Stella Careers."}
      </p>
      <div className="mt-6 rounded-[22px] border border-slate-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
        <p>Organiser: {event.organiser}</p>
        <p>Industry: {event.industry}</p>
        <p>Location: {event.location}</p>
        <p>
          {formatWhen(new Date(event.startsAt).toISOString(), event.timeZone)} (
          {event.timeZone})
        </p>
        <p>Format: {event.format}</p>
        <p>Accessibility: {event.accessibility}</p>
        <p>Price: {formatPrice(event.price)}</p>
      </div>

      {event.bookingUrl ? (
        <a
          href={event.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex rounded-lg bg-[#00082C] px-4 py-2.5 text-sm font-semibold text-white"
        >
          {external ? "Book with organiser (external)" : "Book event"}
        </a>
      ) : (
        <p className="mt-4 text-sm text-amber-800">
          Booking URL pending owner content.
        </p>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-bold text-[#0f2744]">
          Register interest / contact organiser via Stella
        </h2>
        <InterestForm
          kind="event"
          itemId={event.slug}
          itemTitle={event.title}
        />
      </div>
    </main>
  );
}
