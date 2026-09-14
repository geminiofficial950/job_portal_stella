import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { ResumeDiscovery } from "@/models/ResumeDiscovery";
import { User } from "@/models/User";
import { getAuthFromCookies, setAuthCookie, signToken } from "@/lib/auth";
import { uploadRawBuffer } from "@/lib/cloudinary";

export async function POST(request: Request) {
  let draftId: string | undefined;
  let created = false;
  try {
    if (await getAuthFromCookies()) return NextResponse.json({ message: "You are already signed in. Continue to your dashboard." }, { status: 409 });
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    if (body.consent !== true || name.length < 2 || name.length > 80 || email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ message: "Confirm your name, email and account consent" }, { status: 400 });
    const token = (await cookies()).get("resume-discovery")?.value;
    if (!token) return NextResponse.json({ message: "Your scan expired. Please scan your resume again." }, { status: 410 });
    await connectDB();
    if (await User.exists({ email })) {
      return NextResponse.json(
        {
          code: "EMAIL_EXISTS",
          message:
            "An account already exists on this email. Please change your email address, or go to the sign in page.",
        },
        { status: 409 },
      );
    }
    const draft = await ResumeDiscovery.findOneAndUpdate({ tokenHash: createHash("sha256").update(token).digest("hex"), expiresAt: { $gt: new Date() }, claimed: false }, { $set: { claimed: true } }, { new: true });
    if (!draft) return NextResponse.json({ message: "Your scan expired or has already been used. Please scan again." }, { status: 410 });
    draftId = String(draft._id);
    const password = randomBytes(18).toString("base64url");
    const profile = { ...draft.profile };
    const phone = String(profile.phone || "");
    delete profile.name; delete profile.email; delete profile.phone;
    const resume = await uploadRawBuffer(Buffer.from(draft.resume), "gemini-education/resumes", `onboarding-${draft._id}`);
    profile.resumeUrl = resume.url;
    const user = await User.create({ name, email, phone, password: await bcrypt.hash(password, 12), role: "user", authProvider: "local", seekerProfile: profile });
    created = true;
    await setAuthCookie(await signToken({ sub: String(user._id), name, email, role: "user" }));
    await ResumeDiscovery.deleteOne({ _id: draft._id });
    return NextResponse.json({ success: true, password }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (draftId && !created) await ResumeDiscovery.updateOne({ _id: draftId }, { $set: { claimed: false } });
    console.error("Resume discovery registration failed", error);
    return NextResponse.json({ message: "Could not create your account. Please try again or sign in if already registered." }, { status: 500 });
  }
}
