import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireApiAuth } from "@/lib/requireApiAuth";
import {
  LINKEDIN_STATE_COOKIE,
  buildLinkedInAuthUrl,
  isLinkedInConfigured,
  signLinkedInState,
} from "@/lib/linkedinOAuth";

export const runtime = "nodejs";

export async function GET() {
  const result = await requireApiAuth(["user"]);
  if (result.error) return result.error;

  if (!isLinkedInConfigured()) {
    return NextResponse.json(
      {
        success: false,
        message:
          "LinkedIn OAuth is not configured. Add LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET to .env",
      },
      { status: 503 },
    );
  }

  const state = await signLinkedInState(result.auth.sub);
  const cookieStore = await cookies();
  cookieStore.set(LINKEDIN_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
  });

  return NextResponse.redirect(buildLinkedInAuthUrl(state));
}
