import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireApiAuth } from "@/lib/requireApiAuth";
import {
  LINKEDIN_IMPORT_COOKIE,
  linkedInToSeekerProfileFields,
  verifyLinkedInImportDraft,
} from "@/lib/linkedinOAuth";

export const runtime = "nodejs";

export async function GET() {
  const result = await requireApiAuth(["user"]);
  if (result.error) return result.error;

  const cookieStore = await cookies();
  const draftToken = cookieStore.get(LINKEDIN_IMPORT_COOKIE)?.value;
  cookieStore.delete(LINKEDIN_IMPORT_COOKIE);

  if (!draftToken) {
    return NextResponse.json(
      {
        success: false,
        message: "No LinkedIn import found. Start Import from LinkedIn again.",
      },
      { status: 404 },
    );
  }

  const draft = await verifyLinkedInImportDraft(draftToken);
  if (!draft || draft.userId !== result.auth.sub) {
    return NextResponse.json(
      {
        success: false,
        message: "LinkedIn import expired or invalid. Try again.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    message: "LinkedIn profile ready — review and save",
    linkedin: draft.profile,
    profile: linkedInToSeekerProfileFields(draft.profile),
    account: {
      name: draft.profile.name,
      email: draft.profile.email,
      picture: draft.profile.picture,
    },
  });
}
