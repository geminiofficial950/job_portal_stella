import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  LINKEDIN_IMPORT_COOKIE,
  LINKEDIN_STATE_COOKIE,
  exchangeLinkedInCode,
  fetchLinkedInNormalizedProfile,
  signLinkedInImportDraft,
  verifyLinkedInState,
} from "@/lib/linkedinOAuth";

export const runtime = "nodejs";
export const maxDuration = 60;

function profileRedirect(request: Request, query: Record<string, string>) {
  const origin = new URL(request.url).origin;
  const url = new URL("/dashboard/seeker/profile", origin);
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");
  const oauthDesc = searchParams.get("error_description");

  const cookieStore = await cookies();
  const savedState = cookieStore.get(LINKEDIN_STATE_COOKIE)?.value || "";
  cookieStore.delete(LINKEDIN_STATE_COOKIE);

  if (oauthError) {
    return profileRedirect(request, {
      linkedin: "error",
      message: oauthDesc || oauthError || "LinkedIn authorization was denied",
    });
  }

  if (!code || !state || !savedState || state !== savedState) {
    return profileRedirect(request, {
      linkedin: "error",
      message: "Invalid LinkedIn OAuth state. Try importing again.",
    });
  }

  const verified = await verifyLinkedInState(state);
  if (!verified) {
    return profileRedirect(request, {
      linkedin: "error",
      message: "LinkedIn OAuth session expired. Try importing again.",
    });
  }

  try {
    const accessToken = await exchangeLinkedInCode(code);
    const profile = await fetchLinkedInNormalizedProfile(accessToken);

    if (
      !profile.name &&
      !profile.email &&
      !profile.headline &&
      !profile.about &&
      !profile.education &&
      !profile.experience.length
    ) {
      return profileRedirect(request, {
        linkedin: "error",
        message:
          "LinkedIn returned no profile fields. Check app products/scopes in LinkedIn Developer Portal.",
      });
    }

    const draft = await signLinkedInImportDraft(verified.userId, profile);
    cookieStore.set(LINKEDIN_IMPORT_COOKIE, draft, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 20,
    });

    return profileRedirect(request, { linkedin: "imported" });
  } catch (error) {
    console.error("LinkedIn OAuth callback error:", error);
    const message =
      error instanceof Error
        ? error.message.slice(0, 180)
        : "LinkedIn import failed";
    return profileRedirect(request, { linkedin: "error", message });
  }
}
