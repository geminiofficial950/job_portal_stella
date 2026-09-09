import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/requireApiAuth";
import { User } from "@/models/User";

/** C05 — discovery / pause controls */
export async function PUT(request: Request) {
  const result = await requireApiAuth(["user"]);
  if (result.error) return result.error;

  try {
    const body = await request.json();
    await connectDB();

    const discoverable = Boolean(body.discoverable);
    const discoveryPaused = Boolean(body.discoveryPaused);
    // Re-enable requires deliberate action: cannot set discoverable true while paused
    if (discoverable && discoveryPaused) {
      return NextResponse.json(
        {
          success: false,
          message: "Unpause discovery before making your profile discoverable",
        },
        { status: 400 },
      );
    }

    const user = await User.findByIdAndUpdate(
      result.auth.sub,
      {
        $set: {
          "seekerProfile.discoverable": discoverable,
          "seekerProfile.discoveryPaused": discoveryPaused,
          "seekerProfile.availabilityNote": String(
            body.availabilityNote || "",
          ).slice(0, 300),
          "seekerProfile.availabilityConfirmedAt": body.confirmAvailability
            ? new Date()
            : undefined,
          "seekerProfile.openToWork": discoverable && !discoveryPaused,
        },
      },
      { new: true },
    ).select("seekerProfile");

    return NextResponse.json({
      success: true,
      discovery: {
        discoverable: user?.seekerProfile?.discoverable ?? false,
        discoveryPaused: user?.seekerProfile?.discoveryPaused ?? false,
        availabilityNote: user?.seekerProfile?.availabilityNote || "",
        availabilityConfirmedAt:
          user?.seekerProfile?.availabilityConfirmedAt || null,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Failed to update discovery" },
      { status: 500 },
    );
  }
}
