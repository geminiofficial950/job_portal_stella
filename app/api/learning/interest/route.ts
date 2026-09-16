import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { LearningInterest } from "@/models/VerificationRequest";

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid form data" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ success: false, message: "Invalid form data" }, { status: 400 });
  }
  try {
    const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
    const kind = text(body.kind);
    const itemId = text(body.itemId);
    const itemTitle = text(body.itemTitle);
    const name = text(body.name);
    const email = text(body.email).toLowerCase();
    const notes = text(body.notes);

    if (!["masterclass", "course", "event"].includes(kind)) {
      return NextResponse.json(
        { success: false, message: "Invalid type" },
        { status: 400 },
      );
    }
    if (!itemId || !itemTitle || name.length < 2 || name.length > 120 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Enter your full name (2–120 characters) and a valid email address." },
        { status: 400 },
      );
    }
    if (notes.length > 2000) {
      return NextResponse.json(
        { success: false, message: "Please keep your message under 2,000 characters." },
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
