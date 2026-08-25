import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { requireApiAuth } from "@/lib/requireApiAuth";
import {
  User,
  serializeSeekerProfile,
  defaultSeekerProfile,
} from "@/models/User";

function badRequest(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

function isValidHttpUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidLinkedInUrl(value: string) {
  if (!isValidHttpUrl(value)) return false;
  try {
    const host = new URL(value).hostname.replace(/^www\./, "").toLowerCase();
    return host === "linkedin.com" || host.endsWith(".linkedin.com");
  } catch {
    return false;
  }
}

function isValidSalaryExpectation(value: string) {
  const options = [
    "AUD 40k–50k / year",
    "AUD 50k–60k / year",
    "AUD 60k–70k / year",
    "AUD 70k–80k / year",
    "AUD 80k–95k / year",
    "AUD 95k–110k / year",
    "AUD 110k–130k / year",
    "AUD 130k–150k / year",
    "AUD 150k–180k / year",
    "AUD 180k–220k / year",
    "AUD 220k+ / year",
    "Negotiable",
  ];
  return options.includes(value.trim());
}

export async function GET() {
  const result = await requireApiAuth(["user"]);
  if (result.error) return result.error;

  try {
    await connectDB();
    const user = await User.findById(result.auth.sub)
      .select("name email phone authProvider role isActive seekerProfile settings password")
      .select("+password")
      .lean();

    if (!user || user.isActive === false) {
      return badRequest("User not found", 404);
    }

    const payload = serializeSeekerProfile(
      user as Parameters<typeof serializeSeekerProfile>[0]
    );

    return NextResponse.json({
      success: true,
      ...payload,
      hasPassword: Boolean((user as { password?: string }).password),
    });
  } catch (error) {
    console.error("Seeker profile GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const result = await requireApiAuth(["user"]);
  if (result.error) return result.error;

  try {
    const body = await request.json();
    const section = String(body.section ?? "profile");

    await connectDB();
    const user = await User.findById(result.auth.sub).select("+password");
    if (!user || !user.isActive) return badRequest("User not found", 404);

    const $set: Record<string, unknown> = {};

    if (section === "account") {
      const name = String(body.name ?? "").trim();
      const phone = String(body.phone ?? "").trim();
      if (!name || name.length < 2) return badRequest("Name must be at least 2 characters");
      $set.name = name;
      $set.phone = phone;
    } else if (section === "profile") {
      const defaults = defaultSeekerProfile();
      const p = body.profile || {};
      const skills = Array.isArray(p.skills)
        ? p.skills.map((s: unknown) => String(s).trim()).filter(Boolean).slice(0, 30)
        : defaults.skills;
      const preferredEmploymentTypes = Array.isArray(p.preferredEmploymentTypes)
        ? p.preferredEmploymentTypes.map((s: unknown) => String(s)).filter(Boolean)
        : [];
      const preferredWorkModes = Array.isArray(p.preferredWorkModes)
        ? p.preferredWorkModes.map((s: unknown) => String(s)).filter(Boolean)
        : [];
      const experienceLevel = String(p.experienceLevel ?? "").trim();
      const headline = String(p.headline ?? "").trim().slice(0, 120);
      const location = String(p.location ?? "").trim().slice(0, 120);
      const about = String(p.about ?? "").trim().slice(0, 2000);
      const education = String(p.education ?? "").trim().slice(0, 200);
      const salaryExpectation = String(p.salaryExpectation ?? "").trim().slice(0, 80);
      const linkedin = String(p.linkedin ?? "").trim().slice(0, 200);
      const portfolio = String(p.portfolio ?? "").trim().slice(0, 200);
      const resumeUrl = String(p.resumeUrl ?? "").trim().slice(0, 500);

      if (!headline || headline.length < 5) {
        return badRequest("Headline is required (min 5 characters)");
      }
      if (!location || location.length < 2) {
        return badRequest("Location is required");
      }
      if (!["entry", "mid", "senior"].includes(experienceLevel)) {
        return badRequest("Please select a valid experience level");
      }
      if (!about || about.length < 30) {
        return badRequest("About is required (min 30 characters)");
      }
      if (!education || education.length < 3) {
        return badRequest("Education is required");
      }
      if (!skills.length) {
        return badRequest("Add at least one skill");
      }
      if (!salaryExpectation) {
        return badRequest("Salary expectation is required");
      }
      if (!isValidSalaryExpectation(salaryExpectation)) {
        return badRequest("Please select a salary expectation from the list");
      }
      if (!resumeUrl) {
        return badRequest("Resume URL is required");
      }
      if (!isValidHttpUrl(resumeUrl)) {
        return badRequest("Resume URL must be a valid http/https link");
      }
      if (!linkedin) {
        return badRequest("LinkedIn URL is required");
      }
      if (!isValidLinkedInUrl(linkedin)) {
        return badRequest("Enter a valid LinkedIn profile URL (linkedin.com/in/...)");
      }
      if (portfolio && !isValidHttpUrl(portfolio)) {
        return badRequest("Portfolio must be a valid http/https link");
      }
      if (!preferredEmploymentTypes.length) {
        return badRequest("Select at least one employment type");
      }
      if (!preferredWorkModes.length) {
        return badRequest("Select at least one work mode");
      }

      $set.seekerProfile = {
        headline,
        location,
        about,
        skills,
        experienceLevel,
        education,
        preferredEmploymentTypes,
        preferredWorkModes,
        salaryExpectation,
        linkedin,
        portfolio,
        resumeUrl,
        openToWork: Boolean(p.openToWork ?? true),
      };
    } else if (section === "notifications") {
      const n = body.notifications || {};
      $set["settings.seekerNotifications"] = {
        emailJobAlerts: Boolean(n.emailJobAlerts),
        emailApplicationUpdates: Boolean(n.emailApplicationUpdates),
        emailInterviewReminders: Boolean(n.emailInterviewReminders),
        emailWeeklyDigest: Boolean(n.emailWeeklyDigest),
      };
    } else if (section === "password") {
      if (user.authProvider !== "local") {
        return badRequest("Google accounts manage password via Google");
      }
      const currentPassword = String(body.currentPassword ?? "");
      const nextPassword = String(body.nextPassword ?? "");
      if (!user.password) return badRequest("No password set on this account");
      if (!currentPassword || !nextPassword) {
        return badRequest("Current and new password are required");
      }
      if (nextPassword.length < 6) {
        return badRequest("New password must be at least 6 characters");
      }
      const ok = await bcrypt.compare(currentPassword, user.password);
      if (!ok) return badRequest("Current password is incorrect");
      $set.password = await bcrypt.hash(nextPassword, 10);
    } else {
      return badRequest("Invalid section");
    }

    await User.findByIdAndUpdate(user._id, { $set });

    const updated = await User.findById(user._id).lean();
    return NextResponse.json({
      success: true,
      message: "Saved",
      ...serializeSeekerProfile(
        updated as Parameters<typeof serializeSeekerProfile>[0]
      ),
    });
  } catch (error) {
    console.error("Seeker profile PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save" },
      { status: 500 }
    );
  }
}
