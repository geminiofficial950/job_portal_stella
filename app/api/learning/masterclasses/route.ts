import { NextResponse } from "next/server";
import { ensureLearningSeeded } from "@/lib/learningStore";
import { Masterclass } from "@/models/Learning";

export async function GET(request: Request) {
  try {
    await ensureLearningSeeded();
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get("topic")?.trim() || "";
    const view = searchParams.get("view")?.trim() || "upcoming"; // upcoming | replay | all

    const filter: Record<string, unknown> = { published: true };
    if (topic) filter.topic = new RegExp(`^${topic}$`, "i");
    if (view === "replay") filter.isReplay = true;
    if (view === "upcoming") {
      filter.isReplay = { $ne: true };
      filter.startsAt = { $gte: new Date() };
      filter.bookingStatus = { $nin: ["cancelled"] };
    }

    const items = await Masterclass.find(filter).sort({ startsAt: 1 }).lean();
    return NextResponse.json({
      success: true,
      items: items.map((m) => ({
        id: String(m._id),
        slug: m.slug,
        title: m.title,
        outcome: m.outcome,
        speaker: m.speaker,
        speakerBackground: m.speakerBackground,
        startsAt: m.startsAt,
        timeZone: m.timeZone,
        durationMinutes: m.durationMinutes,
        format: m.format,
        venueOrLink: m.venueOrLink,
        capacity: m.capacity,
        bookedCount: m.bookedCount,
        seatsLeft: Math.max(0, (m.capacity || 0) - (m.bookedCount || 0)),
        price: m.price,
        bookingStatus: m.bookingStatus,
        topic: m.topic,
        isReplay: m.isReplay,
        pendingOwnerContent: m.pendingOwnerContent,
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Failed to load masterclasses" },
      { status: 500 },
    );
  }
}
