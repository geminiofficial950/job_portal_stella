import { connectDB } from "@/lib/db";
import {
  MASTERCLASSES,
  COURSES,
  EVENTS,
} from "@/lib/stellaContent";
import {
  Masterclass,
  Course,
  ProfessionalEvent,
} from "@/models/Learning";

/** Seed Mongo from stellaContent if empty (A01-ready catalog). */
export async function ensureLearningSeeded() {
  await connectDB();
  const [mc, co, ev] = await Promise.all([
    Masterclass.countDocuments(),
    Course.countDocuments(),
    ProfessionalEvent.countDocuments(),
  ]);

  if (mc === 0) {
    await Masterclass.insertMany(
      MASTERCLASSES.map((m) => ({
        slug: m.id,
        title: m.title,
        outcome: m.outcome,
        speaker: m.speaker,
        speakerBackground: m.speakerBackground,
        startsAt: new Date(m.startsAt),
        timeZone: m.timeZone,
        durationMinutes: m.durationMinutes,
        format: m.format,
        venueOrLink: m.venueOrLink,
        capacity: m.capacity,
        price: m.price,
        bookingStatus: m.bookingStatus,
        topic: m.topic,
        pendingOwnerContent: m.pendingOwnerContent ?? true,
        published: true,
        isReplay: false,
        bookedCount: 0,
      })),
    );
  }

  if (co === 0) {
    await Course.insertMany(
      COURSES.map((c) => ({
        slug: c.id,
        title: c.title,
        outcome: c.outcome,
        provider: c.provider,
        duration: c.duration,
        mode: c.mode,
        prerequisites: c.prerequisites,
        price: c.price,
        trainingType: c.trainingType,
        nationallyRecognised: c.trainingType !== "professional-development",
        accessInstructions: c.accessInstructions,
        pendingOwnerContent: c.pendingOwnerContent ?? true,
        published: true,
      })),
    );
  }

  if (ev === 0) {
    await ProfessionalEvent.insertMany(
      EVENTS.map((e) => ({
        slug: e.id,
        title: e.title,
        organiser: e.organiser,
        industry: e.industry,
        location: e.location,
        region: "au",
        startsAt: new Date(e.startsAt),
        timeZone: e.timeZone,
        format: e.format,
        accessibility: e.accessibility,
        price: e.price,
        hostedBy: e.hostedBy,
        bookingUrl: e.bookingUrl,
        pendingOwnerContent: e.pendingOwnerContent ?? true,
        published: true,
      })),
    );
  }
}

export function makeRef(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
