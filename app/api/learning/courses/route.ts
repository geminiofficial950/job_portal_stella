import { NextResponse } from "next/server";
import { ensureLearningSeeded, makeRef } from "@/lib/learningStore";
import { requireApiAuth } from "@/lib/requireApiAuth";
import { Course, CourseEnrolment } from "@/models/Learning";

export async function GET() {
  try {
    await ensureLearningSeeded();
    const items = await Course.find({ published: true }).sort({ title: 1 }).lean();
    return NextResponse.json({
      success: true,
      items: items.map((c) => ({
        id: String(c._id),
        slug: c.slug,
        title: c.title,
        outcome: c.outcome,
        provider: c.provider,
        duration: c.duration,
        mode: c.mode,
        prerequisites: c.prerequisites,
        price: c.price,
        trainingType: c.trainingType,
        nationallyRecognised: c.nationallyRecognised,
        accessInstructions: c.accessInstructions,
        accessUrl: c.accessUrl,
        pendingOwnerContent: c.pendingOwnerContent,
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Failed to load courses" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const result = await requireApiAuth(["user"]);
  if (result.error) return result.error;

  try {
    await ensureLearningSeeded();
    const body = await request.json();
    const slugOrId = String(body.courseId || body.slug || "").trim();
    const course =
      (await Course.findOne({ slug: slugOrId })) ||
      (await Course.findById(slugOrId).catch(() => null));
    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 },
      );
    }

    const existing = await CourseEnrolment.findOne({
      userId: result.auth.sub,
      courseId: course._id,
      status: { $nin: ["withdrawn"] },
    });
    if (existing) {
      return NextResponse.json({
        success: true,
        referenceId: existing.referenceId,
        status: existing.status,
        accessUrl: course.accessUrl || null,
        message: "Existing enrolment found",
      });
    }

    const hasHandoff = Boolean(course.accessUrl && !course.pendingOwnerContent);
    const referenceId = makeRef("EN");
    const enrolment = await CourseEnrolment.create({
      referenceId,
      userId: result.auth.sub,
      courseId: course._id,
      status: hasHandoff ? "enrolled" : "awaiting_confirmation",
      completionSource: "none",
      accessGrantedAt: hasHandoff ? new Date() : null,
    });

    return NextResponse.json({
      success: true,
      referenceId: enrolment.referenceId,
      status: enrolment.status,
      trainingType: course.trainingType,
      nationallyRecognised: course.nationallyRecognised,
      accessUrl: hasHandoff ? course.accessUrl : null,
      accessInstructions: course.accessInstructions,
      message: hasHandoff
        ? "Enrolment recorded. Use provider handoff link for access."
        : "Enrolment awaiting staff/provider confirmation. Completion awaits staff review — not a verified-skill badge.",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Enrolment failed" },
      { status: 500 },
    );
  }
}
