import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/requireApiAuth";
import { User, serializeRecruiterSettings } from "@/models/User";

function badRequest(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(request: Request) {
  const result = await requireApiAuth(["recruiter"]);
  if (result.error) return result.error;

  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const access = String(body.access ?? "viewer");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return badRequest("Valid email is required");
    }
    if (access !== "viewer" && access !== "editor") {
      return badRequest("Access must be viewer or editor");
    }

    await connectDB();
    const user = await User.findById(result.auth.sub);
    if (!user || !user.isActive) {
      return badRequest("User not found", 404);
    }

    if (email === user.email) {
      return badRequest("You cannot invite your own account");
    }

    const invites = user.settings?.teamInvites || [];
    if (invites.some((invite) => invite.email === email)) {
      return badRequest("This email is already invited", 409);
    }
    if (invites.length >= 10) {
      return badRequest("Maximum 10 team invites allowed");
    }

    const updated = await User.findByIdAndUpdate(
      result.auth.sub,
      {
        $push: {
          "settings.teamInvites": {
            email,
            access,
            status: "pending",
            invitedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!updated) {
      return badRequest("User not found", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Team invite added",
      settings: serializeRecruiterSettings(updated),
    });
  } catch (error) {
    console.error("Team invite POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to invite teammate" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const result = await requireApiAuth(["recruiter"]);
  if (result.error) return result.error;

  try {
    const { searchParams } = new URL(request.url);
    const inviteId = searchParams.get("id");
    const email = searchParams.get("email")?.toLowerCase();

    if (!inviteId && !email) {
      return badRequest("Invite id or email is required");
    }

    await connectDB();

    const pullQuery = inviteId
      ? { "settings.teamInvites": { _id: inviteId } }
      : { "settings.teamInvites": { email } };

    const updated = await User.findByIdAndUpdate(
      result.auth.sub,
      { $pull: pullQuery },
      { new: true }
    );

    if (!updated) {
      return badRequest("User not found", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Invite removed",
      settings: serializeRecruiterSettings(updated),
    });
  } catch (error) {
    console.error("Team invite DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to remove invite" },
      { status: 500 }
    );
  }
}
