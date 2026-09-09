import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/requireApiAuth";
import { makeRef } from "@/lib/learningStore";
import { Company } from "@/models/Company";
import { User } from "@/models/User";
import { InterviewInvitation } from "@/models/Recruitment";

/** E04 — interview invitations */
export async function POST(request: Request) {
  const result = await requireApiAuth(["recruiter"]);
  if (result.error) return result.error;

  try {
    const body = await request.json();
    const seekerId = String(body.seekerId || "").trim();
    const roleTitle = String(body.roleTitle || "").trim();
    const proposedTimes = Array.isArray(body.proposedTimes)
      ? body.proposedTimes.map((t: unknown) => String(t))
      : [];
    const contactMethod = String(body.contactMethod || "platform");

    if (!seekerId || !roleTitle) {
      return NextResponse.json(
        { success: false, message: "seekerId and roleTitle required" },
        { status: 400 },
      );
    }

    await connectDB();
    const company = await Company.findOne({ ownerId: result.auth.sub });
    if (!company || company.status !== "approved") {
      return NextResponse.json(
        { success: false, message: "Approved company required" },
        { status: 403 },
      );
    }

    const seeker = await User.findOne({
      _id: seekerId,
      role: "user",
      "seekerProfile.discoverable": true,
      "seekerProfile.discoveryPaused": { $ne: true },
    });
    if (!seeker) {
      return NextResponse.json(
        { success: false, message: "Candidate not discoverable" },
        { status: 404 },
      );
    }

    const dup = await InterviewInvitation.findOne({
      recruiterId: result.auth.sub,
      seekerId,
      roleTitle,
      status: "invited",
    });
    if (dup) {
      return NextResponse.json(
        {
          success: false,
          message: "Duplicate invitation already open",
          referenceId: dup.referenceId,
        },
        { status: 409 },
      );
    }

    const invite = await InterviewInvitation.create({
      referenceId: makeRef("IV"),
      recruiterId: result.auth.sub,
      companyId: company._id,
      seekerId,
      roleTitle,
      employerName: company.name,
      proposedTimes,
      contactMethod,
      status: "invited",
      contactReleased: false,
    });

    return NextResponse.json({
      success: true,
      referenceId: invite.referenceId,
      status: invite.status,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Invite failed" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const result = await requireApiAuth(["user", "recruiter"]);
  if (result.error) return result.error;

  try {
    const body = await request.json();
    const referenceId = String(body.referenceId || "").trim();
    const status = String(body.status || "").trim();
    const seekerMessage = String(body.seekerMessage || "").trim();

    if (
      !referenceId ||
      !["accepted", "declined", "reschedule_suggested", "cancelled"].includes(
        status,
      )
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid update" },
        { status: 400 },
      );
    }

    await connectDB();
    const invite = await InterviewInvitation.findOne({ referenceId });
    if (!invite) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 },
      );
    }

    const isSeeker = String(invite.seekerId) === result.auth.sub;
    const isRecruiter = String(invite.recruiterId) === result.auth.sub;
    if (!isSeeker && !isRecruiter && result.auth.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    if (isSeeker && ["accepted", "declined", "reschedule_suggested"].includes(status)) {
      invite.status = status as typeof invite.status;
      invite.seekerMessage = seekerMessage;
      if (status === "accepted") invite.contactReleased = true;
    } else if (isRecruiter && status === "cancelled") {
      invite.status = "cancelled";
    } else {
      return NextResponse.json(
        { success: false, message: "Action not allowed for this role" },
        { status: 403 },
      );
    }

    await invite.save();
    return NextResponse.json({
      success: true,
      referenceId: invite.referenceId,
      status: invite.status,
      contactReleased: invite.contactReleased,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Update failed" },
      { status: 500 },
    );
  }
}
