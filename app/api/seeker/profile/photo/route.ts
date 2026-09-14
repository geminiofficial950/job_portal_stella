import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/requireApiAuth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { uploadImageBuffer } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireApiAuth(["user"]);
  if (auth.error) return auth.error;
  try {
    const file = (await request.formData()).get("file");
    if (!(file instanceof File) || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return NextResponse.json({ success: false, message: "Choose a JPG, PNG, or WebP photo" }, { status: 400 });
    }
    if (!file.size || file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: "Photo must be between 1 byte and 2 MB" }, { status: 400 });
    }
    await connectDB();
    const user = await User.findOne({ _id: auth.auth.sub, isActive: true }).select("_id");
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    const uploaded = await uploadImageBuffer(Buffer.from(await file.arrayBuffer()), `gemini-education/profile-photos/${user._id}`);
    await User.updateOne({ _id: user._id }, { $set: { "seekerProfile.photoUrl": uploaded.url, "seekerProfile.photoPublicId": uploaded.publicId } });
    return NextResponse.json({ success: true, url: uploaded.url });
  } catch (error) {
    console.error("Profile photo upload failed:", error);
    return NextResponse.json({ success: false, message: "Photo upload failed. Please try again." }, { status: 500 });
  }
}
