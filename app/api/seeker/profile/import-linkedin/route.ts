import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/requireApiAuth";
import {
  extractProfileFromLinkedInUrl,
  geminiErrorMessage,
  hasExtractedProfileContent,
  isGeminiQuotaError,
} from "@/lib/geminiResume";

export const runtime = "nodejs";
export const maxDuration = 60;

function badRequest(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

function isValidLinkedInUrl(value: string) {
  try {
    const u = new URL(value);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (host !== "linkedin.com" && !host.endsWith(".linkedin.com")) {
      return false;
    }
    return /\/in\//i.test(u.pathname);
  } catch {
    return false;
  }
}

function normalizeLinkedInUrl(value: string) {
  const u = new URL(value.trim());
  u.hash = "";
  u.search = "";
  const path = u.pathname.replace(/\/+$/, "");
  return `https://www.linkedin.com${path}`;
}

export async function POST(request: Request) {
  const result = await requireApiAuth(["user"]);
  if (result.error) return result.error;

  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return badRequest("Gemini API key is not configured", 500);
    }

    const body = (await request.json()) as { url?: string };
    const rawUrl = String(body.url || "").trim();

    if (!rawUrl) {
      return badRequest("Enter your LinkedIn profile URL");
    }
    if (!isValidLinkedInUrl(rawUrl)) {
      return badRequest(
        "Enter a valid LinkedIn profile URL (linkedin.com/in/...)",
      );
    }

    const linkedinUrl = normalizeLinkedInUrl(rawUrl);
    const extracted = await extractProfileFromLinkedInUrl(linkedinUrl);
    const profile = {
      ...extracted,
      linkedin: linkedinUrl,
      resumeUrl: "",
    };

    if (!hasExtractedProfileContent(profile)) {
      return badRequest(
        "Couldn’t read profile details from that LinkedIn URL. Make sure the profile is public, then try again.",
      );
    }

    return NextResponse.json({
      success: true,
      message: "LinkedIn profile imported — review and save",
      profile,
    });
  } catch (error) {
    console.error("Import LinkedIn error:", error);
    const status = isGeminiQuotaError(error) ? 429 : 500;
    return NextResponse.json(
      {
        success: false,
        message: geminiErrorMessage(error),
      },
      { status },
    );
  }
}
