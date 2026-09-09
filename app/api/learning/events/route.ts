import { NextResponse } from "next/server";
import { ensureLearningSeeded } from "@/lib/learningStore";
import { ProfessionalEvent } from "@/models/Learning";

export async function GET(request: Request) {
  try {
    await ensureLearningSeeded();
    const { searchParams } = new URL(request.url);
    const industry = searchParams.get("industry")?.trim() || "";
    const format = searchParams.get("format")?.trim() || "";
    const region = searchParams.get("region")?.trim() || "";

    const filter: Record<string, unknown> = {
      published: true,
      startsAt: { $gte: new Date() },
    };
    if (industry) filter.industry = new RegExp(industry, "i");
    if (format) filter.format = format;
    if (region) filter.region = region;

    const items = await ProfessionalEvent.find(filter)
      .sort({ startsAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      items: items.map((e) => ({
        id: String(e._id),
        slug: e.slug,
        title: e.title,
        organiser: e.organiser,
        industry: e.industry,
        location: e.location,
        region: e.region,
        startsAt: e.startsAt,
        timeZone: e.timeZone,
        format: e.format,
        accessibility: e.accessibility,
        price: e.price,
        hostedBy: e.hostedBy,
        bookingUrl: e.bookingUrl,
        externalBooking: e.hostedBy === "external",
        pendingOwnerContent: e.pendingOwnerContent,
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Failed to load events" },
      { status: 500 },
    );
  }
}
