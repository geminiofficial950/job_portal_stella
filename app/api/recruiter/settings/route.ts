import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/requireApiAuth";
import { setAuthCookie, signToken } from "@/lib/auth";
import { User, serializeRecruiterSettings } from "@/models/User";

function badRequest(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function GET() {
  const result = await requireApiAuth(["recruiter"]);
  if (result.error) return result.error;

  try {
    await connectDB();
    const user = await User.findById(result.auth.sub);
    if (!user || !user.isActive) {
      return badRequest("User not found", 404);
    }

    return NextResponse.json({
      success: true,
      settings: serializeRecruiterSettings(user),
    });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const result = await requireApiAuth(["recruiter"]);
  if (result.error) return result.error;

  try {
    const body = await request.json();
    await connectDB();

    const user = await User.findById(result.auth.sub).select("+password");
    if (!user || !user.isActive) {
      return badRequest("User not found", 404);
    }

    const $set: Record<string, unknown> = {};

    if (body.profile) {
      const name = String(body.profile.name ?? "").trim();
      const phone = String(body.profile.phone ?? "").trim();

      if (!name || name.length < 2) {
        return badRequest("Name must be at least 2 characters");
      }

      $set.name = name;
      $set.phone = phone;
    }

    if (body.notifications) {
      $set["settings.notifications"] = {
        emailNewApplications: Boolean(body.notifications.emailNewApplications),
        emailInterviewReminders: Boolean(
          body.notifications.emailInterviewReminders
        ),
        emailWeeklyDigest: Boolean(body.notifications.emailWeeklyDigest),
        emailJobStatus: Boolean(body.notifications.emailJobStatus),
      };
    }

    if (body.hiring) {
      const employmentTypes = ["full-time", "part-time", "casual", "contract"];
      const workModes = ["onsite", "hybrid", "remote"];
      const employmentType = String(body.hiring.defaultEmploymentType ?? "");
      const workMode = String(body.hiring.defaultWorkMode ?? "");
      const autoPause = Number(body.hiring.autoPauseAfterDays ?? 0);

      if (!employmentTypes.includes(employmentType)) {
        return badRequest("Invalid default employment type");
      }
      if (!workModes.includes(workMode)) {
        return badRequest("Invalid default work mode");
      }
      if (!Number.isFinite(autoPause) || autoPause < 0 || autoPause > 365) {
        return badRequest("Auto-pause days must be between 0 and 365");
      }

      $set["settings.hiring"] = {
        defaultEmploymentType: employmentType,
        defaultWorkMode: workMode,
        showSalaryPublicly: Boolean(body.hiring.showSalaryPublicly),
        autoPauseAfterDays: Math.floor(autoPause),
      };
    }

    if (body.password) {
      if (user.authProvider === "google" || !user.password) {
        return badRequest(
          "Google accounts cannot set a password here. Use Google sign-in.",
          400
        );
      }

      const currentPassword = String(body.password.current ?? "");
      const nextPassword = String(body.password.next ?? "");

      if (!currentPassword || !nextPassword) {
        return badRequest("Current and new password are required");
      }
      if (nextPassword.length < 6) {
        return badRequest("New password must be at least 6 characters");
      }

      const ok = await bcrypt.compare(currentPassword, user.password);
      if (!ok) {
        return badRequest("Current password is incorrect", 401);
      }

      $set.password = await bcrypt.hash(nextPassword, 10);
    }

    const updated = await User.findByIdAndUpdate(
      result.auth.sub,
      { $set },
      { new: true }
    );

    if (!updated) {
      return badRequest("User not found", 404);
    }

    const token = await signToken({
      sub: String(updated._id),
      email: updated.email,
      role: updated.role,
      name: updated.name,
    });
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: "Settings saved",
      settings: serializeRecruiterSettings(updated),
    });
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save settings" },
      { status: 500 }
    );
  }
}
