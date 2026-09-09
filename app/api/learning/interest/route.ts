import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { LearningInterest } from "@/models/VerificationRequest";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const kind = String(body.kind || "");
    const itemId = String(body.itemId || "").trim();
    const itemTitle = String(body.itemTitle || "").trim();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const notes = String(body.notes || "").trim();

    if (!["masterclass", "course", "event"].includes(kind)) {
      return NextResponse.json(
        { success: false, message: "Invalid type" },
        { status: 400 },
      );
    }
    if (!itemId || !itemTitle || name.length < 2 || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Name, email and item are required" },
        { status: 400 },
      );
    }

    await connectDB();
    const referenceId = `LI-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    await LearningInterest.create({
      referenceId,
      kind,
      itemId,
      itemTitle,
      name,
      email,
      notes,
      status: "submitted",
    });

    return NextResponse.json({ success: true, referenceId, status: "submitted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Failed to save interest" },
      { status: 500 },
    );
  }
}
