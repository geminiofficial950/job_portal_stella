import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import mammoth from "mammoth";
import { connectDB } from "@/lib/db";
import { ResumeDiscovery, ResumeDiscoveryLimit } from "@/models/ResumeDiscovery";
import { extractProfileFromResumeFile, extractProfileFromResumeText, geminiErrorMessage } from "@/lib/geminiResume";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) return NextResponse.json({ message: "Resume scanning is temporarily unavailable" }, { status: 503 });
    if (Number(request.headers.get("content-length")) > 9 * 1024 * 1024) return NextResponse.json({ message: "Use a resume under 8 MB" }, { status: 413 });
    await connectDB();
    const identity = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const day = new Date().toISOString().slice(0, 10);
    const id = createHash("sha256").update(`${identity}:${day}`).digest("hex");
    const limit = await ResumeDiscoveryLimit.findOneAndUpdate({ _id: id }, { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(Date.now() + 86400000) } }, { upsert: true, new: true });
    if (limit.count > 5) return NextResponse.json({ message: "Daily scan limit reached. Please try again tomorrow." }, { status: 429 });
    const file = (await request.formData()).get("file");
    const docx = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (!(file instanceof File) || !file.size || file.size > 8 * 1024 * 1024 || !["application/pdf", docx].includes(file.type)) return NextResponse.json({ message: "Choose a PDF or DOCX resume under 8 MB" }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const profile = file.type === docx
      ? await extractProfileFromResumeText((await mammoth.extractRawText({ buffer })).value)
      : await extractProfileFromResumeFile({ buffer, mimeType: "application/pdf" });
    if (!profile.headline && !profile.skills.length) return NextResponse.json({ message: "No career details found. Try a clearer resume." }, { status: 422 });
    const token = randomBytes(32).toString("hex");
    await ResumeDiscovery.create({ tokenHash: createHash("sha256").update(token).digest("hex"), profile, resume: buffer, expiresAt: new Date(Date.now() + 3600000) });
    (await cookies()).set("resume-discovery", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/api/resume-discovery", maxAge: 3600 });
    return NextResponse.json({ profile }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Resume discovery scan failed", error);
    return NextResponse.json({ message: geminiErrorMessage(error) }, { status: 500 });
  }
}
