import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { setAuthCookie, signToken } from "@/lib/auth";

function badRequest(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return badRequest("Email and password are required");
    }

    await connectDB();

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return badRequest("Invalid email or password", 401);
    }

    if (!user.isActive) {
      return badRequest("Account is deactivated", 403);
    }

    if (user.authProvider === "google" || !user.password) {
      return badRequest(
        "This account uses Google sign-in. Please continue with Google.",
        400
      );
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return badRequest("Invalid email or password", 401);
    }

    const token = await signToken({
      sub: String(user._id),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: "Logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Login failed" },
      { status: 500 }
    );
  }
}
