import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthFromCookies } from "@/lib/auth";
import { requireApiAuth } from "@/lib/requireApiAuth";
import {
  VerificationRequest,
  VERIFICATION_STATUSES,
} from "@/models/VerificationRequest";
import { VERIFICATION_CHECKS } from "@/lib/stellaContent";
import { User } from "@/models/User";

function makeRef() {
  return `VR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

const CONSENT_COPY =
  "Purpose: verify stated credentials for Stella Careers and approved employers. Recipients: authorised Stella reviewers and, if you consent to sharing, approved employers. Storage: private document storage. Retention: per Stella retention policy (pending owner content). You may withdraw sharing consent; retained records follow documented reasons.";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const notes = String(body.notes || "").trim();
    const checkTypes = Array.isArray(body.checkTypes)
      ? body.checkTypes.map((c: unknown) => String(c)).filter(Boolean)
      : [];
    const consentChecking = Boolean(body.consentChecking);
    const consentSharing = Boolean(body.consentSharing);

    if (name.length < 2 || !email.includes("@") || !checkTypes.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email and at least one check type are required",
        },
        { status: 400 },
      );
    }
    if (!consentChecking) {
      return NextResponse.json(
        {
          success: false,
          message: "Consent to checking is required before submission",
          consentCopy: CONSENT_COPY,
        },
        { status: 400 },
      );
    }

    const allowed = new Set(VERIFICATION_CHECKS.map((c) => c.id));
    const unsupported = checkTypes.filter((c: string) => !allowed.has(c));
    if (unsupported.length) {
      return NextResponse.json(
        {
          success: false,
          message: `Unsupported check(s): ${unsupported.join(", ")}. Use enquiry for credentials Stella cannot perform.`,
        },
        { status: 400 },
      );
    }

    await connectDB();
    const auth = await getAuthFromCookies();
    const referenceId = makeRef();

    const claims = checkTypes.map((checkType: string) => {
      const meta = VERIFICATION_CHECKS.find((c) => c.id === checkType);
      return {
        checkType,
        claimSummary: meta?.name || checkType,
        issuerOrEmployer: "",
        evidenceRefs: [],
        consentGiven: consentChecking,
        consentVersion: "v1-pending-owner",
        method: meta?.method || "Pending owner content",
        result: "submitted",
        resultScope:
          "Upload alone does not verify. Result will state what was confirmed and by which method.",
        history: [
          {
            at: new Date(),
            by: "candidate",
            from: "",
            to: "submitted",
            reason: "Request created",
          },
        ],
      };
    });

    await VerificationRequest.create({
      referenceId,
      userId: auth?.sub || null,
      name,
      email,
      checkTypes,
      notes,
      status: "submitted",
      claims,
      consentChecking,
      consentSharing,
      consentVersion: "v1-pending-owner",
      candidateNextAction: "Awaiting reviewer assignment",
    });

    if (auth?.sub) {
      await User.findByIdAndUpdate(auth.sub, {
        $set: { "seekerProfile.credentialStatus": "pending" },
      });
    }

    return NextResponse.json({
      success: true,
      referenceId,
      status: "submitted",
      consentCopy: CONSENT_COPY,
      checks: VERIFICATION_CHECKS.filter((c) => checkTypes.includes(c.id)),
    });
  } catch (err) {
    console.error("verification request error", err);
    return NextResponse.json(
      { success: false, message: "Failed to submit verification request" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ref = searchParams.get("ref")?.trim() || "";
    const mine = searchParams.get("mine") === "1";

    await connectDB();

    if (mine) {
      const result = await requireApiAuth(["user"]);
      if (result.error) return result.error;
      const list = await VerificationRequest.find({ userId: result.auth.sub })
        .sort({ createdAt: -1 })
        .lean();
      return NextResponse.json({
        success: true,
        requests: list.map((d) => ({
          referenceId: d.referenceId,
          status: d.status,
          checkTypes: d.checkTypes,
          candidateNextAction: d.candidateNextAction,
          createdAt: d.createdAt,
          claims: (d.claims || []).map((c) => ({
            checkType: c.checkType,
            claimSummary: c.claimSummary,
            result: c.result,
            method: c.method,
            checkedAt: c.checkedAt,
            resultScope: c.resultScope,
            candidateExplanation: c.candidateExplanation,
          })),
        })),
      });
    }

    if (!ref) {
      return NextResponse.json(
        { success: false, message: "Reference ID required" },
        { status: 400 },
      );
    }

    const doc = await VerificationRequest.findOne({ referenceId: ref }).lean();
    if (!doc) {
      return NextResponse.json(
        { success: false, message: "Request not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      request: {
        referenceId: doc.referenceId,
        status: doc.status,
        checkTypes: doc.checkTypes || [],
        candidateNextAction: doc.candidateNextAction,
        createdAt: doc.createdAt,
        claims: (doc.claims || []).map((c) => ({
          checkType: c.checkType,
          claimSummary: c.claimSummary,
          result: c.result,
          method: c.method,
          checkedAt: c.checkedAt,
          resultScope: c.resultScope,
          candidateExplanation: c.candidateExplanation,
          // privateNotes intentionally omitted from public lookup
        })),
      },
      supportedStatuses: VERIFICATION_STATUSES,
    });
  } catch (err) {
    console.error("verification lookup error", err);
    return NextResponse.json(
      { success: false, message: "Lookup failed" },
      { status: 500 },
    );
  }
}
