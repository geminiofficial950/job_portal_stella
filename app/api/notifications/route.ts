import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/requireApiAuth";
import { Notification, serializeNotification } from "@/models/Notification";

/** List notifications for current user (seeker or recruiter) */
export async function GET() {
  const result = await requireApiAuth(["user", "recruiter"]);
  if (result.error) return result.error;

  try {
    await connectDB();
    const items = await Notification.find({ userId: result.auth.sub })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = await Notification.countDocuments({
      userId: result.auth.sub,
      read: false,
    });

    return NextResponse.json({
      success: true,
      unreadCount,
      notifications: items.map((n) =>
        serializeNotification(
          n as unknown as Parameters<typeof serializeNotification>[0]
        )
      ),
    });
  } catch (error) {
    console.error("Notifications GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load notifications" },
      { status: 500 }
    );
  }
}

/** Mark notifications as read */
export async function PATCH(request: Request) {
  const result = await requireApiAuth(["user", "recruiter"]);
  if (result.error) return result.error;

  try {
    const body = await request.json().catch(() => ({}));
    const ids = Array.isArray(body.ids)
      ? body.ids.map((id: unknown) => String(id))
      : [];
    const markAll = Boolean(body.markAll);

    await connectDB();

    if (markAll) {
      await Notification.updateMany(
        { userId: result.auth.sub, read: false },
        { $set: { read: true } }
      );
    } else if (ids.length) {
      await Notification.updateMany(
        { userId: result.auth.sub, _id: { $in: ids } },
        { $set: { read: true } }
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Nothing to update" },
        { status: 400 }
      );
    }

    const unreadCount = await Notification.countDocuments({
      userId: result.auth.sub,
      read: false,
    });

    return NextResponse.json({ success: true, unreadCount });
  } catch (error) {
    console.error("Notifications PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
