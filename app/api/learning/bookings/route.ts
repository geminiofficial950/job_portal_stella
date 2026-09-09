import { NextResponse } from "next/server";
import { ensureLearningSeeded, makeRef } from "@/lib/learningStore";
import { requireApiAuth } from "@/lib/requireApiAuth";
import { Masterclass, SessionBooking } from "@/models/Learning";

export async function POST(request: Request) {
  const result = await requireApiAuth(["user"]);
  if (result.error) return result.error;

  try {
    await ensureLearningSeeded();
    const body = await request.json();
    const slugOrId = String(body.masterclassId || body.slug || "").trim();
    if (!slugOrId) {
      return NextResponse.json(
        { success: false, message: "masterclassId required" },
        { status: 400 },
      );
    }

    const session =
      (await Masterclass.findOne({ slug: slugOrId })) ||
      (await Masterclass.findById(slugOrId).catch(() => null));

    if (!session || !session.published) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404 },
      );
    }

    if (
      session.bookingStatus === "cancelled" ||
      session.bookingStatus === "pending_content" ||
      session.pendingOwnerContent
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Booking is not open yet. Session is pending owner content or cancelled — register interest instead.",
        },
        { status: 400 },
      );
    }

    if (
      session.bookingStatus === "full" ||
      session.bookedCount >= session.capacity
    ) {
      return NextResponse.json(
        { success: false, message: "Session is full" },
        { status: 409 },
      );
    }

    const existing = await SessionBooking.findOne({
      userId: result.auth.sub,
      masterclassId: session._id,
      status: { $in: ["confirmed", "waitlist", "attended"] },
    });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "You already have a booking for this session",
          referenceId: existing.referenceId,
        },
        { status: 409 },
      );
    }

    const referenceId = makeRef("BK");
    const booking = await SessionBooking.create({
      referenceId,
      userId: result.auth.sub,
      masterclassId: session._id,
      status: "confirmed",
      calendarNote: `${session.title} — ${session.startsAt.toISOString()} (${session.timeZone})`,
    });

    session.bookedCount = (session.bookedCount || 0) + 1;
    if (session.bookedCount >= session.capacity) {
      session.bookingStatus = "full";
    } else if (session.bookingStatus === "interest") {
      session.bookingStatus = "open";
    }
    await session.save();

    return NextResponse.json({
      success: true,
      referenceId: booking.referenceId,
      status: booking.status,
      timeZone: session.timeZone,
      startsAt: session.startsAt,
      calendarNote: booking.calendarNote,
      message:
        "Booking confirmed. Reminder emails follow your L07 preference settings.",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Booking failed" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const result = await requireApiAuth(["user"]);
  if (result.error) return result.error;

  try {
    const referenceId =
      new URL(request.url).searchParams.get("ref")?.trim() || "";
    if (!referenceId) {
      return NextResponse.json(
        { success: false, message: "ref required" },
        { status: 400 },
      );
    }

    const booking = await SessionBooking.findOne({
      referenceId,
      userId: result.auth.sub,
    });
    if (!booking || booking.status === "cancelled") {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 },
      );
    }

    booking.status = "cancelled";
    await booking.save();

    const session = await Masterclass.findById(booking.masterclassId);
    if (session && session.bookedCount > 0) {
      session.bookedCount -= 1;
      if (session.bookingStatus === "full") session.bookingStatus = "open";
      await session.save();
    }

    return NextResponse.json({
      success: true,
      referenceId,
      status: "cancelled",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Cancel failed" },
      { status: 500 },
    );
  }
}
