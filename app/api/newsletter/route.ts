import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { NewsletterSubscriber } from "@/models/NewsletterSubscriber";

export async function POST(request: Request) {
  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ message: "Please enter a valid email address." }, { status: 400 }); }
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ message: "Please enter a valid email address." }, { status: 400 });
  }
  try {
    await connectDB();
    await NewsletterSubscriber.updateOne({ email }, { $setOnInsert: { email, source: "footer" } }, { upsert: true });
    return NextResponse.json({ success: true });
  } catch (error) {
    // Concurrent requests for the same email are already successfully subscribed.
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ message: "Signup is temporarily unavailable. Please try again later." }, { status: 503 });
  }
}
