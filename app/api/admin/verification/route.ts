import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/requireApiAuth";
import {
  VerificationRequest,
  VERIFICATION_STATUSES,
} from "@/models/VerificationRequest";
import { User } from "@/models/User";

/** V04 — admin/reviewer queue */
export async function GET() {
  const result = await requireApiAuth(["admin"]);
  if (result.error) return result.error;

  await connectDB();
  const items = await VerificationRequest.find({})
    .sort({ updatedAt: -1 })
    .limit(100)
    .lean();

  return NextResponse.json({
    success: true,
    items: items.map((d) => ({
      referenceId: d.referenceId,
      name: d.name,
      email: d.email,
      status: d.status,
      checkTypes: d.checkTypes,
      candidateNextAction: d.candidateNextAction,
      assignedReviewerId: d.assignedReviewerId,
      claims: d.claims,
      evidenceCount: (d.evidenceDocuments || []).length,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    })),
    statuses: VERIFICATION_STATUSES,
  });
}

/** Update claim/request status — authorised reviewers only */
export async function PATCH(request: Request) {
  const result = await requireApiAuth(["admin"]);
  if (result.error) return result.error;

  try {
    const body = await request.json();
    const referenceId = String(body.referenceId || "").trim();
    const claimId = String(body.claimId || "").trim();
    const toStatus = String(body.status || "").trim();
    const reason = String(body.reason || "").trim();
    const candidateExplanation = String(body.candidateExplanation || "").trim();
    const privateNotes = String(body.privateNotes || "").trim();
    const resultScope = String(body.resultScope || "").trim();

    if (!referenceId || !VERIFICATION_STATUSES.includes(toStatus as never)) {
      return NextResponse.json(
        { success: false, message: "referenceId and valid status required" },
        { status: 400 },
      );
    }

    // Uploading alone cannot verify — require explicit reviewer action + reason for verified
    if (toStatus === "verified" && !reason) {
      return NextResponse.json(
        {
          success: false,
          message: "Verified results require a method/reason. File upload alone is not enough.",
        },
        { status: 400 },
      );
    }

    await connectDB();
    const doc = await VerificationRequest.findOne({ referenceId });
    if (!doc) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 },
      );
    }

    doc.assignedReviewerId = (doc.assignedReviewerId ||
      result.auth.sub) as typeof doc.assignedReviewerId;

    if (claimId) {
      const claim = doc.claims.id(claimId);
      if (!claim) {
        return NextResponse.json(
          { success: false, message: "Claim not found" },
          { status: 404 },
        );
      }
      const from = claim.result;
      claim.result = toStatus as typeof claim.result;
      claim.checkedAt = new Date();
      claim.reviewerId = result.auth.sub as never;
      if (candidateExplanation) claim.candidateExplanation = candidateExplanation;
      if (privateNotes) claim.privateNotes = privateNotes;
      if (resultScope) claim.resultScope = resultScope;
      if (reason) claim.method = reason;
      claim.history.push({
        at: new Date(),
        by: result.auth.email,
        from,
        to: toStatus,
        reason: reason || candidateExplanation || "Status updated",
      });
    }

    const prev = doc.status;
    doc.status = toStatus as typeof doc.status;
    doc.candidateNextAction =
      toStatus === "more_information_needed"
        ? "Provide the evidence requested by the reviewer"
        : toStatus === "verified"
          ? "No action — claim verified for the stated scope"
          : toStatus === "unable_to_verify" || toStatus === "discrepancy_found"
            ? "Review explanation and request correction if needed"
            : "Awaiting review";

    if (!doc.claims.length) {
      // ensure history on request-level notes via a synthetic claim history not required
    }

    await doc.save();

    if (doc.userId) {
      const anyVerified = doc.claims.some((c) => c.result === "verified");
      const anyPending = doc.claims.some((c) =>
        ["submitted", "in_review", "more_information_needed"].includes(c.result),
      );
      await User.findByIdAndUpdate(doc.userId, {
        $set: {
          "seekerProfile.credentialStatus": anyVerified
            ? anyPending
              ? "partial"
              : "verified"
            : anyPending
              ? "pending"
              : "none",
        },
      });
    }

    return NextResponse.json({
      success: true,
      referenceId,
      status: doc.status,
      previousStatus: prev,
      candidateNextAction: doc.candidateNextAction,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Update failed" },
      { status: 500 },
    );
  }
}
