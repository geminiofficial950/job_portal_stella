import { brandText } from "@/app/components/brandText";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ensureLearningSeeded } from "@/lib/learningStore";
import { formatPrice } from "@/lib/stellaContent";
import { ProfessionalEvent } from "@/models/Learning";
import InterestForm from "@/app/components/InterestForm";
import { ArrowLeft, ArrowUpRight, CalendarDays, Users, Accessibility, Ticket, Info, MessageSquare, Building2 } from "lucide-react";
import styles from "./EventDetail.module.css";

type Props = { params: Promise<{ id: string }> };
type EventDetails = {
  slug: string;
  title: string;
  organiser: string;
  industry: string;
  location: string;
  startsAt: Date;
  timeZone: string;
  format: "in-person" | "online" | "hybrid";
  accessibility: string;
  price: string;
  hostedBy: string;
  bookingUrl?: string;
};

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  await ensureLearningSeeded();
  let event = await ProfessionalEvent.findOne({
    slug: id,
    published: true,
  }).lean<EventDetails>();
  if (!event && /^[a-f\d]{24}$/i.test(id)) {
    event = await ProfessionalEvent.findById(id).lean<EventDetails>();
  }
  if (!event) notFound();

  const external = event.hostedBy === "external";

  const when = new Intl.DateTimeFormat("en-AU", {
    day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit",
    timeZone: event.timeZone,
  }).format(new Date(event.startsAt));
  const details = [
    { icon: CalendarDays, label: "Date & time", value: `${when} (${event.timeZone})` },
    { icon: Users, label: "Format & industry", value: `${event.format === "in-person" ? "In person" : event.format === "online" ? "Online" : "Hybrid"} · ${event.industry}` },
    { icon: Building2, label: "Organiser", value: brandText(event.organiser) },
    { icon: Ticket, label: "Price", value: /pending/i.test(event.price) ? "To be announced" : formatPrice(event.price) },
    { icon: Accessibility, label: "Accessibility", value: !event.accessibility || /pending/i.test(event.accessibility) ? "Contact us for accessibility details" : event.accessibility },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link href="/events" className={styles.back}><ArrowLeft size={16} /> All events</Link>
        <div className={styles.layout}>
          <section aria-labelledby="event-title">
            <span className={styles.badge}><CalendarDays size={14} /> Careers & connections</span>
            <h1 id="event-title" className={styles.title}>{event.title}</h1>
            <p className={styles.intro}>
              {external ? "An event hosted by an external organiser. Bookings are managed directly by the organiser." : "Hosted by Gemini Jobs."}
            </p>
            <section className={styles.details} aria-labelledby="event-details-title">
              <h2 id="event-details-title">Event details</h2>
              <dl>
                {details.map(({ icon: Icon, label, value }) => (
                  <div key={label} className={styles.detail}>
                    <span className={styles.detailIcon}><Icon size={18} aria-hidden="true" /></span>
                    <div><dt>{label}</dt><dd>{value}</dd></div>
                  </div>
                ))}
              </dl>
            </section>
            {event.bookingUrl ? (
              <a href={event.bookingUrl} target="_blank" rel="noopener noreferrer" className={styles.booking}>
                {external ? "Book with organiser" : "Book event"}<ArrowUpRight size={17} />
              </a>
            ) : (
              <p className={styles.notice}><Info size={16} />Booking details are coming soon. You can register your interest or send us a question in the meantime.</p>
            )}
          </section>
          <section className={styles.card} aria-labelledby="interest-title">
            <div className={styles.formIcon}><MessageSquare size={23} aria-hidden="true" /></div>
            <h2 id="interest-title">Interested in joining?</h2>
            <p>Leave your details or ask a question. Your enquiry will be registered with Gemini Jobs.</p>
            <InterestForm kind="event" itemId={event.slug} itemTitle={event.title} />
          </section>
        </div>
      </div>
    </main>
  );
}
