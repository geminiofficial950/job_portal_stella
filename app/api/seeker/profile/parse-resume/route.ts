import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { requireApiAuth } from "@/lib/requireApiAuth";
import { uploadRawBuffer } from "@/lib/cloudinary";
import {
  extractProfileFromResumeFile,
  extractProfileFromResumeText,
  geminiErrorMessage,
} from "@/lib/geminiResume";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB

const PDF = "application/pdf";
const DOCX =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const DOC = "application/msword";
const IMAGES = new Set(["image/jpeg", "image/png", "image/webp"]);

function badRequest(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

function guessMime(file: File) {
  if (file.type) return file.type;
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return PDF;
  if (name.endsWith(".docx")) return DOCX;
  if (name.endsWith(".doc")) return DOC;
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".webp")) return "image/webp";
  return "";
}

export async function POST(request: Request) {
  const result = await requireApiAuth(["user"]);
  if (result.error) return result.error;

  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return badRequest("Gemini API key is not configured", 500);
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return badRequest("Upload a resume file (PDF, DOCX, or image)");
    }

    if (file.size > MAX_BYTES) {
      return badRequest("Resume must be under 8MB");
    }

    const mimeType = guessMime(file);
    const allowed =
      mimeType === PDF ||
      mimeType === DOCX ||
      mimeType === DOC ||
      IMAGES.has(mimeType);

    if (!allowed) {
      return badRequest("Use PDF, DOCX, JPG, PNG, or WEBP");
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let profile;
    if (mimeType === DOCX || mimeType === DOC) {
      const parsed = await mammoth.extractRawText({ buffer });
      const text = parsed.value?.trim();
      if (!text || text.length < 40) {
        return badRequest(
          "Could not read text from this Word file. Try PDF instead."
        );
      }
      profile = await extractProfileFromResumeText(text);
    } else {
      profile = await extractProfileFromResumeFile({
        buffer,
        mimeType: mimeType === PDF ? PDF : mimeType,
      });
    }

    let resumeUrl = "";
    try {
      if (
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      ) {
        const uploaded = await uploadRawBuffer(
          buffer,
          "stella-jobs/resumes",
          `seeker-${result.auth.sub}`
        );
        resumeUrl = uploaded.url;
      }
    } catch (uploadError) {
      console.error("Resume Cloudinary upload failed:", uploadError);
    }

    return NextResponse.json({
      success: true,
      message: "Resume parsed successfully — review and save",
      profile: {
        ...profile,
        resumeUrl,
      },
    });
  } catch (error) {
    console.error("Parse resume error:", error);
    return NextResponse.json(
      {
        success: false,
        message: geminiErrorMessage(error),
      },
      { status: 500 }
    );
  }
}
