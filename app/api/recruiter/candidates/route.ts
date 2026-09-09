import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/requireApiAuth";
import { requireApprovedRecruiterCompany } from "@/lib/recruiterCompanyAccess";
import { User } from "@/models/User";
import { VerificationRequest } from "@/models/VerificationRequest";

/**
 * E01/E02 — only approved companies can search discoverable candidates.
 * Private / paused profiles are excluded.
 */
export async function GET(request: Request) {
  const result = await requireApiAuth(["recruiter"]);
  if (result.error) return result.error;

  const gate = await requireApprovedRecruiterCompany(result.auth.sub);
  if (gate.error) return gate.error;

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const location = searchParams.get("location")?.trim() || "";
    const role = searchParams.get("role")?.trim() || "";

    const filter: Record<string, unknown> = {
      role: "user",
      isActive: true,
      "seekerProfile.discoverable": true,
      "seekerProfile.discoveryPaused": { $ne: true },
    };

    if (q) {
      filter.$or = [
        { name: new RegExp(q, "i") },
        { "seekerProfile.headline": new RegExp(q, "i") },
        { "seekerProfile.skills": new RegExp(q, "i") },
        { "seekerProfile.targetRoles": new RegExp(q, "i") },
      ];
    }
    if (location) {
      filter.$and = [
        {
          $or: [
            { "seekerProfile.location": new RegExp(location, "i") },
            { "seekerProfile.suburb": new RegExp(location, "i") },
          ],
        },
      ];
    }
    if (role) {
      filter["seekerProfile.targetRoles"] = new RegExp(role, "i");
    }

    const users = await User.find(filter)
      .select("name seekerProfile")
      .limit(50)
      .lean();

    const ids = users.map((u) => u._id);
    const verifications = await VerificationRequest.find({
      userId: { $in: ids },
      status: { $in: ["verified", "in_review", "submitted", "partial"] },
    })
      .select("userId status claims.checkType claims.result claims.checkedAt")
      .lean();

    const verMap = new Map<string, typeof verifications>();
    for (const v of verifications) {
      const key = String(v.userId);
      const arr = verMap.get(key) || [];
      arr.push(v);
      verMap.set(key, arr);
    }

    return NextResponse.json({
      success: true,
      candidates: users.map((u) => {
        const sp = (u.seekerProfile || {}) as {
          headline?: string;
          location?: string;
          suburb?: string;
          travelRadiusKm?: number;
          skills?: string[];
          targetRoles?: string[];
          experienceLevel?: string;
          availabilityNote?: string;
          availabilityConfirmedAt?: Date;
          profileStatus?: string;
          credentialStatus?: string;
          screeningStatus?: string;
          availabilityStatus?: string;
        };
        const creds = verMap.get(String(u._id)) || [];
        const claimStatuses = creds.flatMap((v) =>
          (v.claims || []).map((c) => ({
            checkType: c.checkType,
            result: c.result,
            checkedAt: c.checkedAt,
          })),
        );
        return {
          id: String(u._id),
          name: u.name,
          headline: sp.headline || "",
          location: sp.location || sp.suburb || "",
          travelRadiusKm: sp.travelRadiusKm ?? null,
          skills: sp.skills || [],
          targetRoles: sp.targetRoles || [],
          experienceLevel: sp.experienceLevel || "",
          availabilityNote: sp.availabilityNote || "",
          availabilityConfirmedAt: sp.availabilityConfirmedAt || null,
          profileStatus: sp.profileStatus || "incomplete",
          credentialStatus: sp.credentialStatus || "none",
          screeningStatus: sp.screeningStatus || "none",
          availabilityStatus: sp.availabilityStatus || "unknown",
          claimStatuses,
        };
      }),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Search failed" },
      { status: 500 },
    );
  }
}
