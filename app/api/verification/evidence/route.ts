import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/requireApiAuth";
import { uploadRawBuffer } from "@/lib/cloudinary";
import { VerificationRequest } from "@/models/VerificationRequest";

/** V11 — private evidence upload; does NOT auto-verify */
export async function POST(request: Request) {
  const result = await requireApiAuth(["user"]);
  if (result.error) return result.error;

  try {
    const form = await request.formData();
    const referenceId = String(form.get("referenceId") || "").trim();
    const file = form.get("file");

    if (!referenceId || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "referenceId and file required" },
        { status: 400 },
      );
    }

    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Only PDF/JPG/PNG/WebP allowed" },
        { status: 400 },
      );
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "Max file size 8MB" },
        { status: 400 },
      );
    }

    await connectDB();
    const doc = await VerificationRequest.findOne({
      referenceId,
      userId: result.auth.sub,
    });
    if (!doc) {
      return NextResponse.json(
        { success: false, message: "Request not found for this account" },
        { status: 404 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadRawBuffer(
      buffer,
      "stella-careers/verification-evidence",
      file.name.replace(/\W+/g, "_").slice(0, 40) || "evidence",
    );

    doc.evidenceDocuments.push({
      url: uploaded.url,
      publicId: uploaded.publicId,
      fileName: file.name,
      uploadedAt: new Date(),
      ownerUserId: result.auth.sub as never,
    });

    // Explicit: upload never marks verified
    if (doc.status === "submitted") {
      doc.status = "in_review";
      doc.candidateNextAction = "Evidence received — awaiting reviewer";
    }

    await doc.save();

    return NextResponse.json({
      success: true,
      referenceId,
      status: doc.status,
      message:
        "Evidence stored privately. Uploading a file does not verify the claim.",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Upload failed" },
      { status: 500 },
    );
  }
}
