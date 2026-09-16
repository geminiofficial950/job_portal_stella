import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import styles from "@/app/components/LearningDetail.module.css";
import { notFound } from "next/navigation";
import { ensureLearningSeeded } from "@/lib/learningStore";
import { formatPrice } from "@/lib/stellaContent";
import { Masterclass } from "@/models/Learning";
import InterestForm from "@/app/components/InterestForm";
import SessionBookingActions from "@/app/components/SessionBookingActions";

type Props = { params: Promise<{ id: string }> };
type SessionDetails = {
  slug: string; title: string; outcome: string; startsAt: Date; timeZone: string;
  speaker: string; speakerBackground: string; durationMinutes: number; format: string;
  price: string; bookedCount: number; capacity: number; bookingStatus: string;
  venueOrLink: string; pendingOwnerContent: boolean;
};

export default async function MasterclassDetailPage({ params }: Props) {
  const { id } = await params;
  await ensureLearningSeeded();
  let session = await Masterclass.findOne({
    slug: id,
    published: true,
  }).lean<SessionDetails>();
  if (!session && /^[a-f\d]{24}$/i.test(id)) {
    session = await Masterclass.findById(id).lean<SessionDetails>();
  }
  if (!session) notFound();

  const when = new Intl.DateTimeFormat("en-AU", {
    day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit",
    timeZone: session.timeZone,
  }).format(new Date(session.startsAt));
  const bookingOpen =
    !session.pendingOwnerContent &&
    session.bookingStatus !== "pending_content" &&
    session.bookingStatus !== "cancelled" &&
    session.bookingStatus !== "full";

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link href="/masterclasses" className={styles.back}><ArrowLeft size={16} /> All masterclasses</Link>
        <header className={styles.intro}>
          <h1>{session.title}</h1>
          <p>{session.outcome}</p>
        </header>

        <div className={styles.split}>
          <div className={styles.visual}>
            <Image src="/assets/paths-seeker-consultant.png" alt="" fill
              sizes="(max-width: 767px) 100vw, (max-width: 1208px) 50vw, 580px"
              className={styles.image} />
            <div className={styles.caption}>
              <span>GEMINI JOBS · MASTERCLASSES</span>
              <p>Your next step starts with learning.</p>
            </div>
          </div>
          <section className={styles.form} aria-labelledby="register-interest-title">
            <h2 id="register-interest-title">Register your interest</h2>
            <p>Leave your details and any questions about this masterclass.</p>
            <InterestForm kind="masterclass" itemId={session.slug} itemTitle={session.title} />
          </section>
        </div>

        <section className={styles.information} aria-labelledby="session-details-title">
          <h2 id="session-details-title">About this masterclass</h2>
          <dl className={styles.details}>
            <div><dt>Date & time</dt><dd>{when}<br />{session.timeZone}</dd></div>
            <div><dt>Duration & format</dt><dd>{session.durationMinutes} minutes · {session.format === "in-person" ? "In person" : "Online"}</dd></div>
            <div><dt>Price</dt><dd>{/pending/i.test(session.price) ? "To be announced" : formatPrice(session.price)}</dd></div>
            <div><dt>Speaker</dt><dd>{/pending/i.test(session.speaker) ? "To be announced" : session.speaker}</dd></div>
            <div><dt>Capacity</dt><dd>{session.bookedCount} / {session.capacity} booked</dd></div>
            <div><dt>Booking status</dt><dd>{session.bookingStatus === "pending_content" ? "Details being confirmed" : session.bookingStatus.replaceAll("_", " ")}</dd></div>
          </dl>
          {session.speakerBackground && !/pending/i.test(session.speakerBackground) && (
            <p className={styles.speaker}>{session.speakerBackground}</p>
          )}
          {session.pendingOwnerContent && <p className={styles.status}>Session details are being confirmed. Interest registration is open.</p>}
          <SessionBookingActions slug={session.slug} title={session.title} bookingOpen={bookingOpen} />
        </section>
      </div>
    </main>
  );
}
