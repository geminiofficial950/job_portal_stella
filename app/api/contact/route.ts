import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ContactMessage } from "@/models/ContactMessage";

const TOPICS = new Set([
  "Job search",
  "Employer or recruiter",
  "Privacy",
  "Something else",
]);

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Please check the form and try again." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ message: "Please check the form and try again." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  if (typeof record.companyWebsite === "string" && record.companyWebsite.trim()) {
    return NextResponse.json({ success: true });
  }

  const name = typeof record.name === "string" ? record.name.trim() : "";
  const email = typeof record.email === "string" ? record.email.trim().toLowerCase() : "";
  const topic = typeof record.topic === "string" ? record.topic.trim() : "";
  const message = typeof record.message === "string" ? record.message.trim() : "";

  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ message: "Enter your name." }, { status: 400 });
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
  }
  if (!TOPICS.has(topic)) {
    return NextResponse.json({ message: "Choose a topic." }, { status: 400 });
  }
  if (message.length < 10 || message.length > 2000) {
    return NextResponse.json({ message: "Write a message of at least 10 characters." }, { status: 400 });
  }

  try {
    await connectDB();
    await ContactMessage.create({ name, email, topic, message });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "We couldn’t send that just now. Email us instead." }, { status: 503 });
  }
}
