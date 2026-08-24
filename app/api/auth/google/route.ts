import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { isUserRole } from "@/lib/roles";
import { setAuthCookie, signToken } from "@/lib/auth";
import { verifyFirebaseIdToken } from "@/lib/firebaseAdmin";

function badRequest(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const idToken = String(body.idToken ?? "");
    const roleInput = body.role ?? "user";

    if (!idToken) {
      return badRequest("Google idToken is required");
    }

    if (!isUserRole(roleInput) || roleInput === "admin") {
      return badRequest("Role must be user or recruiter");
    }

    const claims = await verifyFirebaseIdToken(idToken);

    // Google OAuth emails are trusted even if the claim flag is missing
    if (claims.email_verified === false) {
      return badRequest("Google email is not verified", 403);
    }

    await connectDB();

    const existing = await User.findOne({ email: claims.email }).select("+password");

    if (existing) {
      // Built-in email/password account cannot sign in with Google
      if (existing.authProvider === "local" || Boolean(existing.password)) {
        return badRequest(
          "This email is already registered with password. Please sign in with email and password.",
          409
        );
      }

      if (!existing.isActive) {
        return badRequest("Account is deactivated", 403);
      }

      if (!existing.googleId) {
        existing.googleId = claims.sub;
        await existing.save();
      }

      const token = await signToken({
        sub: String(existing._id),
        email: existing.email,
        role: existing.role,
        name: existing.name,
      });
      await setAuthCookie(token);

      return NextResponse.json({
        success: true,
        message: "Logged in with Google",
        user: {
          id: existing._id,
          name: existing.name,
          email: existing.email,
          role: existing.role,
          phone: existing.phone,
        },
      });
    }

    const displayName =
      (claims.name && claims.name.trim().length >= 2
        ? claims.name.trim()
        : claims.email.split("@")[0]) || "Google User";

    const user = await User.create({
      name: displayName.slice(0, 80),
      email: claims.email,
      authProvider: "google",
      googleId: claims.sub,
      role: roleInput,
      phone: "",
    });

    const token = await signToken({
      sub: String(user._id),
      email: user.email,
      role: user.role,
      name: user.name,
    });
    await setAuthCookie(token);

    return NextResponse.json(
      {
        success: true,
        message: "Registered with Google",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Google auth error:", error);
    const message =
      error instanceof Error && error.message.includes("Firebase")
        ? "Invalid Google session. Please try again."
        : "Google sign-in failed on server. Please try again.";
    return NextResponse.json({ success: false, message }, { status: 401 });
  }
}
