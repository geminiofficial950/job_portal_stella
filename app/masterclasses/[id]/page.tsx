import Link from "next/link";
import { notFound } from "next/navigation";
import { ensureLearningSeeded } from "@/lib/learningStore";
import { formatPrice, formatWhen } from "@/lib/stellaContent";
import { Masterclass } from "@/models/Learning";
import InterestForm from "@/app/components/InterestForm";
import SessionBookingActions from "@/app/components/SessionBookingActions";

type Props = { params: Promise<{ id: string }> };

export default async function MasterclassDetailPage({ params }: Props) {
  const { id } = await params;
  await ensureLearningSeeded();
  let session: any = await Masterclass.findOne({
    slug: id,
    published: true,
  }).lean();
  if (!session && /^[a-f\d]{24}$/i.test(id)) {
    session = await Masterclass.findById(id).lean();
  }
  if (!session) notFound();

  const startsAt = new Date(session.startsAt).toISOString();
  const bookingOpen =
    !session.pendingOwnerContent &&
    session.bookingStatus !== "pending_content" &&
    session.bookingStatus !== "cancelled" &&
    session.bookingStatus !== "full";

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
      <Link href="/masterclasses" className="text-sm text-[#2563eb]">
        ← All masterclasses
      </Link>
      {session.pendingOwnerContent ? (
        <p className="mt-3 text-xs font-bold uppercase text-amber-700">
          Pending owner content — not a confirmed live booking
        </p>
      ) : null}
      <h1 className="mt-2 text-3xl font-bold text-[#0f2744]">{session.title}</h1>
      <p className="mt-2 text-slate-500">{session.outcome}</p>
      <div className="mt-6 rounded-[22px] border border-slate-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
        <p>
          <strong>Speaker:</strong> {session.speaker}
        </p>
        <p className="mt-1">{session.speakerBackground}</p>
        <p className="mt-3">
          <strong>When:</strong> {formatWhen(startsAt, session.timeZone)} (
          {session.timeZone})
        </p>
        <p>
          <strong>Duration:</strong> {session.durationMinutes} minutes ·{" "}
          {session.format}
        </p>
        <p>
          <strong>Price:</strong> {formatPrice(session.price)}
        </p>
        <p>
          <strong>Capacity:</strong> {session.bookedCount}/{session.capacity} ·
          status {session.bookingStatus}
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Venue/link: {session.venueOrLink || "Provided after booking opens"}
        </p>
      </div>

      <SessionBookingActions
        slug={session.slug}
        title={session.title}
        bookingOpen={bookingOpen}
      />

      <div className="mt-8">
        <h2 className="text-lg font-bold text-[#0f2744]">Register interest</h2>
        <p className="text-sm text-slate-500">
          Use this if booking is not open. Interest is not a confirmed seat.
        </p>
        <InterestForm
          kind="masterclass"
          itemId={session.slug}
          itemTitle={session.title}
        />
      </div>
    </main>
  );
}
