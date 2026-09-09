import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/requireApiAuth";
import { ReminderPreference } from "@/models/Learning";
import { User } from "@/models/User";

export async function GET() {
  const result = await requireApiAuth(["user"]);
  if (result.error) return result.error;

  await connectDB();
  let prefs = await ReminderPreference.findOne({
    userId: result.auth.sub,
  }).lean();
  if (!prefs) {
    return NextResponse.json({
      success: true,
      preferences: {
        jobs: true,
        sessions: true,
        courses: true,
        events: true,
        marketing: false,
        frequency: "immediate",
      },
    });
  }

  return NextResponse.json({ success: true, preferences: prefs });
}

export async function PUT(request: Request) {
  const result = await requireApiAuth(["user"]);
  if (result.error) return result.error;

  try {
    const body = await request.json();
    await connectDB();

    const prefs = await ReminderPreference.findOneAndUpdate(
      { userId: result.auth.sub },
      {
        userId: result.auth.sub,
        jobs: Boolean(body.jobs ?? true),
        sessions: Boolean(body.sessions ?? true),
        courses: Boolean(body.courses ?? true),
        events: Boolean(body.events ?? true),
        marketing: Boolean(body.marketing ?? false),
        frequency: ["immediate", "daily", "weekly", "none"].includes(
          String(body.frequency),
        )
          ? body.frequency
          : "immediate",
      },
      { upsert: true, new: true },
    );

    await User.findByIdAndUpdate(result.auth.sub, {
      $set: {
        "settings.seekerNotifications.emailJobAlerts": prefs.jobs,
        "settings.seekerNotifications.emailSessionReminders": prefs.sessions,
        "settings.seekerNotifications.emailCourseUpdates": prefs.courses,
        "settings.seekerNotifications.emailEventReminders": prefs.events,
        "settings.seekerNotifications.emailMarketing": prefs.marketing,
      },
    });

    return NextResponse.json({ success: true, preferences: prefs });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Failed to save preferences" },
      { status: 500 },
    );
  }
}
